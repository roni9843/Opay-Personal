const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const UserSubscription = require('../models/UserSubscription');
const PaymentMethod = require('../models/PaymentMethod');
const PaymentMessage = require('../models/PaymentMessage');
const PaymentSession = require('../models/PaymentSession');
const { sendWebhookCallback } = require('../utils/webhookSender');

/**
 * POST /api/external/checkout/create
 * Header: X-API-Key: <company_api_key>
 * Body: { amount, customerRef, callbackUrl, successRedirectUrl }
 */
router.post('/checkout/create', async (req, res) => {
  try {
    const apiKey = req.header('X-API-Key') || req.body.apiKey;
    if (!apiKey) {
      return res.status(401).json({ success: false, message: 'Missing X-API-Key header' });
    }

    const { amount, customerRef, callbackUrl, successRedirectUrl } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive amount is required' });
    }

    if (!customerRef) {
      return res.status(400).json({ success: false, message: 'customerRef is required' });
    }

    // Validate Subscription & API Key
    const sub = await UserSubscription.findOne({ apiKey, apiKeyActive: true, active: true });
    if (!sub) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive API Key' });
    }

    if (new Date(sub.endDate) < new Date()) {
      return res.status(403).json({ success: false, message: 'Subscription has expired' });
    }

    // Generate Unique Session Token
    const sessionToken = 'SESS_' + crypto.randomBytes(16).toString('hex').toUpperCase();

    // Session valid for 20 minutes
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

    const session = new PaymentSession({
      sessionToken,
      companyOwner: sub.companyOwner,
      subscription: sub._id,
      amount: Number(amount),
      customerRef,
      callbackUrl: callbackUrl || sub.apiCallbackUrl || '',
      successRedirectUrl: successRedirectUrl || '',
      expiresAt,
    });

    await session.save();

    const baseUrl = process.env.PAYMENT_GATEWAY_DOMAIN || `${req.protocol}://${req.get('host')}`;
    const paymentUrl = `${baseUrl}/checkout/${sessionToken}`;

    return res.status(201).json({
      success: true,
      sessionToken,
      amount: session.amount,
      customerRef: session.customerRef,
      payment_url: paymentUrl,
      expiresAt: session.expiresAt,
      expiresInSeconds: 1200,
    });
  } catch (err) {
    console.error('Checkout Create Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/external/checkout/resolve/:sessionToken
 * Public endpoint called by Payment Checkout Page UI
 */
router.get('/checkout/resolve/:sessionToken', async (req, res) => {
  try {
    const { sessionToken } = req.params;

    const session = await PaymentSession.findOne({ sessionToken }).populate('companyOwner', 'companyName name');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Payment session not found' });
    }

    if (session.status === 'paid') {
      return res.json({
        success: true,
        status: 'paid',
        message: 'Payment already completed',
        session: {
          sessionToken: session.sessionToken,
          amount: session.amount,
          customerRef: session.customerRef,
          trxID: session.trxID,
          paymentMethod: session.paymentMethod,
          companyName: session.companyOwner?.companyName || 'Opay Merchant',
          successRedirectUrl: session.successRedirectUrl,
        },
      });
    }

    if (new Date() > new Date(session.expiresAt)) {
      session.status = 'expired';
      await session.save();
      return res.status(410).json({ success: false, status: 'expired', message: 'Payment link has expired' });
    }

    // Fetch active Payment Methods for this Company
    const methods = await PaymentMethod.find({
      ownerCompany: session.companyOwner._id,
      status: 'active',
    }).select('provider gateway accountNumber simIndex');

    return res.json({
      success: true,
      status: session.status,
      session: {
        sessionToken: session.sessionToken,
        amount: session.amount,
        customerRef: session.customerRef,
        companyName: session.companyOwner?.companyName || 'Opay Merchant',
        expiresAt: session.expiresAt,
        paymentMethods: methods,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/external/checkout/verify/:sessionToken
 * Public endpoint called when customer enters TrxID on the checkout page
 * Body: { trxID, provider }
 */
router.post('/checkout/verify/:sessionToken', async (req, res) => {
  try {
    const { sessionToken } = req.params;
    const { trxID, provider } = req.body;

    if (!trxID || typeof trxID !== 'string' || !trxID.trim()) {
      return res.status(400).json({ success: false, message: 'Transaction ID (TrxID) is required' });
    }

    const session = await PaymentSession.findOne({ sessionToken });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    if (session.status === 'paid') {
      return res.json({ success: true, status: 'paid', message: 'Payment already verified', trxID: session.trxID });
    }

    if (new Date() > new Date(session.expiresAt)) {
      return res.status(410).json({ success: false, message: 'Payment session expired' });
    }

    const cleanTrxID = trxID.trim();

    // 1. Search PaymentMessage in database
    const msg = await PaymentMessage.findOne({
      trxID: new RegExp(`^${cleanTrxID}$`, 'i'),
      ownerCompany: session.companyOwner,
    });

    if (!msg) {
      return res.status(200).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Transaction ID not found yet. Please make sure you sent the money and try again.',
      });
    }

    // Check if already used by another session
    if (msg.verify && msg.apiAccessToken && String(msg.apiAccessToken) !== String(session._id)) {
      return res.status(200).json({
        success: false,
        code: 'ALREADY_USED',
        message: 'This Transaction ID has already been used for another payment.',
      });
    }

    // Check Amount match
    if (Math.abs(Number(msg.amount) - Number(session.amount)) > 0.01) {
      return res.status(200).json({
        success: false,
        code: 'AMOUNT_MISMATCH',
        message: `Amount mismatch. Expected ${session.amount} BDT, but received ${msg.amount} BDT in this transaction.`,
      });
    }

    // 2. Mark Payment verified
    msg.verify = true;
    msg.apiAccessToken = session._id;
    await msg.save();

    session.status = 'paid';
    session.trxID = msg.trxID;
    session.paymentMethod = provider || msg.provider || 'bkash';
    session.matchedMessage = msg._id;
    await session.save();

    // 3. Dispatch Webhook Callback
    if (session.callbackUrl) {
      const webhookPayload = {
        event: 'payment.success',
        sessionToken: session.sessionToken,
        customerRef: session.customerRef,
        amount: session.amount,
        trxID: msg.trxID,
        provider: session.paymentMethod,
        senderNumber: msg.from,
        timestamp: new Date().toISOString(),
      };

      sendWebhookCallback(session.callbackUrl, webhookPayload)
        .then((ok) => {
          session.webhookStatus = ok ? 'sent' : 'failed';
          session.save();
        })
        .catch(() => {});
    }

    return res.json({
      success: true,
      status: 'paid',
      message: 'Payment verified successfully!',
      data: {
        sessionToken: session.sessionToken,
        amount: session.amount,
        trxID: msg.trxID,
        provider: session.paymentMethod,
        successRedirectUrl: session.successRedirectUrl,
      },
    });
  } catch (err) {
    console.error('Verify Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
