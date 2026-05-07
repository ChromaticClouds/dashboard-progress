const express = require('express');
const { getMonthSchedules } = require('../controllers/monthController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getMonthSchedules);

module.exports = router;