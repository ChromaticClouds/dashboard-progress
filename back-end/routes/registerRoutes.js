const express = require('express');
const { createAccount, duplicateAccountVerify } = require('../controllers/registerController');

const router = express.Router();

router.post('/', createAccount);
router.get('/', duplicateAccountVerify);

module.exports = router;