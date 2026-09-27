const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const PaymentMessage = require('../models/PaymentMessage');
const UserSubscription = require('../models/UserSubscription');
const { parseTransactionText } = require('../utils/smsParser');

/**
 * POST /api/devices/activate
 * Activate device from Android App (using Android Secure ID & Company API Key or Activation code)
 */
router.post('/activate', async (req, res) => {
  try {
    const { deviceCode, deviceName, apiKey } = req.body;

    if (!deviceCode || !deviceName) {
      return res.status(422).json({ success: false, message: 'deviceCode and deviceName are required' });
    }

    let ownerCompanyId = null;
    let subscriptionId = null;

    if (apiKey) {
      const sub = await UserSubscription.findOne({ apiKey, active: true });
      if (sub && new Date(sub.endDate) > new Date()) {
        ownerCompanyId = sub.companyOwner;
        subscriptionId = sub._id;
      }
    }

    let device = await Device.findOne({ deviceCode });
    if (device) {
      device.deviceName = deviceName;
      device.state = true;
      if (ownerCompanyId) {
        device.ownerCompany = ownerCompanyId;
        device.subscription = subscriptionId;
      }
      await device.save();
    } else {
      if (!ownerCompanyId) {
        return res.status(400).json({
          success: false,
          message: 'Valid Company API Key is required to activate a new device',
        });
      }

      device = new Device({
        deviceCode,
        deviceName,
        ownerCompany: ownerCompanyId,
        subscription: subscriptionId,
        state: true,
      });
      await device.save();
    }

    return res.json({
      success: true,
      message: 'Device activated successfully',
      data: {
        id: device._id,
        deviceCode: device.deviceCode,
        deviceName: device.deviceName,
        state: device.state,
      },
    });
  } catch (err) {
    console.error('Device Activate Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/devices/send-payment-message
 * Called by Native Android App to upload received SMS or Notifications
 */
router.post('/send-payment-message', async (req, res) => {
  try {
    const messages = Array.isArray(req.body) ? req.body : [req.body];
    const savedMessages = [];

    for (const msgData of messages) {
      const { text, fullMessage, device_id, deviceCode, device_name, deviceName, timestamp } = msgData;

      const rawText = text || fullMessage || '';
      const dCode = device_id || deviceCode || 'unknown_device';
      const dName = device_name || deviceName || 'Android App';

      if (!rawText) continue;

      const parsed = parseTransactionText(rawText);

      // Find owner company from device
      const deviceDoc = await Device.findOne({ deviceCode: dCode });
      const ownerCompany = deviceDoc ? deviceDoc.ownerCompany : null;

      // Only save if Amount & TrxID exist
      if (parsed.amount && parsed.trxID) {
        // Prevent duplicate TrxID entry
        let existing = await PaymentMessage.findOne({ trxID: parsed.trxID });
        if (!existing) {
          const newMsg = new PaymentMessage({
            amount: parsed.amount,
            from: parsed.from,
            fullMessage: rawText,
            trxID: parsed.trxID,
            provider: parsed.provider,
            date: parsed.date,
            time: parsed.time,
            deviceId: dCode,
            deviceName: dName,
            ownerCompany,
            deviceTime: timestamp || new Date().toISOString(),
          });

          await newMsg.save();
          savedMessages.push(newMsg);
          console.log(`[SMS Received] TrxID: ${parsed.trxID} | Amount: ${parsed.amount} BDT | Device: ${dName}`);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `${savedMessages.length} message(s) processed`,
      count: savedMessages.length,
      data: savedMessages,
    });
  } catch (err) {
    console.error('[Device Send SMS Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
