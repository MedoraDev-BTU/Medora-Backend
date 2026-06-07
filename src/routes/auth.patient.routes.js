const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const ctrl = require('../controllers/auth.patient.controller');
const { requirePatient } = require('../middlewares/auth');

// Sifre-tahmin saldirilarini onlemek icin login icin ayri rate limit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Cok fazla giris denemesi, lutfen biraz sonra tekrar deneyin' }
});

// Telefon-OTP icin daha sik istek olabilir; ayri limit
const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Cok fazla OTP istegi, lutfen 1 dk sonra tekrar deneyin' }
});

// E-posta + sifre
router.post('/signup', ctrl.signup);
router.post('/login', loginLimiter, ctrl.login);

// Telefon + OTP
router.post('/otp/request', otpLimiter, ctrl.requestOtp);
router.post('/otp/verify', ctrl.verifyOtpHandler);

// Profil
router.get('/me', requirePatient, ctrl.me);

module.exports = router;
