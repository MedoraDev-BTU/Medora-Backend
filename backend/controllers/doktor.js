const Doktor = require('../models/doktor');
const asyncErrorWrapper = require("express-async-handler");

const doktorEkle = asyncErrorWrapper(async (req, res, next) => {

    // sadece klinik girişi yapanlar doktor ekleyebilir, kullanıcı rolüne sahip olanlar bu işlemi yapamaz
    if (req.klinik.role !== "klinik") {
        return res.status(403).json({
            success: false,
            message: "Bu işlem için yetkiniz yok"
        });
    }
    const {ad_soyad,uzmanlik,eposta,telefon} = req.body; //girilen bilgiler alınır.

    // giriş yapan kliniğin id'si otomatik alınır
    const doktor = await Doktor.create({
        klinik_id:req.klinik.id,
        ...req.body
    });

    return res.status(201).json({
        success: true,
        message: "Doktor başarıyla eklendi",
        data: {
            ad_soyad:doktor.ad_soyad,
            uzmanlik:doktor.uzmanlik,
            telefon:doktor.telefon,
            klinik_id:doktor.klinik_id
        }
    });

});

const doktorGuncelle = asyncErrorWrapper(async (req, res, next) => {

    if (req.klinik.role !== "klinik") {
        return res.status(403).json({
            success: false,
            message: "Bu işlem için yetkiniz yok"
        });
    }

    const {
        ad_soyad,
        uzmanlik,
        eposta,
        telefon,
        workingStartTime,
        workingEndTime,
        workingDays,
        daySchedule,
        status
    } = req.body;

    let doktor = await Doktor.findById(req.params._id);

    console.log(req.params._id)

    if (!doktor) {
        return res.status(404).json({
            success: false,
            message: "Doktor bulunamadı"
        });
    }

    if (doktor.klinik_id !== req.klinik.id) {  //doktorun blunduğu klinik değil başka bir klinik güncellemeye çalışırsa
        return res.status(403).json({
            success: false,
            message: "Bu doktoru güncelleme yetkiniz yok"
        });
    }

    const updateData = {
        ad_soyad,
        uzmanlik,
        eposta,
        telefon,
        workingStartTime,
        workingEndTime,
        workingDays,
        daySchedule,
        status
    };

    doktor = await Doktor.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    return res.status(200).json({
        success: true,
        message: "Doktor bilgileri güncellendi",
        data: doktor
    });
});

const doktorlarProfili = asyncErrorWrapper(async (req, res, next) => {



    // giriş yapan kliniğin id'sine ait tüm doktorları getir
    const doktorlar = await Doktor.find({
        klinik_id: req.klinik.id
    });

        console.log(doktorlar)

    if (!doktorlar || doktorlar.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Bu kliniğe ait doktor bulunamadı"
        });
    }

    return res.status(200).json({
        success: true,
        data: doktorlar
    });

});



module.exports = {
    doktorEkle,
    doktorGuncelle,
    doktorlarProfili
};