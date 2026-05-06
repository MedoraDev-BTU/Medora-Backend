const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const OtpCode = require('../models/OtpCode');
const { sendOtp } = require('./messageService');

const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || '6', 10);
const OTP_TTL_MINUTES = parseInt(process.env.OTP_TTL_MINUTES || '5', 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
const RESEND_COOLDOWN = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10);

function generateNumericCode(length = OTP_LENGTH) {
  const max = 10 ** length;
  const n = crypto.randomInt(0, max);
  return n.toString().padStart(length, '0');
}

/**
 * Yeni OTP uretir, hashleyip kaydeder ve aktif kanal uzerinden gonderir.
 * @param {{phone: string, email?: string}} target
 */
async function issueOtp(target) {
  const { phone, email } = target;
  if (!phone) throw new Error('phone zorunlu');

  const lastIssued = await OtpCode.findOne({ phone }).sort({ createdAt: -1 });
  if (lastIssued && !lastIssued.consumedAt) {
    const elapsed = (Date.now() - lastIssued.createdAt.getTime()) / 1000;
    if (elapsed < RESEND_COOLDOWN) {
      const wait = Math.ceil(RESEND_COOLDOWN - elapsed);
      const err = new Error('Yeni kod isteyebilmek icin ' + wait + ' saniye bekleyin');
      err.status = 429;
      throw err;
    }
  }

  await OtpCode.deleteMany({ phone, consumedAt: null });

  const code = generateNumericCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await OtpCode.create({
    phone,
    codeHash,
    expiresAt,
    maxAttempts: OTP_MAX_ATTEMPTS
  });

  await sendOtp({ phone, email, code, ttlMinutes: OTP_TTL_MINUTES });

  return { sentTo: phone, ttlMinutes: OTP_TTL_MINUTES };
}

async function verifyOtp(phone, code) {
  const record = await OtpCode.findOne({ phone, consumedAt: null }).sort({ createdAt: -1 });
  if (!record) {
    const err = new Error('Gecerli bir dogrulama kodu bulunamadi, lutfen yeni kod isteyin');
    err.status = 400;
    throw err;
  }

  if (record.expiresAt.getTime() < Date.now()) {
    const err = new Error('Dogrulama kodunun suresi dolmus, lutfen yeni kod isteyin');
    err.status = 400;
    throw err;
  }

  if (record.attempts >= record.maxAttempts) {
    const err = new Error('Cok fazla hatali deneme yaptiniz, lutfen yeni kod isteyin');
    err.status = 429;
    record.consumedAt = new Date();
    await record.save();
    throw err;
  }

  const ok = await bcrypt.compare(String(code), record.codeHash);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    const remaining = record.maxAttempts - record.attempts;
    const err = new Error('Kod hatali. Kalan deneme: ' + remaining);
    err.status = 400;
    throw err;
  }

  record.consumedAt = new Date();
  await record.save();
  return true;
}

module.exports = { issueOtp, verifyOtp };
