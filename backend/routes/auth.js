const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

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
