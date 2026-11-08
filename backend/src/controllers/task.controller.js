const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const { recalculateStats } = require('../services/stats.service');
const { todayString } = require('../utils/dateHelpers');

const getTasksByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    // Single-user: all tasks for the date belong to the fixed owner
    const tasks = await Task.find({ date }).sort({ createdAt: 1 });
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

const getTasksByRange = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ success: false, message: 'Start and end dates are required' });
    }
    const tasks = await Task.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: 1, createdAt: 1 });
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, date } = req.body;
    const taskDate = date || todayString();
    const ownerId = req.user._id;

    const task = await Task.create({
      userId: ownerId,
      title,
      date: taskDate,
    });

    await recalculateStats(ownerId, taskDate);

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, date } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const ownerId = req.user._id;
    const oldDate = task.date;
    task.title = title;
    task.date = date;
    // Keep ownership on the fixed owner
    task.userId = ownerId;
    await task.save();

    if (oldDate !== date) {
      await recalculateStats(ownerId, oldDate);
    }
    await recalculateStats(ownerId, date);

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const toggleTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const ownerId = req.user._id;
    task.isCompleted = !task.isCompleted;
    task.userId = ownerId;
    await task.save();

    await recalculateStats(ownerId, task.date);

    const updatedUser = await User.findById(ownerId);

    res.json({
      success: true,
      data: task,
      currentStreak: updatedUser.currentStreak,
      totalRating: updatedUser.totalRating,
      totalTasksCompleted: updatedUser.totalTasksCompleted,
      totalTasksAssigned: updatedUser.totalTasksAssigned,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await recalculateStats(req.user._id, task.date);

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /tasks/set
 * Create a set of titles on each given date, skipping titles already present that day.
 * Dates are filled one after another so streak/rating updates stay consistent.
 */
const createTaskSet = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const titles = [...new Set(req.body.titles.map((t) => String(t).trim()).filter(Boolean))];
    const dates = [...new Set(req.body.dates)];
    const ownerId = req.user._id;

    const existing = await Task.find({
      date: { $in: dates },
      title: { $in: titles },
    }).select('title date');

    const have = new Set(existing.map((t) => `${t.date}|${t.title.trim().toLowerCase()}`));
    const docs = [];
    for (const date of dates) {
      for (const title of titles) {
        if (have.has(`${date}|${title.toLowerCase()}`)) continue;
        docs.push({ userId: ownerId, title, date, isCompleted: false });
      }
    }

    if (docs.length) {
      await Task.insertMany(docs);
      const affected = [...new Set(docs.map((d) => d.date))].sort();
      for (const date of affected) {
        await recalculateStats(ownerId, date);
      }
    }

    res.status(201).json({ success: true, created: docs.length });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasksByDate, getTasksByRange, createTask, toggleTask, updateTask, deleteTask, createTaskSet };
