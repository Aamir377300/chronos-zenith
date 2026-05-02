const DailyStats = require('../models/DailyStats');
const User = require('../models/User');

/**
 * GET /stats/:date
 * Returns DailyStats for a specific date
 */
const getStatsByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const stats = await DailyStats.findOne({ userId: req.user._id, date });

    if (!stats) {
      // Return zeroed stats if no data yet
      return res.json({
        success: true,
        data: {
          date,
          totalTasks: 0,
          completedTasks: 0,
          totalScore: 0,
          achievedScore: 0,
          bonusApplied: false,
        },
      });
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /stats/history
 * Returns last 30 days of stats for the authenticated user
 */
const getStatsHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 30;

    const history = await DailyStats.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(limit);

    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        history,
        currentStreak: user.currentStreak,
        lastCompletedDate: user.lastCompletedDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStatsByDate, getStatsHistory };
