const express = require('express');
const { createNotification, getNotification } = require('../controllers/notificationController');

const router = express.Router();

router.post('/', createNotification);
router.get('/', getNotification);

module.exports = router;