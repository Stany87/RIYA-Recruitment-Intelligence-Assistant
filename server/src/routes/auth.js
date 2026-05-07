const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Agency = require('../models/Agency');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/v1/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, agencyName } = req.body;

    // Validate required fields
    if (!name || !email || !password || !agencyName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and agency name.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create the Agency (tenant root)
    const agency = await Agency.create({ name: agencyName });

    // Create user linked to agency — first user is admin
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      agencyName,
      agencyId: agency._id,
      role: 'admin',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user and include passwordHash for comparison
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Backfill: if user has no agencyId (created before Agency model), create one
    if (!user.agencyId && user.agencyName) {
      const agency = await Agency.create({ name: user.agencyName });
      user.agencyId = agency._id;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/auth/me — Get current user (protected)
router.get('/me', auth, async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user.toJSON() },
  });
});

module.exports = router;
