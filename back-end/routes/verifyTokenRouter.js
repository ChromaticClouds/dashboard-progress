const express = require('express');
const { verifyToken } = require('../controllers/verifyTokenController');

const router = express.Router();

router.post('/', verifyToken);

module.exports = router;