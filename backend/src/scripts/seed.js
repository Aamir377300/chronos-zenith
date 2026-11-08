/**
 * Seed script — populates the DB with the single owner and sample tasks
 * Run: node src/scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const DailyStats = require('../models/DailyStats');
const { OWNER_EMAIL } = require('../utils/owner');

const today = new Date().toISOString().split('T')[0];
const yesterday = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
})();

const sampleTasks = [
  { title: 'Morning meditation', time: '07:00', isCompleted: true },
  { title: 'Review project roadmap', time: '09:00', isCompleted: true },
  { title: 'Team standup', time: '10:00', isCompleted: false },
  { title: 'Deep work session', time: '11:00', isCompleted: false },
  { title: 'Lunch break', time: '13:00', isCompleted: true },
];

const yesterdayTasks = [
  { title: 'Morning run', time: '06:30', isCompleted: true },
  { title: 'Read 30 pages', time: '08:00', isCompleted: true },
  { title: 'Write daily journal', time: '21:00', isCompleted: true },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Reset to a clean single-owner dataset
  await Task.deleteMany({});
  await DailyStats.deleteMany({});
  await User.deleteMany({});
  console.log('🧹 Cleared existing data');

  const user = await User.create({
    email: OWNER_EMAIL,
    password: 'unused-single-user',
    currentStreak: 1,
    lastCompletedDate: yesterday,
  });
  console.log(`👤 Created owner: ${OWNER_EMAIL}`);

  const todayDocs = await Task.insertMany(
    sampleTasks.map((t) => ({ ...t, userId: user._id, date: today }))
  );
  console.log(`📋 Created ${todayDocs.length} tasks for today (${today})`);

  const yesterdayDocs = await Task.insertMany(
    yesterdayTasks.map((t) => ({ ...t, userId: user._id, date: yesterday }))
  );
  console.log(`📋 Created ${yesterdayDocs.length} tasks for yesterday (${yesterday})`);

  const todayCompleted = sampleTasks.filter((t) => t.isCompleted).length;
  await DailyStats.create({
    userId: user._id,
    date: today,
    totalTasks: sampleTasks.length,
    completedTasks: todayCompleted,
    totalScore: sampleTasks.length,
    achievedScore: todayCompleted,
    bonusApplied: false,
  });

  await DailyStats.create({
    userId: user._id,
    date: yesterday,
    totalTasks: yesterdayTasks.length,
    completedTasks: yesterdayTasks.length,
    totalScore: yesterdayTasks.length,
    achievedScore: yesterdayTasks.length,
    bonusApplied: false,
  });

  console.log('📊 Created DailyStats for both days');
  console.log('\n✅ Seed complete!');
  console.log(`\n🔑 Use APP_PASSCODE from your .env to unlock the app.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
