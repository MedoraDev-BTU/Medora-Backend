const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin.controller');
const { requireAdmin } = require('../middlewares/auth');

// Klinik kararlari otomatiktir; admin sadece audit icin login olur ve
// kararlari gorebilir. Kimseyi onaylayamaz/reddedemez.
router.post('/login', ctrl.login);
router.get('/clinics', requireAdmin, ctrl.listClinics);
router.get('/clinics/:id', requireAdmin, ctrl.getClinic);

module.exports = router;
