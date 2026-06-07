const validator = require('validator');
const Patient = require('../models/Patient');
const { issueOtp, verifyOtp } = require('../services/otpService');
const { signToken } = require('../services/tokenService');

function normalizePhone(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim().replace(/\s+/g, '');
  if (!validator.isMobilePhone(trimmed, 'any', { strictMode: true })) return null;
  return trimmed;
}

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

function publicPatient(p) {
  return {
    id: p._id,
    phone: p.phone,
    fullName: p.fullName,
    email: p.email,
    isPhoneVerified: p.isPhoneVerified,
    phoneVerifiedAt: p.phoneVerifiedAt,
    authProviders: p.authProviders,
    lastLoginAt: p.lastLoginAt
  };
}

function issueAuthToken(patient) {
  return signToken({ sub: patient._id.toString(), role: 'patient' });
}

/**
 * POST /api/auth/patients/signup
 * body: { email, password, fullName?, phone? }
 *
 * E-posta + sifre ile yeni hasta kaydi olusturur. Telefon verilmisse opsiyoneldir
 * (sonradan OTP ile dogrulanabilir).
 */
exports.signup = async (req, res, next) => {
  try {
    const { email, password, fullName, phone } = req.body || {};

    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) return res.status(400).json({ error: 'Gecerli bir e-posta giriniz' });

    const pwError = validatePassword(password);
    if (pwError) return res.status(400).json({ error: pwError });

    let cleanPhone = null;
    if (phone) {
      cleanPhone = normalizePhone(phone);
      if (!cleanPhone) return res.status(400).json({ error: 'Gecersiz telefon numarasi' });
    }

    // Mevcut hasta kontrolu (email veya telefonla eslesen)
    const existing = await Patient.findOne(
      cleanPhone
        ? { $or: [{ email: cleanEmail }, { phone: cleanPhone }] }
        : { email: cleanEmail }
    ).select('+passwordHash');

    if (existing && existing.passwordHash) {
      return res.status(409).json({ error: 'Bu e-posta veya telefonla zaten kayitli bir hesap var' });
    }

    const passwordHash = await Patient.hashPassword(password);

    let patient;
    if (existing) {
      // OTP ile olusturulmus hesabin uzerine sifre eklenir
      existing.email = cleanEmail;
      existing.passwordHash = passwordHash;
      if (fullName) existing.fullName = fullName;
      if (!existing.authProviders.includes('password')) existing.authProviders.push('password');
      existing.lastLoginAt = new Date();
      await existing.save();
      patient = existing;
    } else {
      const doc = {
        email: cleanEmail,
        passwordHash,
        fullName,
        authProviders: ['password'],
        lastLoginAt: new Date()
      };
      if (cleanPhone) doc.phone = cleanPhone;
      patient = await Patient.create(doc);
    }

    const token = issueAuthToken(patient);
    res.status(201).json({ message: 'Kayit basarili', token, patient: publicPatient(patient) });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'Bu e-posta veya telefon zaten kullaniliyor' });
    }
    next(err);
  }
};

/**
 * POST /api/auth/patients/login
 * body: { email, password }
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail || !password) {
      return res.status(400).json({ error: 'E-posta ve sifre zorunlu' });
    }

    const patient = await Patient.findOne({ email: cleanEmail }).select('+passwordHash');
    if (!patient || !patient.passwordHash) {
      return res.status(401).json({ error: 'Gecersiz kimlik bilgileri' });
    }

    const ok = await patient.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Gecersiz kimlik bilgileri' });

    patient.lastLoginAt = new Date();
    await patient.save();

    const token = issueAuthToken(patient);
    res.json({ message: 'Giris basarili', token, patient: publicPatient(patient) });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/patients/otp/request
 * body: { phone, fullName?, email? }
 *
 * Telefon-OTP akisi: kayit yoksa olusturur, OTP gonderir. Login/signup ortak.
 */
exports.requestOtp = async (req, res, next) => {
  try {
    const { phone, fullName, email } = req.body || {};
    const normalized = normalizePhone(phone);
    if (!normalized) {
      return res.status(400).json({ error: 'Gecersiz telefon numarasi (orn: +905551112233)' });
    }

    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (email) {
      const cleanEmail = normalizeEmail(email);
      if (cleanEmail) updates.email = cleanEmail;
    }

    const patient = await Patient.findOneAndUpdate(
      { phone: normalized },
      { $setOnInsert: { phone: normalized }, $set: updates, $addToSet: { authProviders: 'otp' } },
      { upsert: true, new: true, runValidators: true }
    );

    const result = await issueOtp({ phone: normalized, email: patient.email });
    res.status(202).json({
      message: 'Dogrulama kodu gonderildi',
      phone: normalized,
      ttlMinutes: result.ttlMinutes
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/patients/otp/verify
 * body: { phone, code }
 *
 * OTP'yi dogrular ve JWT doner — login + signup birlikte.
 */
exports.verifyOtpHandler = async (req, res, next) => {
  try {
    const { phone, code } = req.body || {};
    const normalized = normalizePhone(phone);
    if (!normalized) return res.status(400).json({ error: 'Gecersiz telefon numarasi' });
    if (!code || !/^\d{4,8}$/.test(String(code))) {
      return res.status(400).json({ error: 'Gecersiz kod formati' });
    }

    await verifyOtp(normalized, code);

    const patient = await Patient.findOneAndUpdate(
      { phone: normalized },
      {
        $set: { isPhoneVerified: true, phoneVerifiedAt: new Date(), lastLoginAt: new Date() },
        $addToSet: { authProviders: 'otp' }
      },
      { new: true, upsert: true }
    );

    const token = issueAuthToken(patient);
    res.json({
      message: 'Telefon basariyla dogrulandi',
      token,
      patient: publicPatient(patient)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/patients/me
 * JWT ile kimligi belirlenen hastayi doner.
 */
exports.me = async (req, res) => {
  res.json({ patient: publicPatient(req.patient) });
};
