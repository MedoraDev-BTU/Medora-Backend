/**
 * İlk admin kullanıcısını oluşturmak için tek seferlik script.
 * Kullanım: npm run seed:admin
 * E-posta ve şifre .env dosyasındaki SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD'tan okunur.
 */
require('dotenv').config();
const { connectDB } = require('../config/db');
const Admin = require('../models/Admin');

(async () => {
  try {
    await connectDB();
    const email = (process.env.SEED_ADMIN_EMAIL || '').toLowerCase().trim();
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error('SEED_ADMIN_EMAIL ve SEED_ADMIN_PASSWORD .env dosyasında olmalı');
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`[seed] Admin zaten var: ${email}`);
      process.exit(0);
    }

    const passwordHash = await Admin.hashPassword(password);
    await Admin.create({ email, passwordHash, name: 'Medora Admin' });
    console.log(`[seed] Admin oluşturuldu: ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('[seed] Hata:', err);
    process.exit(1);
  }
})();
