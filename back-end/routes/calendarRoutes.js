const express = require('express');
const { createSchedule, getSchedules, deleteSchedules } = require('../controllers/calendarController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getSchedules);
router.post('/', authenticateToken, createSchedule);
router.delete('/', authenticateToken, deleteSchedules);

module.exports = router;
