const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const { recalculateStats } = require('../services/stats.service');
const { todayString } = require('../utils/dateHelpers');

const getTasksByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const tasks = await Task.find({ userId: req.user._id, date }).sort({ createdAt: 1 });
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
      userId: req.user._id,
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

    const task = await Task.create({
      userId: req.user._id,
      title,
      date: taskDate,
    });

    await recalculateStats(req.user._id, taskDate);

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
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const oldDate = task.date;
    task.title = title;
    task.date = date;
    await task.save();

    if (oldDate !== date) {
      await recalculateStats(req.user._id, oldDate);
    }
    await recalculateStats(req.user._id, date);

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const toggleTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.isCompleted = !task.isCompleted;
    await task.save();

    await recalculateStats(req.user._id, task.date);

    const updatedUser = await User.findById(req.user._id);

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
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await recalculateStats(req.user._id, task.date);

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasksByDate, getTasksByRange, createTask, toggleTask, updateTask, deleteTask };
