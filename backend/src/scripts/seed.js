/**
 * Seed script — populates the DB with a demo user and sample tasks
 * Run: node src/scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Task = require('../models/Task');
const DailyStats = require('../models/DailyStats');

const DEMO_EMAIL = 'belalaamirkhan@gmail.com';
const DEMO_PASSWORD = 'aamirkhan';

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

  // Clean up existing demo data
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    await Task.deleteMany({ userId: existing._id });
    await DailyStats.deleteMany({ userId: existing._id });
    await User.deleteOne({ _id: existing._id });
    console.log('🧹 Cleaned up existing demo data');
  }

  // Create demo user
  const user = await User.create({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    currentStreak: 1,
    lastCompletedDate: yesterday,
  });
  console.log(`👤 Created demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);

  // Create today's tasks
  const todayDocs = await Task.insertMany(
    sampleTasks.map((t) => ({ ...t, userId: user._id, date: today }))
  );
  console.log(`📋 Created ${todayDocs.length} tasks for today (${today})`);

  // Create yesterday's tasks (all complete)
  const yesterdayDocs = await Task.insertMany(
    yesterdayTasks.map((t) => ({ ...t, userId: user._id, date: yesterday }))
  );
  console.log(`📋 Created ${yesterdayDocs.length} tasks for yesterday (${yesterday})`);

  // Create DailyStats for today
  const todayCompleted = sampleTasks.filter((t) => t.isCompleted).length;
  await DailyStats.create({
    userId: user._id,
    date: today,
    totalTasks: sampleTasks.length,
    completedTasks: todayCompleted,
    totalScore: sampleTasks.length * 10,
    achievedScore: todayCompleted * 10,
    bonusApplied: false,
  });

  // Create DailyStats for yesterday (all complete, no bonus since it's day 1)
  await DailyStats.create({
    userId: user._id,
    date: yesterday,
    totalTasks: yesterdayTasks.length,
    completedTasks: yesterdayTasks.length,
    totalScore: yesterdayTasks.length * 10,
    achievedScore: yesterdayTasks.length * 10,
    bonusApplied: false,
  });

  console.log('📊 Created DailyStats for both days');
  console.log('\n✅ Seed complete!');
  console.log(`\n🔑 Login credentials:\n   Email: ${DEMO_EMAIL}\n   Password: ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
