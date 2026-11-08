const { getOrCreateOwner } = require('../utils/owner');

/**
 * GET /me — singleton owner profile (streak / rating)
 */
const getMe = async (req, res, next) => {
  try {
    const user = req.user || (await getOrCreateOwner());
    res.json({
      success: true,
      user: {
        id: user._id,
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

module.exports = { getMe };
