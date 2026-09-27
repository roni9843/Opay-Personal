const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const PaymentMethod = require('../models/PaymentMethod');
const PaymentMessage = require('../models/PaymentMessage');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Restrict to agents
router.use(protect, authorize('agent'));

/**
 * GET /api/agent/assigned-devices
 */
router.get('/assigned-devices', async (req, res) => {
  try {
    const devices = await Device.find({ assignedAgent: req.user.id }).sort({ createdAt: -1 });
    const deviceIds = devices.map((d) => d._id);

    const methods = await PaymentMethod.find({ device: { $in: deviceIds } });

    const result = devices.map((d) => {
      const deviceMethods = methods.filter((m) => String(m.device) === String(d._id));
      return {
        ...d.toObject(),
        paymentMethods: deviceMethods,
      };
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/agent/transactions
 */
router.get('/transactions', async (req, res) => {
  try {
    const devices = await Device.find({ assignedAgent: req.user.id }).select('deviceCode');
    const deviceCodes = devices.map((d) => d.deviceCode);

    const messages = await PaymentMessage.find({ deviceId: { $in: deviceCodes } })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ success: true, data: messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
