const User = require('../models/User');

const OWNER_EMAIL = 'owner@chronos.local';

/**
 * Single-user owner document used for streak / rating / task ownership.
 * Reuses the first existing user if present (preserves seeded data).
 */
const getOrCreateOwner = async () => {
  let owner = await User.findOne().sort({ createdAt: 1 });
  if (owner) return owner;

  owner = await User.create({
    email: OWNER_EMAIL,
    password: 'unused-single-user',
    currentStreak: 0,
    totalRating: 0,
    totalTasksCompleted: 0,
    totalTasksAssigned: 0,
  });
  return owner;
};

module.exports = { getOrCreateOwner, OWNER_EMAIL };
