const Klinik = require('../models/klinik');
const bcrypt = require("bcryptjs");
const asyncErrorWrapper = require('express-async-handler');
const {sendJwtforKlinik}=require('../middlewares/authorization/tokenHelpers')

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

    sendJwtforKlinik(klinik,res);
});

const login_Klinik=asyncErrorWrapper(async(req,res,next)=>{
    const {eposta,sifre_hash}=req.body;
    if (!eposta || !sifre_hash) {
       return res.status(400).json({
            success: false,
            message: "Lütfen eposta ve şifre bilgilerinizi kontrol ediniz!"
        });
    }
    const klinik = await Klinik.findOne({eposta}).select("+sifre_hash");
    if(!klinik){
        return res.status(400).json({
            success: false,
            message: "Klinik bulunamadı, lütfen tekrar deneyiniz!"
        });
    }
    const isPasswordMatched = await klinik.comparePassword(sifre_hash);
    if(!isPasswordMatched){
        return res.status(400).json({
            success: false,
            message: "Lütfen şifrenizi kontrol ediniz!"
        });
    }
    sendJwtforKlinik(klinik, res);
});

const getKlinikProfile = async (req,res,next) => {

    const klinik = await Klinik.findById(req.klinik.id);

    return res.status(200).json({
        success:true,
        data:klinik
    });

};

const editKlinik = async (req, res, next) => {
  try {

    const klinik = await Klinik.findById(req.klinik.id)  //id değerine göre bilgisi alınır

    if (!klinik) {
      return res.status(404).json({
        success: false,
        message: "Klinik bulunamadı"
      })
    }

    const {
      ad_soyad,
      eposta,
      telefon,
      adres,
      sehir,
      ilce
    } = req.body

    // Gelen verileri güncelle
    klinik.ad_soyad = ad_soyad
    klinik.eposta = eposta
    klinik.telefon = telefon
    klinik.adres = adres
    klinik.sehir = sehir
    klinik.ilce = ilce
  

    await klinik.save()

    return res.status(200).json({
      success: true,
      message: "Klinik bilgileri güncellendi",
      data: klinik
    })

  } catch (error) {
    next(error)
  }
}


const logout_Klinik=asyncErrorWrapper(async(req,res,next)=>{
    const {NODE_ENV}=process.env;

    return res.status(200)
    .cookie("access_token",null,{
        httpOnly:true,
        expires:new Date(Date.now()),
        secure:NODE_ENV === "development"?false:true
    }).json({
        success:true,
        message:"Logout Successfull"
    });

});

module.exports = {
    klinikKayit,
    login_Klinik,
    getKlinikProfile,
    logout_Klinik,
    editKlinik
};