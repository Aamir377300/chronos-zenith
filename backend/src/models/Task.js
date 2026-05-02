const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    date: {
      type: String, // stored as YYYY-MM-DD for easy querying
      required: [true, 'Task date is required'],
      index: true,
    },
    time: {
      type: String, // stored as HH:MM (24-hour format)
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index for efficient per-user per-day queries
taskSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Task', taskSchema);
