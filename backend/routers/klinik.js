const express = require('express');
const {klinikKayit}=require('../controllers/klinik')
const {login_Klinik,getKlinikProfile,editKlinik}=require('../controllers/klinik')
const {getAccessToRoute}=require('../middlewares/authorization/xx')
const router = express.Router();


router.post("/kayit",klinikKayit); 
router.post("/giris",login_Klinik);
router.get("/profile", getAccessToRoute,getKlinikProfile);
router.put("/klinik_guncelle",getAccessToRoute,editKlinik);




module.exports = router; //disari aktarim yapmak icin