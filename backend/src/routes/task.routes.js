const express = require('express');
const { body } = require('express-validator');
const { getTasksByDate, getTasksByRange, createTask, createTaskSet, toggleTask, updateTask, deleteTask } = require('../controllers/task.controller');
const { requirePasscode } = require('../middleware/passcode');

const router = express.Router();

router.use(requirePasscode);

router.get('/range', getTasksByRange);
router.get('/:date', getTasksByDate);

router.post(
  '/set',
  [
    body('titles').isArray({ min: 1, max: 20 }).withMessage('Provide 1 to 20 task titles'),
    body('titles.*').isString().trim().notEmpty().isLength({ max: 200 }),
    body('dates').isArray({ min: 1, max: 14 }).withMessage('Provide 1 to 14 dates'),
    body('dates.*').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Dates must be YYYY-MM-DD'),
  ],
  createTaskSet
);

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
