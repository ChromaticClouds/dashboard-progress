const express = require('express');
const { getMonthSchedules } = require('../controllers/monthController');

const router = express.Router();

router.get('/', getMonthSchedules);

module.exports = router;