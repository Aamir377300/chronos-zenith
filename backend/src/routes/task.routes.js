const express = require('express');
const { body } = require('express-validator');
const { getTasksByDate, getTasksByRange, createTask, toggleTask, updateTask, deleteTask } = require('../controllers/task.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(protect);

router.get('/range', getTasksByRange);
router.get('/:date', getTasksByDate);

router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
  ],
  createTask
);

router.put(
  '/:id',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('date').notEmpty().withMessage('Date is required'),
  ],
  updateTask
);

router.patch('/:id', toggleTask);

router.delete('/:id', deleteTask);

module.exports = router;
