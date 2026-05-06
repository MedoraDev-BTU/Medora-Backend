const mongoose = require('mongoose');

/**
 * OTP kodları veritabanında HASH'lenerek saklanır (bcrypt).
 * Her telefon numarası için aynı anda yalnızca bir aktif kayıt bulunmalı:
 * yeni istek gelirse eski kayıt iptal edilir.
 */
const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ['patient-phone'], default: 'patient-phone' },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// Süresi dolanları MongoDB'nin otomatik silmesi için TTL index
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpCode', otpSchema);
