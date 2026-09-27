const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const UserSubscription = require('../models/UserSubscription');
const SubscriptionPackage = require('../models/SubscriptionPackage');
const SmsLog = require('../models/SmsLog');
const { protect } = require('../middleware/authMiddleware');
const { sendOtpSms } = require('../utils/smsGateway');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

/**
 * POST /api/auth/send-otp
 * Send Phone Verification OTP
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const result = await sendOtpSms(phone);
    return res.json(result);
  } catch (err) {
    console.error('[Send OTP Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/auth/register-company
 * Public: Company Owner Sign Up / Register Profile with OTP verification
 */
router.post(
  '/register-company',
  [
    body('companyName').notEmpty().withMessage('Company name is required'),
    body('name').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').notEmpty().withMessage('Confirm password is required'),
    body('otp').notEmpty().withMessage('OTP is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const { companyName, name, email, phone, password, confirmPassword, otp } = req.body;

      if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
      }

      // Check if email already registered
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email address is already registered' });
      }

      // Format phone to check OTP log
      let formattedPhone = phone.trim().replace(/\D/g, '');
      if (!formattedPhone.startsWith('88')) {
        formattedPhone = '88' + formattedPhone;
      }

      // Verify OTP from recent SmsLog
      const latestOtpLog = await SmsLog.findOne({ recipient: formattedPhone, type: 'otp' }).sort({ createdAt: -1 });

      if (!latestOtpLog || latestOtpLog.otp !== otp.trim()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
      }

      // 1. Create Company Owner User
      const companyUser = new User({
        name,
        companyName,
        email: email.toLowerCase(),
        phone,
        password,
        role: 'company_owner',
        status: 'active',
      });
      await companyUser.save();

      const token = generateToken(companyUser._id);

      return res.status(201).json({
        success: true,
        message: 'Company Owner account created successfully',
        token,
        user: {
          id: companyUser._id,
          name: companyUser.name,
          email: companyUser.email,
          phone: companyUser.phone,
          role: companyUser.role,
          companyName: companyUser.companyName,
          status: companyUser.status,
        },
      });
    } catch (err) {
      console.error('Company Register Error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * POST /api/auth/login
 * Public: User Login (Super Admin, Company Owner, Agent)
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Account is inactive or suspended' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          companyName: user.companyName,
          companyOwnerId: user.companyOwnerId,
          status: user.status,
        },
      });
    } catch (err) {
      console.error('Login Error:', err);
      return res.status(500).json({ success: false, message: 'Server error during login' });
    }
  }
);

/**
 * GET /api/auth/me
 * Protected: Fetch current logged-in user profile
 */
router.get('/me', protect, async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

/**
 * PUT /api/auth/update-profile
 * Protected: Update profile details
 */
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, phone, companyName } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (companyName && user.role === 'company_owner') user.companyName = companyName;

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
