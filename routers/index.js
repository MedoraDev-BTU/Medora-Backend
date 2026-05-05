const express = require('express');
const auth=require('./auth')
const klinik=require('./klinik')


// /api
const router = express.Router();

router.use("/auth",auth);
router.use("/klinik",klinik)

module.exports = router; //disari aktarim yapmak icin