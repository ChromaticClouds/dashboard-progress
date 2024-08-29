const express = require('express');
const { createNotification, getNotification, updateNotification, deleteNotification } = require('../controllers/notificationController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, createNotification);
router.get('/', authenticateToken, getNotification);
router.put('/', authenticateToken, updateNotification);
router.delete('/', authenticateToken, deleteNotification);

module.exports = router;