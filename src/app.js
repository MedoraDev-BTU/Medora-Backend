const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const patientRoutes = require('./routes/patient.routes');
const clinicRoutes = require('./routes/clinic.routes');
const adminRoutes = require('./routes/admin.routes');
const authPatientRoutes = require('./routes/auth.patient.routes');
const authClinicRoutes = require('./routes/auth.clinic.routes');
const locationRoutes = require('./routes/location.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Güvenlik & temel middleware'ler
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// OTP istekleri için rate limit (suistimal önleme)
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 5,              // dakikada en fazla 5 istek
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek attınız. Lütfen biraz sonra tekrar deneyin.' }
});

// Klinik yüklemeleri için statik klasör (sadece adminin onayı için, prod'da private storage olmalı)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Sağlık kontrolü
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'medora-verification', time: new Date().toISOString() });
});

// API yolları — mevcut doğrulama akışları
app.use('/api/patients', otpLimiter, patientRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/admin', adminRoutes);

// Mobil auth (yeni)
app.use('/api/auth/patients', authPatientRoutes);
app.use('/api/auth/clinics', authClinicRoutes);

// Konum dönüşümü (yeni — Ece Açar ile ortak kullanılan endpoint)
app.use('/api/location', locationRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Genel hata yakalayıcı
app.use(errorHandler);

module.exports = app;
