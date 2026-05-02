const mongoose = require('mongoose');

const dailyStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    totalTasks: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    // totalScore = totalTasks * 10
    totalScore: {
      type: Number,
      default: 0,
    },
    // achievedScore = completedTasks * 10 (+ bonus if applicable)
    achievedScore: {
      type: Number,
      default: 0,
    },
    bonusApplied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Unique constraint: one stats doc per user per day
dailyStatsSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyStats', dailyStatsSchema);
