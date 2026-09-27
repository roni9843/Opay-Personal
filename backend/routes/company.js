const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const UserSubscription = require('../models/UserSubscription');
const Device = require('../models/Device');
const PaymentMethod = require('../models/PaymentMethod');
const PaymentMessage = require('../models/PaymentMessage');
const PaymentSession = require('../models/PaymentSession');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Restrict all routes in this file to company_owner
router.use(protect, authorize('company_owner'));

/**
 * GET /api/company/dashboard-stats
 */
router.get('/dashboard-stats', async (req, res) => {
  try {
    const ownerId = req.user.id;

    const sub = await UserSubscription.findOne({ companyOwner: ownerId, active: true }).populate('package');

    const totalDevices = await Device.countDocuments({ ownerCompany: ownerId });
    const onlineDevices = await Device.countDocuments({ ownerCompany: ownerId, state: true });
    const totalAgents = await User.countDocuments({ companyOwnerId: ownerId, role: 'agent' });
    const totalPaymentMethods = await PaymentMethod.countDocuments({ ownerCompany: ownerId });

    // Today's Date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayMessages = await PaymentMessage.find({
      ownerCompany: ownerId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).select('amount verify');

    const todayTotalVolume = todayMessages.reduce((sum, m) => sum + (m.amount || 0), 0);
    const todayVerifiedCount = todayMessages.filter((m) => m.verify).length;

    return res.json({
      success: true,
      data: {
        subscription: sub || null,
        totalDevices,
        onlineDevices,
        totalAgents,
        totalPaymentMethods,
        todayTotalVolume,
        todayVerifiedCount,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 🧑‍💼 AGENTS MANAGEMENT
// ==========================================

/**
 * GET /api/company/agents
 */
router.get('/agents', async (req, res) => {
  try {
    const agents = await User.find({ companyOwnerId: req.user.id, role: 'agent' })
      .select('-password')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: agents });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/company/agents
 * Create new Agent account
 */
router.post(
  '/agents',
  [
    body('name').notEmpty().withMessage('Agent name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, phone, password } = req.body;

      // Check package limits
      const sub = await UserSubscription.findOne({ companyOwner: req.user.id, active: true });
      if (!sub) {
        return res.status(403).json({ success: false, message: 'No active subscription found' });
      }

      const currentAgentCount = await User.countDocuments({ companyOwnerId: req.user.id, role: 'agent' });
      if (currentAgentCount >= sub.maxAgentsSnapshot) {
        return res.status(400).json({
          success: false,
          message: `Agent limit reached (${currentAgentCount}/${sub.maxAgentsSnapshot}). Upgrade your package to add more agents.`,
        });
      }

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      }

      const agent = new User({
        name,
        email: email.toLowerCase(),
        phone,
        password,
        role: 'agent',
        companyOwnerId: req.user.id,
        companyName: req.user.companyName,
      });

      await agent.save();

      return res.status(201).json({
        success: true,
        message: 'Agent account created successfully',
        data: {
          id: agent._id,
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          status: agent.status,
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * PATCH /api/company/agents/:id/status
 */
router.patch('/agents/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const agent = await User.findOneAndUpdate(
      { _id: req.params.id, companyOwnerId: req.user.id },
      { status },
      { new: true }
    ).select('-password');

    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
    return res.json({ success: true, message: `Agent status updated to ${status}`, data: agent });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 📱 DEVICES MANAGEMENT
// ==========================================

/**
 * GET /api/company/devices
 */
router.get('/devices', async (req, res) => {
  try {
    const devices = await Device.find({ ownerCompany: req.user.id })
      .populate('assignedAgent', 'name email phone')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: devices });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/company/devices/:id/assign-agent
 */
router.patch('/devices/:id/assign-agent', async (req, res) => {
  try {
    const { agentId } = req.body;
    const device = await Device.findOne({ _id: req.params.id, ownerCompany: req.user.id });
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });

    if (agentId) {
      const agent = await User.findOne({ _id: agentId, companyOwnerId: req.user.id });
      if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
      device.assignedAgent = agent._id;
    } else {
      device.assignedAgent = null;
    }

    await device.save();
    return res.json({ success: true, message: 'Device agent updated', data: device });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 💳 PAYMENT METHODS (SIM NUMBERS) MANAGEMENT
// ==========================================

/**
 * GET /api/company/payment-methods
 */
router.get('/payment-methods', async (req, res) => {
  try {
    const methods = await PaymentMethod.find({ ownerCompany: req.user.id })
      .populate('device', 'deviceName deviceCode state')
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: methods });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/company/payment-methods
 */
router.post(
  '/payment-methods',
  [
    body('deviceId').isMongoId().withMessage('Valid Device ID required'),
    body('provider').isIn(['bkash', 'nagad', 'rocket', 'upay']).withMessage('Valid provider required'),
    body('accountNumber').notEmpty().withMessage('Account Number required'),
    body('simIndex').isIn([1, 2]).withMessage('SIM Index must be 1 or 2'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    try {
      const { deviceId, provider, gateway, accountNumber, simIndex, assignedAgentId } = req.body;

      const device = await Device.findOne({ _id: deviceId, ownerCompany: req.user.id });
      if (!device) return res.status(404).json({ success: false, message: 'Device not found' });

      // Check duplicate SIM on same device
      const existing = await PaymentMethod.findOne({ device: deviceId, simIndex });
      if (existing) {
        existing.provider = provider;
        existing.gateway = gateway || 'personal';
        existing.accountNumber = accountNumber;
        existing.assignedAgent = assignedAgentId || device.assignedAgent || null;
        await existing.save();
        return res.json({ success: true, message: 'Payment method updated', data: existing });
      }

      const method = new PaymentMethod({
        ownerCompany: req.user.id,
        device: device._id,
        assignedAgent: assignedAgentId || device.assignedAgent || null,
        provider,
        gateway: gateway || 'personal',
        accountNumber,
        simIndex,
      });

      await method.save();
      return res.status(201).json({ success: true, message: 'Payment method added successfully', data: method });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ==========================================
// 🔑 API SETTINGS & WEBHOOK CONFIGURATION
// ==========================================

/**
 * GET /api/company/api-settings
 */
router.get('/api-settings', async (req, res) => {
  try {
    const sub = await UserSubscription.findOne({ companyOwner: req.user.id, active: true }).populate('package');
    if (!sub) return res.status(404).json({ success: false, message: 'No active subscription' });

    return res.json({
      success: true,
      data: {
        apiKey: sub.apiKey,
        apiKeyActive: sub.apiKeyActive,
        apiCallbackUrl: sub.apiCallbackUrl || '',
        startDate: sub.startDate,
        endDate: sub.endDate,
        package: sub.package,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/company/regenerate-api-key
 */
router.post('/regenerate-api-key', async (req, res) => {
  try {
    const sub = await UserSubscription.findOne({ companyOwner: req.user.id, active: true });
    if (!sub) return res.status(404).json({ success: false, message: 'No active subscription' });

    sub.apiKey = UserSubscription.generateApiKey();
    sub.apiKeyActive = true;
    await sub.save();

    return res.json({ success: true, message: 'API key regenerated successfully', apiKey: sub.apiKey });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/company/update-webhook
 */
router.put('/update-webhook', async (req, res) => {
  try {
    const { apiCallbackUrl } = req.body;
    const sub = await UserSubscription.findOne({ companyOwner: req.user.id, active: true });
    if (!sub) return res.status(404).json({ success: false, message: 'No active subscription' });

    sub.apiCallbackUrl = apiCallbackUrl || '';
    await sub.save();

    return res.json({ success: true, message: 'Webhook Callback URL updated', apiCallbackUrl: sub.apiCallbackUrl });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 📊 TRANSACTIONS REPORTING
// ==========================================

/**
 * GET /api/company/transactions
 */
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20, trxID, provider } = req.query;
    const query = { ownerCompany: req.user.id };

    if (trxID) query.trxID = new RegExp(trxID.trim(), 'i');
    if (provider) query.provider = provider.toLowerCase();

    const messages = await PaymentMessage.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await PaymentMessage.countDocuments(query);

    return res.json({
      success: true,
      data: messages,
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
