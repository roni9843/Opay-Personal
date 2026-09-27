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
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Restrict all routes in this file to super_admin
router.use(protect, authorize('super_admin'));

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

module.exports = router;
