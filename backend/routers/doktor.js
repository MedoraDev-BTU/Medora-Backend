const express = require("express");

const router = express.Router();

const {doktorEkle,doktorlarProfili}=require("../controllers/doktor");
const {doktorGuncelle}=require("../controllers/doktor");
const { getAccessToRoute } = require("../middlewares/authorization/xx");

router.post("/doktor_ekle",getAccessToRoute,doktorEkle);
router.get("/doktorlar",getAccessToRoute,doktorlarProfili);
router.put("/doktor_guncelle/:id",getAccessToRoute,doktorGuncelle);



module.exports = router;