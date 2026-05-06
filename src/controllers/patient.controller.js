const validator = require('validator');
const Patient = require('../models/Patient');
const { issueOtp, verifyOtp } = require('../services/otpService');

function normalizePhone(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim().replace(/\s+/g, '');
  if (!validator.isMobilePhone(trimmed, 'any', { strictMode: true })) return null;
  return trimmed;
}

/**
 * POST /api/patients/request-otp
 * body: { phone, fullName?, email? }
 */
exports.requestOtp = async (req, res, next) => {
  try {
    const { phone, fullName, email } = req.body || {};
    const normalized = normalizePhone(phone);
    if (!normalized) {
      return res.status(400).json({
        error: 'Gecersiz telefon numarasi. E.164 formatinda girin (orn: +905551112233)'
      });
    }

    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (email) updates.email = String(email).toLowerCase().trim();

    const patient = await Patient.findOneAndUpdate(
      { phone: normalized },
      { $setOnInsert: { phone: normalized }, $set: updates },
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
 * POST /api/patients/verify-otp
 * body: { phone, code }
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
      { $set: { isPhoneVerified: true, phoneVerifiedAt: new Date() } },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Telefon basariyla dogrulandi',
      patient: {
        id: patient._id,
        phone: patient.phone,
        fullName: patient.fullName,
        email: patient.email,
        isPhoneVerified: patient.isPhoneVerified,
        phoneVerifiedAt: patient.phoneVerifiedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/patients/status?phone=+905551112233
 */
exports.status = async (req, res, next) => {
  try {
    const normalized = normalizePhone(req.query.phone);
    if (!normalized) return res.status(400).json({ error: 'Gecersiz telefon numarasi' });

    const patient = await Patient.findOne({ phone: normalized })
      .select('phone fullName email isPhoneVerified phoneVerifiedAt');
    if (!patient) return res.status(404).json({ error: 'Hasta bulunamadi' });
    res.json(patient);
  } catch (err) {
    next(err);
  }
};
