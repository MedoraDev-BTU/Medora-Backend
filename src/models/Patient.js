const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\+[1-9]\d{6,14}$/, 'Telefon numarasi E.164 formatinda olmali (orn: +905551112233)']
    },
    fullName: { type: String, trim: true, maxlength: 120 },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Gecerli bir e-posta giriniz']
    },
    isPhoneVerified: { type: Boolean, default: false },
    phoneVerifiedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
