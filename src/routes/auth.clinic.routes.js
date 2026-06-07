const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const ctrl = require('../controllers/auth.clinic.controller');
const { requireClinic } = require('../middlewares/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Cok fazla giris denemesi, lutfen biraz sonra tekrar deneyin' }
});

router.post('/set-password', ctrl.setPassword);
router.post('/login', loginLimiter, ctrl.login);
router.get('/me', requireClinic, ctrl.me);

module.exports = router;
