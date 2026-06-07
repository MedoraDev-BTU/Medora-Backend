const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const documentSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ['ruhsat', 'vergi-levhasi', 'imza-sirkuleri', 'diger'],
      required: true
    },
    originalName: String,
    storedName: String,
    mimeType: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const verificationCheckSchema = new mongoose.Schema(
  {
    id: String,
    weight: Number,
    passed: Boolean,
    partial: Boolean,
    message: String
  },
  { _id: false }
);

const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    legalName: { type: String, trim: true, maxlength: 200 },
    taxNumber: { type: String, trim: true, maxlength: 20 },
    licenseNumber: { type: String, trim: true, maxlength: 60 },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Gecerli bir e-posta giriniz']
    },
    contactPhone: {
      type: String,
      trim: true,
      match: [/^\+[1-9]\d{6,14}$/, 'Telefon numarasi E.164 formatinda olmali']
    },
    address: { type: String, trim: true, maxlength: 500 },
    city: { type: String, trim: true, maxlength: 80 },

    // Mobil giris icin sifre (kayit olusturuldugunda admin/klinik yetkilisi tarafindan belirlenir)
    passwordHash: { type: String, select: false },
    lastLoginAt: { type: Date },

    documents: { type: [documentSchema], default: [] },

    // Otomatik dogrulama sonucu
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    verificationScore: { type: Number, default: 0 },
    verificationReport: { type: [verificationCheckSchema], default: [] },
    verificationSummary: { type: String, default: '' },
    autoVerifiedAt: { type: Date }
  },
  { timestamps: true }
);

clinicSchema.methods.comparePassword = function (plain) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.passwordHash);
};

clinicSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10);
};

module.exports = mongoose.model('Clinic', clinicSchema);
