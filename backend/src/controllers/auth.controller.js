const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * POST /auth/register
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const existing = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        currentStreak: user.currentStreak,
        totalRating: user.totalRating,
        totalTasksCompleted: user.totalTasksCompleted,
        totalTasksAssigned: user.totalTasksAssigned,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/login
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        currentStreak: user.currentStreak,
        totalRating: user.totalRating,
        totalTasksCompleted: user.totalTasksCompleted,
        totalTasksAssigned: user.totalTasksAssigned,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        currentStreak: user.currentStreak,
        lastCompletedDate: user.lastCompletedDate,
        totalRating: user.totalRating,
        totalTasksCompleted: user.totalTasksCompleted,
        totalTasksAssigned: user.totalTasksAssigned,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
