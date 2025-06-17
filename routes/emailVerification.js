const express = require('express');
const router = express.Router();
const { sendVerificationCode, verifyCode, resendCode } = require('../controllers/emailVerificationController');

router.post('/send-code', sendVerificationCode);
router.post('/verify-code', verifyCode);
router.post('/resend-code', resendCode);

module.exports = router; 