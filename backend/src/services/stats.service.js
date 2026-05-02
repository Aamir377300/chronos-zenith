const Task = require('../models/Task');
const DailyStats = require('../models/DailyStats');
const User = require('../models/User');
const { yesterdayString, areConsecutiveDays } = require('../utils/dateHelpers');

const POINTS_PER_TASK = 1;
const STREAK_BONUS = 1;
const MISSED_DAY_PENALTY = 1;

/**
 * Recalculate and persist DailyStats for a given user + date.
 * Handles streak logic, bonus, missed-day penalty, and all-time rating.
 *
 * @param {string} userId
 * @param {string} date  - YYYY-MM-DD
 * @returns {Promise<DailyStats>}
 */
const recalculateStats = async (userId, date) => {
  const tasks = await Task.find({ userId, date });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const totalScore = totalTasks * POINTS_PER_TASK;
  const baseAchievedScore = completedTasks * POINTS_PER_TASK;

  let bonusApplied = false;
  let achievedScore = baseAchievedScore;

  const isFullCompletion = totalTasks > 0 && completedTasks === totalTasks;
  const user = await User.findById(userId);
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  dateObj.setDate(dateObj.getDate() - 1);
  const yYear = dateObj.getFullYear();
  const yMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yDay = String(dateObj.getDate()).padStart(2, '0');
  const yesterday = `${yYear}-${yMonth}-${yDay}`;

  // Fetch the previous DailyStats for this date (before this recalculation)
  // so we can compute the delta for the all-time rating.
  const prevStats = await DailyStats.findOne({ userId, date });
  const prevCompleted = prevStats?.completedTasks ?? 0;
  const prevTotal = prevStats?.totalTasks ?? 0;
  const prevBonus = prevStats?.bonusApplied ?? false;

  if (isFullCompletion) {
    const isConsecutive = user.lastCompletedDate && areConsecutiveDays(user.lastCompletedDate, date);

    const yesterdayStats = await DailyStats.findOne({ userId, date: yesterday });
    const yesterdayWasPerfect =
      yesterdayStats &&
      yesterdayStats.totalTasks > 0 &&
      yesterdayStats.completedTasks === yesterdayStats.totalTasks;

    if (yesterdayWasPerfect && isConsecutive) {
      bonusApplied = true;
    }

    // --- Streak ---
    let newStreak;
    if (!user.lastCompletedDate) {
      newStreak = 1;
    } else if (user.lastCompletedDate === date) {
      newStreak = user.currentStreak || 1;
    } else if (isConsecutive) {
      newStreak = (user.currentStreak || 0) + 1;
    } else {
      newStreak = 1;
    }

    // --- All-time rating delta ---
    // Points gained this recalculation vs what was stored before
    const prevAchieved = (prevCompleted * POINTS_PER_TASK) + (prevBonus ? STREAK_BONUS : 0);
    const newAchieved = baseAchievedScore + (bonusApplied ? STREAK_BONUS : 0);
    const ratingDelta = newAchieved - prevAchieved;

    // All-time task counters delta
    const completedDelta = completedTasks - prevCompleted;
    const totalDelta = totalTasks - prevTotal;

    // Missed-day penalty: if the user had tasks yesterday but didn't complete them all,
    // and today is the first time we're processing a new day after that gap.
    // We detect this when lastCompletedDate is not yesterday and yesterday had incomplete tasks.
    let penalty = 0;
    if (user.lastCompletedDate && user.lastCompletedDate !== date && !isConsecutive) {
      // There's a gap — check if yesterday had assigned tasks that weren't all completed
      if (yesterdayStats && yesterdayStats.totalTasks > 0 &&
          yesterdayStats.completedTasks < yesterdayStats.totalTasks) {
        penalty = MISSED_DAY_PENALTY;
      }
    }

    await User.findByIdAndUpdate(userId, {
      currentStreak: newStreak,
      lastCompletedDate: date,
      $inc: {
        totalRating: ratingDelta - penalty,
        totalTasksCompleted: completedDelta,
        totalTasksAssigned: totalDelta,
      },
    });

  } else {
    // --- Not full completion ---

    // All-time task counters delta (tasks may have been added/removed)
    const prevAchieved = (prevCompleted * POINTS_PER_TASK) + (prevBonus ? STREAK_BONUS : 0);
    const newAchieved = baseAchievedScore; // no bonus since not full completion
    const ratingDelta = newAchieved - prevAchieved;
    const completedDelta = completedTasks - prevCompleted;
    const totalDelta = totalTasks - prevTotal;

    const userUpdate = {
      $inc: {
        totalRating: ratingDelta,
        totalTasksCompleted: completedDelta,
        totalTasksAssigned: totalDelta,
      },
    };

    if (user.lastCompletedDate === date) {
      // User un-toggled a task on a day they had fully completed — restore streak
      const yesterdayStats = await DailyStats.findOne({ userId, date: yesterday });
      const yesterdayWasPerfect =
        yesterdayStats &&
        yesterdayStats.totalTasks > 0 &&
        yesterdayStats.completedTasks === yesterdayStats.totalTasks;

      const restoredStreak = yesterdayWasPerfect
        ? Math.max((user.currentStreak || 1) - 1, 1)
        : 0;

      userUpdate.currentStreak = restoredStreak;
      userUpdate.lastCompletedDate = yesterdayWasPerfect ? yesterday : null;
    }

    await User.findByIdAndUpdate(userId, userUpdate);
  }

  const stats = await DailyStats.findOneAndUpdate(
    { userId, date },
    { totalTasks, completedTasks, totalScore, achievedScore, bonusApplied },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return stats;
};

module.exports = { recalculateStats };
