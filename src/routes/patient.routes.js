const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/patient.controller');

router.post('/request-otp', ctrl.requestOtp);
router.post('/verify-otp', ctrl.verifyOtpHandler);
router.get('/status', ctrl.status);

module.exports = router;
