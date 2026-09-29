const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const SubscriptionPackage = require('../models/SubscriptionPackage');
const UserSubscription = require('../models/UserSubscription');
const Device = require('../models/Device');
const PaymentMessage = require('../models/PaymentMessage');
const PaymentSession = require('../models/PaymentSession');
const SiteSetting = require('../models/SiteSetting');
const SmsLog = require('../models/SmsLog');
const SubscriptionPurchase = require('../models/SubscriptionPurchase');
const GlobalSetting = require('../models/GlobalSetting');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Restrict all routes in this file to super_admin
router.use(protect, authorize('super_admin'));

/**
 * GET /api/super-admin/sms-settings
 * Get SMS rate settings (per SMS cost in BDT)
 */
router.get('/sms-settings', async (req, res) => {
  try {
    let setting = await GlobalSetting.findOne({ key: 'sms_rate_settings' });
    if (!setting) {
      setting = await GlobalSetting.create({
        key: 'sms_rate_settings',
        smsPerRate: 0.50,
        minSmsPurchaseQty: 100,
      });
    }
    return res.json({ success: true, data: setting });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/super-admin/sms-settings
 * Update SMS per rate (BDT) and minimum purchase quantity
 */
router.put('/sms-settings', async (req, res) => {
  try {
    const { smsPerRate, minSmsPurchaseQty } = req.body;
    let setting = await GlobalSetting.findOne({ key: 'sms_rate_settings' });
    if (!setting) {
      setting = new GlobalSetting({ key: 'sms_rate_settings' });
    }
    if (smsPerRate !== undefined) setting.smsPerRate = Number(smsPerRate);
    if (minSmsPurchaseQty !== undefined) setting.minSmsPurchaseQty = Number(minSmsPurchaseQty);
    await setting.save();

    return res.json({ success: true, message: 'SMS rate settings updated successfully', data: setting });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/super-admin/dashboard-stats
 * Returns mother admin panel global metrics
 */
router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalCompanies = await User.countDocuments({ role: 'company_owner' });
    const activeCompanies = await User.countDocuments({ role: 'company_owner', status: 'active' });
    const totalAgents = await User.countDocuments({ role: 'agent' });
    const totalDevices = await Device.countDocuments({});
    const onlineDevices = await Device.countDocuments({ state: true });

    const activeSubscriptions = await UserSubscription.countDocuments({
      active: true,
      endDate: { $gt: new Date() },
    });

    const totalTransactions = await PaymentMessage.countDocuments({ verify: true });

    // Aggregate total verified volume
    const volumeAgg = await PaymentMessage.aggregate([
      { $match: { verify: true } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);
    const totalVolumeBDT = volumeAgg.length > 0 ? volumeAgg[0].totalAmount : 0;

    return res.json({
      success: true,
      data: {
        totalCompanies,
        activeCompanies,
        totalAgents,
        totalDevices,
        onlineDevices,
        activeSubscriptions,
        totalTransactions,
        totalVolumeBDT,
      },
    });
  } catch (err) {
    console.error('[SuperAdmin Stats Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 📦 SUBSCRIPTION PACKAGES MANAGEMENT
// ==========================================

/**
 * GET /api/super-admin/packages
 * List all subscription packages
 */
router.get('/packages', async (req, res) => {
  try {
    const packages = await SubscriptionPackage.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: packages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/super-admin/packages
 * Create a new subscription package
 */
router.post(
  '/packages',
  [
    body('title').notEmpty().withMessage('Package title is required'),
    body('durationMonths').isInt({ min: 1 }).withMessage('Duration in months is required'),
    body('price').isNumeric().withMessage('Offer Price is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const {
        title,
        durationMonths,
        regularPrice,
        price,
        maxAdminDevices,
        maxAgents,
        maxDevicesPerAgent,
        freeSmsCount,
        chargeType,
        chargeValue,
        features,
      } = req.body;

      const newPkg = new SubscriptionPackage({
        title,
        durationMonths,
        regularPrice: Number(regularPrice || price),
        price: Number(price),
        maxAdminDevices: Number(maxAdminDevices || 1),
        maxAgents: Number(maxAgents || 1),
        maxDevicesPerAgent: Number(maxDevicesPerAgent || 1),
        maxDevices: Number(maxAdminDevices || 1) + Number(maxAgents || 1) * Number(maxDevicesPerAgent || 1),
        freeSmsCount: Number(freeSmsCount !== undefined ? freeSmsCount : 1000),
        chargeType: chargeType === 'flat' ? 'flat' : 'percentage',
        chargeValue: Number(chargeValue || 0),
        features: Array.isArray(features) ? features : [],
      });

      await newPkg.save();
      return res.status(201).json({ success: true, message: 'Package created successfully', data: newPkg });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * PUT /api/super-admin/packages/:id
 * Update subscription package
 */
router.put('/packages/:id', async (req, res) => {
  try {
    const { maxAdminDevices, maxAgents, maxDevicesPerAgent } = req.body;
    const updateData = {
      ...req.body,
      ...(maxAdminDevices || maxAgents || maxDevicesPerAgent
        ? {
            maxDevices:
              Number(maxAdminDevices || 1) + Number(maxAgents || 1) * Number(maxDevicesPerAgent || 1),
          }
        : {}),
    };

    const pkg = await SubscriptionPackage.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    return res.json({ success: true, message: 'Package updated', data: pkg });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/super-admin/packages/:id
 * Delete subscription package
 */
router.delete('/packages/:id', async (req, res) => {
  try {
    await SubscriptionPackage.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Package deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 🏢 COMPANY OWNERS MANAGEMENT
// ==========================================

/**
 * GET /api/super-admin/companies
 * List all company owners with active subscriptions & device counts
 */
router.get('/companies', async (req, res) => {
  try {
    const companies = await User.find({ role: 'company_owner' }).sort({ createdAt: -1 }).lean();

    const result = await Promise.all(
      companies.map(async (comp) => {
        const sub = await UserSubscription.findOne({ companyOwner: comp._id, active: true })
          .populate('package')
          .lean();
        const deviceCount = await Device.countDocuments({ ownerCompany: comp._id });
        const agentCount = await User.countDocuments({ companyOwnerId: comp._id, role: 'agent' });

        return {
          ...comp,
          subscription: sub || null,
          deviceCount,
          agentCount,
        };
      })
    );

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/super-admin/companies
 * Create new Company Owner account & assign Subscription
 */
router.post(
  '/companies',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('companyName').notEmpty().withMessage('Company Name is required'),
    body('email').isEmail().withMessage('Valid Email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
    body('packageId').isMongoId().withMessage('Valid Package ID is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, companyName, email, phone, password, packageId } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const pkg = await SubscriptionPackage.findById(packageId);
      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Subscription package not found' });
      }

      // 1. Create User
      const companyUser = new User({
        name,
        companyName,
        email,
        phone,
        password,
        role: 'company_owner',
      });
      await companyUser.save();

      // 2. Create UserSubscription
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + pkg.durationMonths * 30 * 24 * 60 * 60 * 1000);
      const apiKey = UserSubscription.generateApiKey();

      const subscription = new UserSubscription({
        companyOwner: companyUser._id,
        package: pkg._id,
        apiKey,
        apiCallbackUrl: '',
        startDate,
        endDate,
        active: true,
        maxDevicesSnapshot: pkg.maxDevices,
        maxAgentsSnapshot: pkg.maxAgents,
      });
      await subscription.save();

      return res.status(201).json({
        success: true,
        message: 'Company Owner created & subscription assigned successfully',
        data: {
          user: companyUser,
          subscription,
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * PATCH /api/super-admin/companies/:id/status
 * Activate/Suspend company owner account
 */
router.patch('/companies/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    return res.json({ success: true, message: `Company status changed to ${status}`, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/super-admin/companies/:id/extend-subscription
 * Manually renew/extend company subscription
 */
router.post('/companies/:id/extend-subscription', async (req, res) => {
  try {
    const { packageId } = req.body;
    const pkg = await SubscriptionPackage.findById(packageId);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    let sub = await UserSubscription.findOne({ companyOwner: req.params.id, active: true });
    const now = new Date();
    let startDate = now;
    if (sub && new Date(sub.endDate) > now) {
      startDate = new Date(sub.endDate);
    }

    const endDate = new Date(startDate.getTime() + pkg.durationMonths * 30 * 24 * 60 * 60 * 1000);

    if (sub) {
      sub.package = pkg._id;
      sub.endDate = endDate;
      sub.maxDevicesSnapshot = pkg.maxDevices;
      sub.maxAgentsSnapshot = pkg.maxAgents;
      await sub.save();
    } else {
      sub = new UserSubscription({
        companyOwner: req.params.id,
        package: pkg._id,
        apiKey: UserSubscription.generateApiKey(),
        startDate: now,
        endDate,
        active: true,
        maxDevicesSnapshot: pkg.maxDevices,
        maxAgentsSnapshot: pkg.maxAgents,
      });
      await sub.save();
    }

    return res.json({ success: true, message: 'Subscription extended successfully', data: sub });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/super-admin/sms-logs
 * List all SMS Gateway logs (OTPs & sent SMS)
 */
router.get('/sms-logs', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const logs = await SmsLog.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await SmsLog.countDocuments({});

    return res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/super-admin/companies/:id
 * Single Company Details (User, Subscription, Devices, Agents)
 */
router.get('/companies/:id', async (req, res) => {
  try {
    const company = await User.findById(req.params.id).lean();
    if (!company || company.role !== 'company_owner') {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const subscription = await UserSubscription.findOne({ companyOwner: company._id, active: true })
      .populate('package')
      .lean();

    const devices = await Device.find({ ownerCompany: company._id }).sort({ createdAt: -1 });
    const agents = await User.find({ companyOwnerId: company._id, role: 'agent' }).select('-password');
    const purchases = await SubscriptionPurchase.find({ companyOwner: company._id }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: {
        company,
        subscription,
        devices,
        agents,
        purchases,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/super-admin/companies/:id
 * Update company details (Name, Company Name, Email, Phone, Password)
 */
router.put('/companies/:id', async (req, res) => {
  try {
    const { name, companyName, email, phone, password, status } = req.body;
    const company = await User.findById(req.params.id);
    if (!company || company.role !== 'company_owner') {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (name) company.name = name;
    if (companyName) company.companyName = companyName;
    if (email) company.email = email.toLowerCase();
    if (phone) company.phone = phone;
    if (status) company.status = status;
    if (password && password.trim().length >= 6) {
      company.password = password;
    }

    await company.save();

    // Package update if packageId provided
    const { packageId } = req.body;
    if (packageId) {
      const pkg = await SubscriptionPackage.findById(packageId);
      if (pkg) {
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + pkg.durationMonths * 30 * 24 * 60 * 60 * 1000);
        let sub = await UserSubscription.findOne({ companyOwner: company._id });
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
            companyOwner: company._id,
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
      }
    }

    return res.json({ success: true, message: 'Company profile updated successfully', data: company });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/super-admin/companies/:id
 * Delete company owner account and all associated resources
 */
router.delete('/companies/:id', async (req, res) => {
  try {
    const companyId = req.params.id;
    await User.findByIdAndDelete(companyId);
    await User.deleteMany({ companyOwnerId: companyId });
    await UserSubscription.deleteMany({ companyOwner: companyId });
    await Device.deleteMany({ ownerCompany: companyId });
    await SubscriptionPurchase.deleteMany({ companyOwner: companyId });

    return res.json({ success: true, message: 'Company account deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/super-admin/purchased-subscriptions
 * List all subscription purchases made by opay-personal companies
 */
router.get('/purchased-subscriptions', async (req, res) => {
  try {
    const purchases = await SubscriptionPurchase.find({})
      .populate('companyOwner', 'name companyName email phone status')
      .populate('package', 'title durationMonths price')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: purchases });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
