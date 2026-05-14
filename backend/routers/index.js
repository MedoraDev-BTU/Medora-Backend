const express = require('express');
const klinik=require('./klinik')
const doktor=require('./doktor')
/*const auth=require('./auth')
const randevu=require('./randevu')*/


// /api
const router = express.Router();
router.use("/klinik",klinik);
router.use("/doktor", doktor);




/*
router.use("/auth",auth);
router.use("/auth",randevu); // kullanıcı randevu bilgilerini girerek oluşturabilecek*/






module.exports = router; //disari aktarim yapmak icin