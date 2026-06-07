const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const patientSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^\+[1-9]\d{6,14}$/, 'Telefon numarasi E.164 formatinda olmali (orn: +905551112233)']
    },
    fullName: { type: String, trim: true, maxlength: 120 },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Gecerli bir e-posta giriniz']
    },
    // Sifre (opsiyonel: e-posta + sifre ile kayit olan hastalar icin doludur)
    passwordHash: { type: String, select: false },
    // Hangi yontemlerle kayit oldugunu izleriz (audit icin)
    authProviders: {
      type: [String],
      enum: ['otp', 'password'],
      default: []
    },
    isPhoneVerified: { type: Boolean, default: false },
    phoneVerifiedAt: { type: Date },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

patientSchema.methods.comparePassword = function (plain) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.passwordHash);
};

patientSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10);
};

module.exports = mongoose.model('Patient', patientSchema);
