const path = require('path');
const fs = require('fs');
const Clinic = require('../models/Clinic');
const { verifyClinic } = require('../services/clinicVerifier');

const DOC_KINDS = ['ruhsat', 'vergi-levhasi', 'imza-sirkuleri', 'diger'];
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'clinics');

/**
 * POST /api/clinics/register  (multipart/form-data)
 * Klinik kaydini olusturur ve OTOMATIK olarak dogrulamadan gecirir.
 * Sonuc anlik olarak donulur (admin onayi YOKTUR).
 */
exports.register = async (req, res, next) => {
  let createdId = null;
  try {
    const {
      name, legalName, taxNumber, licenseNumber,
      contactEmail, contactPhone, address, city
    } = req.body || {};

    if (!name || !contactEmail) {
      return res.status(400).json({ error: 'Klinik adi ve iletisim e-postasi zorunludur' });
    }

    let kinds = req.body.docKinds || [];
    if (typeof kinds === 'string') kinds = [kinds];

    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({
        error: 'En az bir dogrulama belgesi yuklemelisiniz (ruhsat, vergi levhasi vb.)'
      });
    }

    const documents = files.map((f, i) => {
      const kind = kinds[i] && DOC_KINDS.includes(kinds[i]) ? kinds[i] : 'diger';
      return {
        kind,
        originalName: f.originalname,
        storedName: f.filename,
        mimeType: f.mimetype,
        size: f.size
      };
    });

    // 1) Kaydi pending olarak olustur
    const clinic = await Clinic.create({
      name, legalName, taxNumber, licenseNumber,
      contactEmail, contactPhone, address, city,
      documents, status: 'pending'
    });
    createdId = clinic._id;

    // 2) Otomatik dogrulayiciyi calistir
    const result = await verifyClinic(clinic, UPLOAD_DIR);

    // 3) Sonucu kaydet
    clinic.status = result.decision;
    clinic.verificationScore = result.score;
    clinic.verificationReport = result.checks;
    clinic.verificationSummary = result.summary;
    clinic.autoVerifiedAt = new Date();
    await clinic.save();

    // 4) Reddedildiyse yuklenen dosyalari sil (kullanici verisi tutmuyoruz)
    if (result.decision === 'rejected') {
      for (const d of documents) {
        try { await fs.promises.unlink(path.join(UPLOAD_DIR, d.storedName)); } catch (_) { /* yoksay */ }
      }
    }

    const httpCode = result.decision === 'approved' ? 201 : 422;
    res.status(httpCode).json({
      message: result.decision === 'approved'
        ? 'Klinik basariyla dogrulandi ve onaylandi.'
        : 'Klinik basvurusu otomatik olarak reddedildi.',
      clinic: {
        id: clinic._id,
        name: clinic.name,
        contactEmail: clinic.contactEmail,
        status: clinic.status,
        verificationScore: clinic.verificationScore,
        threshold: result.threshold,
        verificationSummary: clinic.verificationSummary,
        verificationReport: clinic.verificationReport
      }
    });
  } catch (err) {
    // hata olursa yarim kalan kaydi temizle
    if (createdId) {
      try { await Clinic.findByIdAndDelete(createdId); } catch (_) {}
    }
    next(err);
  }
};

/**
 * GET /api/clinics/status?email=...
 */
exports.status = async (req, res, next) => {
  try {
    const email = (req.query.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ error: 'email parametresi zorunlu' });

    const clinic = await Clinic.findOne({ contactEmail: email })
      .select('name contactEmail status verificationScore verificationSummary autoVerifiedAt createdAt');
    if (!clinic) return res.status(404).json({ error: 'Klinik bulunamadi' });
    res.json(clinic);
  } catch (err) {
    next(err);
  }
};
