const express = require('express');
const { createSchedule, getSchedules, deleteSchedules } = require('../controllers/calendarController');

const router = express.Router();

router.get('/', getSchedules);
router.post('/', createSchedule);
router.delete('/', deleteSchedules);

module.exports = router;
