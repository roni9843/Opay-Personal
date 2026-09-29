const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const SubscriptionPackage = require('../models/SubscriptionPackage');
const UserSubscription = require('../models/UserSubscription');
const SubscriptionPurchase = require('../models/SubscriptionPurchase');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const OPAY_BUSINESS_TOKEN = process.env.OPAY_BUSINESS_TOKEN || '4e6e3b608649c71c262472c51050e55113c58973b9b110b1';
const OPAY_BUSINESS_API_URL = process.env.OPAY_BUSINESS_API_URL || 'https://api.oraclepay.org/api/opay-business/generate-payment-page';

/**
 * GET /api/payment/public-packages
 * Public / Protected for O-Pay Personal: List all active subscription packages available for purchase
 */
router.get('/public-packages', async (req, res) => {
  try {
    const packages = await SubscriptionPackage.find({ active: true }).sort({ price: 1 });
    return res.json({ success: true, data: packages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/payment/purchase-package
 * Protected: Company Owner initiates package purchase via OraclePay Business Gateway
 */
router.post('/purchase-package', protect, authorize('company_owner'), async (req, res) => {
  try {
    const { packageId } = req.body;
    if (!packageId) {
      return res.status(400).json({ success: false, message: 'Package ID is required' });
    }

    const pkg = await SubscriptionPackage.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const invoiceNumber = `INV-SUB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payload = {
      payment_amount: Number(pkg.price),
      user_identity_address: req.user.email,
      callback_url: `${req.protocol}://${req.get('host')}/api/payment/opay-webhook`,
      success_redirect_url: `http://localhost:5174/packages?status=success&invoice=${invoiceNumber}`,
      invoice_number: invoiceNumber,
      checkout_items: {
        packageId: pkg._id.toString(),
        companyOwnerId: req.user.id.toString(),
        packageTitle: pkg.title,
      },
    };

    let paymentPageUrl = '';
    let sessionCode = '';

    try {
      const response = await axios.post(OPAY_BUSINESS_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Opay-Business-Token': OPAY_BUSINESS_TOKEN,
        },
        timeout: 10000,
      });

      if (response.data && response.data.success) {
        paymentPageUrl = response.data.payment_page_url;
        sessionCode = response.data.short_code || response.data.session_code || '';
      }
    } catch (apiErr) {
      console.warn('[OraclePay Gateway Call Warning]: Using fallback checkout page URL due to gateway connection:', apiErr.message);
      paymentPageUrl = `https://pay.opay.com/payment/${invoiceNumber}`;
    }

    // Save pending purchase in DB
    const purchase = new SubscriptionPurchase({
      companyOwner: req.user.id,
      package: pkg._id,
      invoiceNumber,
      sessionCode,
      amount: pkg.price,
      status: 'PENDING',
      paymentPageUrl,
    });
    await purchase.save();

    return res.json({
      success: true,
      message: 'Payment page generated successfully',
      payment_page_url: paymentPageUrl,
      invoiceNumber,
    });
  } catch (err) {
    console.error('[Purchase Package Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/payment/opay-webhook
 * Public: Incoming Webhook from OraclePay Business API
 */
router.post('/opay-webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('[OraclePay Webhook Received]:', JSON.stringify(webhookData, null, 2));

    const {
      status,
      amount,
      transaction_id,
      invoice_number,
      session_code,
      user_identity,
      checkout_items,
      bank,
      proof_images,
    } = webhookData;

    let purchase = null;

    if (invoice_number) {
      purchase = await SubscriptionPurchase.findOne({ invoiceNumber: invoice_number });
    }

    if (!purchase && user_identity) {
      const user = await User.findOne({ email: user_identity.toLowerCase() });
      if (user) {
        purchase = await SubscriptionPurchase.findOne({ companyOwner: user._id }).sort({ createdAt: -1 });
      }
    }

    if (purchase) {
      purchase.status = status || purchase.status;
      if (transaction_id) purchase.transactionId = transaction_id;
      if (session_code) purchase.sessionCode = session_code;
      if (bank) purchase.bank = bank;
      if (proof_images) purchase.proofImages = proof_images;
      purchase.rawWebhookData = webhookData;
      await purchase.save();
    }

    // If payment status is COMPLETED, activate the user subscription!
    if (status === 'COMPLETED' || status === 'SUCCESS') {
      let companyOwnerId = purchase ? purchase.companyOwner : null;
      let packageId = purchase ? purchase.package : null;

      if (!companyOwnerId && checkout_items && checkout_items.companyOwnerId) {
        companyOwnerId = checkout_items.companyOwnerId;
      }
      if (!packageId && checkout_items && checkout_items.packageId) {
        packageId = checkout_items.packageId;
      }

      if (!companyOwnerId && user_identity) {
        const user = await User.findOne({ email: user_identity.toLowerCase() });
        if (user) companyOwnerId = user._id;
      }

      if (companyOwnerId) {
        let pkg = null;
        if (packageId) {
          pkg = await SubscriptionPackage.findById(packageId);
        }
        if (!pkg) {
          pkg = await SubscriptionPackage.findOne({ active: true }).sort({ price: 1 });
        }

        if (pkg) {
          const startDate = new Date();
          const endDate = new Date(startDate.getTime() + pkg.durationMonths * 30 * 24 * 60 * 60 * 1000);

          let sub = await UserSubscription.findOne({ companyOwner: companyOwnerId });
          if (sub) {
            sub.package = pkg._id;
            sub.startDate = startDate;
            sub.endDate = endDate;
            sub.active = true;
            sub.maxAdminDevicesSnapshot = pkg.maxAdminDevices;
            sub.maxAgentsSnapshot = pkg.maxAgents;
            sub.maxDevicesPerAgentSnapshot = pkg.maxDevicesPerAgent;
            sub.maxDevicesSnapshot = pkg.maxDevices;
            await sub.save();
          } else {
            sub = new UserSubscription({
              companyOwner: companyOwnerId,
              package: pkg._id,
              apiKey: UserSubscription.generateApiKey(),
              startDate,
              endDate,
              active: true,
              maxAdminDevicesSnapshot: pkg.maxAdminDevices,
              maxAgentsSnapshot: pkg.maxAgents,
              maxDevicesPerAgentSnapshot: pkg.maxDevicesPerAgent,
              maxDevicesSnapshot: pkg.maxDevices,
            });
            await sub.save();
          }
          console.log(`✅ Subscription ACTIVATED for company owner ID: ${companyOwnerId}`);
        }
      }
    }

    return res.json({ success: true, message: 'Webhook processed successfully' });
  } catch (err) {
    console.error('[Webhook Processing Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/payment/simulate-activation
 * Protected: Allows immediate package activation during testing
 */
router.post('/simulate-activation', protect, authorize('company_owner'), async (req, res) => {
  try {
    const { packageId } = req.body;
    const pkg = await SubscriptionPackage.findById(packageId);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + pkg.durationMonths * 30 * 24 * 60 * 60 * 1000);

    let sub = await UserSubscription.findOne({ companyOwner: req.user.id });
    if (sub) {
      sub.package = pkg._id;
      sub.startDate = startDate;
      sub.endDate = endDate;
      sub.active = true;
      sub.maxAdminDevicesSnapshot = pkg.maxAdminDevices;
      sub.maxAgentsSnapshot = pkg.maxAgents;
      sub.maxDevicesPerAgentSnapshot = pkg.maxDevicesPerAgent;
      sub.maxDevicesSnapshot = pkg.maxDevices;
      await sub.save();
    } else {
      sub = new UserSubscription({
        companyOwner: req.user.id,
        package: pkg._id,
        apiKey: UserSubscription.generateApiKey(),
        startDate,
        endDate,
        active: true,
        maxAdminDevicesSnapshot: pkg.maxAdminDevices,
        maxAgentsSnapshot: pkg.maxAgents,
        maxDevicesPerAgentSnapshot: pkg.maxDevicesPerAgent,
        maxDevicesSnapshot: pkg.maxDevices,
      });
      await sub.save();
    }

    const purchase = new SubscriptionPurchase({
      companyOwner: req.user.id,
      package: pkg._id,
      invoiceNumber: `INV-DIRECT-${Date.now()}`,
      amount: pkg.price,
      status: 'COMPLETED',
      bank: 'auto_deposit',
      transactionId: `TRX-${Date.now()}`,
    });
    await purchase.save();

    return res.json({
      success: true,
      message: 'Subscription package activated successfully!',
      subscription: sub,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
