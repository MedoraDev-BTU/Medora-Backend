const express = require('express');
const {klinikKayit}=require('../controllers/klinik')
const router = express.Router();

router.post("/kayit",klinikKayit); 



module.exports = router; //disari aktarim yapmak icin