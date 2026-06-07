const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/location.controller');

router.post('/convert', ctrl.convert);
router.post('/distance', ctrl.distance);

module.exports = router;
