const validator = require('validator');
const Clinic = require('../models/Clinic');
const { signToken } = require('../services/tokenService');

function normalizeEmail(raw) {
  if (!raw) return null;
  const e = String(raw).toLowerCase().trim();
  if (!validator.isEmail(e)) return null;
  return e;
}

function validatePassword(pw) {
  if (!pw || typeof pw !== 'string') return 'Sifre zorunlu';
  if (pw.length < 8) return 'Sifre en az 8 karakter olmali';
  if (pw.length > 128) return 'Sifre cok uzun';
  return null;
}

function publicClinic(c) {
  return {
    id: c._id,
    name: c.name,
    contactEmail: c.contactEmail,
    contactPhone: c.contactPhone,
    city: c.city,
    status: c.status,
    verificationScore: c.verificationScore,
    lastLoginAt: c.lastLoginAt
  };
}

function issueAuthToken(clinic) {
  return signToken({ sub: clinic._id.toString(), role: 'clinic' });
}

/**
 * POST /api/auth/clinics/set-password
 * body: { contactEmail, password, taxNumber? }
 *
 * Onaylanmis bir klinige ilk sifre belirleme. Klinik kaydi (taxNumber) ile dogrulanir.
 * Mevcut sifreyi degistirmek icin reset endpoint'i ayrica eklenebilir.
 */
exports.setPassword = async (req, res, next) => {
  try {
    const { contactEmail, password, taxNumber } = req.body || {};
    const cleanEmail = normalizeEmail(contactEmail);
    if (!cleanEmail) return res.status(400).json({ error: 'Gecerli bir e-posta giriniz' });
    const pwError = validatePassword(password);
    if (pwError) return res.status(400).json({ error: pwError });

    const clinic = await Clinic.findOne({ contactEmail: cleanEmail }).select('+passwordHash');
    if (!clinic) return res.status(404).json({ error: 'Klinik bulunamadi' });
    if (clinic.status !== 'approved') {
      return res.status(403).json({ error: 'Sifre belirlemek icin klinigin onaylanmis olmasi gerekir' });
    }
    if (clinic.passwordHash) {
      return res.status(409).json({ error: 'Bu klinik icin zaten bir sifre var. Sifre sifirlama akisini kullanin.' });
    }
    if (!taxNumber || String(taxNumber).trim() !== clinic.taxNumber) {
      return res.status(401).json({ error: 'Klinik dogrulama bilgileri eslesmiyor (taxNumber)' });
    }

    clinic.passwordHash = await Clinic.hashPassword(password);
    await clinic.save();
    res.status(201).json({ message: 'Sifre belirlendi, artik giris yapabilirsiniz' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/clinics/login
 * body: { contactEmail, password }
 */
exports.login = async (req, res, next) => {
  try {
    const { contactEmail, password } = req.body || {};
    const cleanEmail = normalizeEmail(contactEmail);
    if (!cleanEmail || !password) {
      return res.status(400).json({ error: 'E-posta ve sifre zorunlu' });
    }

    const clinic = await Clinic.findOne({ contactEmail: cleanEmail }).select('+passwordHash');
    if (!clinic || !clinic.passwordHash) {
      return res.status(401).json({ error: 'Gecersiz kimlik bilgileri' });
    }
    if (clinic.status !== 'approved') {
      return res.status(403).json({ error: 'Klinik henuz onaylanmamis (' + clinic.status + ')' });
    }

    const ok = await clinic.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Gecersiz kimlik bilgileri' });

    clinic.lastLoginAt = new Date();
    await clinic.save();

    const token = issueAuthToken(clinic);
    res.json({ message: 'Giris basarili', token, clinic: publicClinic(clinic) });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/clinics/me
 */
exports.me = async (req, res) => {
  res.json({ clinic: publicClinic(req.clinic) });
};
