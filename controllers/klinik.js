const Klinik = require('../models/klinik');
const bcrypt = require("bcryptjs");
const asyncErrorWrapper = require('express-async-handler');

// Kullanıcı kayıt işlemi
const klinikKayit = asyncErrorWrapper(async (req, res, next) => {
    const {
        ad_soyad,
        eposta,
        sifre_hash,
        telefon,
        adres,
        sehir,
        ilce
    } = req.body;

    // Kullanıcı kayıt olurken bütün bilgileri eksiksiz olarak girdi mi?
     if (!ad_soyad || !eposta || !sifre_hash || !telefon|| !adres || !sehir || !ilce) {
        return res.status(400).json({
            success: false,
            message: "Lütfen gerekli alanları doldurunuz"
        });
    }

    const existingKlinik = await Klinik.findOne({ eposta });
    if(existingKlinik){
        return res.status(400).json({
            success:false,
            message:"Bu e-posta hesabına ait bir klinik bulunuyor!"
        })
    }
    const salt = await bcrypt.genSalt(10); //sifre aynı olsa bile farklı hash şifresi oluşur 
    const hashedPassword = await bcrypt.hash(sifre_hash,salt) 

    const klinik = await Klinik.create({
        ad_soyad,
        eposta,
        sifre_hash: hashedPassword,
        telefon,
        adres,
        sehir,
        ilce
    });

    res.status(201).json({
        success: true,
        message: "Klinik başarıyla oluşturuldu",
        data: klinik
    });
});

module.exports = {
    klinikKayit
};