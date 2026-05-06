const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const ctrl = require('../controllers/clinic.controller');

// "documents" isimli alan altında 1-6 dosya kabul ediyoruz
router.post('/register', upload.array('documents', 6), ctrl.register);
router.get('/status', ctrl.status);

module.exports = router;
