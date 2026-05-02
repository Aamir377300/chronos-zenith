const express = require('express');
const { getStatsByDate, getStatsHistory } = require('../controllers/stats.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// IMPORTANT: /history must come before /:date to avoid route conflict
router.get('/history', getStatsHistory);
router.get('/:date', getStatsByDate);

module.exports = router;
