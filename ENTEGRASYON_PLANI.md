# 📋 MEDORA ENTEGRASİON PLANI
**Versiyon:** 1.0  
**Tarih:** 6 Haziran 2026  
**Hazırlayan:** Backend Takımı (Hüseyin Acar)

---

## 📌 İÇİNDEKİLER
1. [Proje Özeti](#proje-özeti)
2. [Mevcut Durum Analizi](#mevcut-durum-analizi)
3. [Ekip Görev Dağılımı](#ekip-görev-dağılımı)
4. [Repository Yapısı](#repository-yapısı)
5. [Entegrasyon Noktaları](#entegrasyon-noktaları)
6. [API Kontratları](#api-kontratları)
7. [Veri Modelleri](#veri-modelleri)
8. [Entegrasyon Adımları](#entegrasyon-adımları)
9. [Test Stratejisi](#test-stratejisi)
10. [İletişim & Koordinasyon](#iletişim--koordinasyon)

---

## 🎯 Proje Özeti

**Medora**, Bursa Teknik Üniversitesi'nin Yazılım Mühendisliği Dersi kapsamında geliştirilen sağlık yönetim sistemidir.

### Mimarı
- **Backend**: Node.js + Express + MongoDB
- **Mobil**: React Native + Expo
- **Web**: React + TypeScript
- **Veri**: Python + MongoDB

### Amaç
Hasta ve klinikleri tek bir dijital platformda buluşturerek:
- Randevu işlemlerini otomatikleştirmek
- Konuma göre hizmet bulabilmek
- Gerçek zamanlı iletişim sağlamak

---

## 🔍 Mevcut Durum Analizi

### ✅ BACKEND (Sen - @RetcapS)
**Dosya:** `C:\Medora\Medora` (Lokal)

#### Tamamlanan:
- ✅ Temel proje yapısı (Express + MongoDB)
- ✅ Hasta doğrulama sistemi (OTP)
- ✅ Klinik doğrulama (otomatik)
- ✅ Admin audit paneli
- ✅ JWT authentication
- ✅ Dosya yükleme (Multer)
- ✅ Konum dönüşümü API
- ✅ Mobil Auth API (hasta + klinik login/signup)

#### Teknoloji Yığını:
```
bcryptjs     - Şifre hashing
express      - Web framework
mongoose     - MongoDB ORM
jsonwebtoken - JWT token
nodemailer   - Email servisi
multer       - Dosya yükleme
pdf-parse    - PDF işleme
helmet       - Güvenlik headers
cors         - CORS middleware
```

#### İç Yapı:
```
src/
├── server.js                    # Entry point
├── app.js                       # Express setup
├── config/db.js                 # MongoDB connection
├── models/
│   ├── Patient.js
│   ├── OtpCode.js
│   ├── Clinic.js
│   └── Admin.js
├── controllers/
│   ├── patient.controller.js
│   ├── clinic.controller.js
│   ├── admin.controller.js
│   ├── auth.patient.controller.js
│   ├── auth.clinic.controller.js
│   └── location.controller.js
├── routes/
│   ├── patient.routes.js
│   ├── clinic.routes.js
│   ├── admin.routes.js
│   ├── auth.patient.routes.js
│   ├── auth.clinic.routes.js
│   └── location.routes.js
├── services/
│   ├── messageService.js        # OTP gönderimi
│   └── otpService.js            # OTP logic
├── middlewares/
│   ├── auth.js                  # JWT middleware
│   ├── upload.js                # Multer config
│   └── errorHandler.js
└── scripts/
    └── seedAdmin.js             # Initial admin
```

#### Mevcut Endpoints:
- `POST /api/patients/request-otp` — OTP iste
- `POST /api/patients/verify-otp` — OTP doğrula
- `GET /api/patients/status` — Hasta durumu
- `POST /api/clinics/register` — Klinik kaydı
- `GET /api/clinics/status` — Klinik durumu
- `POST /api/admin/login` — Admin girişi
- `GET /api/admin/clinics` — Klinikleri listele
- `GET /api/admin/clinics/:id` — Klinik detayı
- `POST /api/auth/patients/signup` — Hasta kayıt
- `POST /api/auth/patients/login` — Hasta girişi
- `POST /api/auth/patients/otp/request` — OTP iste
- `POST /api/auth/patients/otp/verify` — OTP doğrula
- `GET /api/auth/patients/me` — Hasta profili
- `POST /api/auth/clinics/set-password` — Klinik şifre belirleme
- `POST /api/auth/clinics/login` — Klinik girişi
- `GET /api/auth/clinics/me` — Klinik profili
- `POST /api/location/convert` — Koordinat dönüşümü
- `POST /api/location/distance` — Mesafe hesaplama

---

### 📱 MOBIL (Ece Açar & Rumeysa Ersoy)
**Repository:** `https://github.com/MedoraDev-BTU/Medora-Mobile`

#### Beklenen Özellikler:
- ✍️ Hasta kayıt/giriş
- 📍 Konum bazlı klinik arama
- 🔍 Filtreleme (branş, puan, vs)
- 📅 Randevu oluşturma/takibi
- ⭐ Klinik/doktor puanlama
- ❤️ Favori sistemi
- 💊 Nöbetçi eczane
- 🔔 Bildirimler

#### Teknoloji:
- React Native + Expo
- JavaScript
- Redux/Context (state management)
- Axios (HTTP client)

---

### 🌐 WEB PANEL (Yunus Emre Nallı & Rima Farah Eleuch)
**Repository:** `https://github.com/MedoraDev-BTU/Medora-Web`

#### Beklenen Özellikler:
- ✍️ Klinik/doktor yönetimi
- 📅 Randevu onaylama/iptal
- 📊 İstatistikler & analizler
- 🕐 Çalışma saatleri düzenleme
- 🔔 Bildirimler
- 👁️ Puan & yorumlar takibi

#### Teknoloji:
- React + TypeScript
- HTML5 + CSS3

---

### 🗄️ VERİ & PYTHON (Kağan Emre Meral & Safarli Javidan)
**Repository:** `https://github.com/MedoraDev-BTU/Medora-DB`

#### Beklenen:
- 📊 Python API servisleri
- 🗄️ MongoDB şemaları
- 📈 Analitik ve raporlar
- 🔄 Veri işleme

---

## 👥 Ekip Görev Dağılımı

| Takım | Üyeler | Sorumlu | Deadline |
|-------|--------|---------|----------|
| **Backend** | Hüseyin Acar (@RetcapS)<br>Nermin Baycan (@nermnbycn) | Hüseyin | Hafta 3-4 |
| **Mobil** | Ece Açar (@ecemino)<br>Rumeysa Ersoy (@rumeysaersoyy) | Ece | Hafta 5 |
| **Web** | Yunus Emre Nallı (@YunS16)<br>Rima Farah Eleuch (@Rima2002) | Yunus | Hafta 5 |
| **Veri** | Kağan Emre Meral (@KaganEM16)<br>Safarli Javidan (@Javidaann) | Kağan | Hafta 4 |
| **Koordinasyon** | Ahmet Yumutkan (Ekip Lideri) | Ahmet | Devam |

---

## 📂 Repository Yapısı

### Genel GitHub Organizasyon
```
MedoraDev-BTU/
├── Medora-Backend/      ← Hüseyin (Lokal kopyası var)
├── Medora-Mobile/       ← Ece & Rumeysa
├── Medora-Web/          ← Yunus & Rima
├── Medora-DB/           ← Kağan & Safarli
├── .github/             ← Organization profile
└── MEDORA-Dokuman/      ← Dokümantasyon
```

### Backend (Lokal: C:\Medora\Medora)
Mevcut ve hazır. Diğer repoları pull etmek gerekli.

### Koordinasyon
Her takım kendi repository'sinde çalışacak ama aynı MongoDB'ye ve API'ye bağlanacak.

---

## 🔗 Entegrasyon Noktaları

### 1️⃣ BACKEND ↔ MOBİL
**Bağlantı:** REST API + HTTP (Axios)

| Mobil Uygulaması | Backend Endpoint | Durum |
|------------------|------------------|-------|
| Hasta Kayıt | `POST /api/auth/patients/signup` | ✅ Ready |
| Hasta Girişi | `POST /api/auth/patients/login` | ✅ Ready |
| OTP İste | `POST /api/auth/patients/otp/request` | ✅ Ready |
| OTP Doğrula | `POST /api/auth/patients/otp/verify` | ✅ Ready |
| Profil Getir | `GET /api/auth/patients/me` | ✅ Ready |
| Klinik Ara | `GET /api/clinics?location=...` | ❌ **EXİK** |
| Doktor Listesi | `GET /api/doctors?clinicId=...` | ❌ **EXİK** |
| Randevu Oluştur | `POST /api/appointments` | ❌ **EXİK** |
| Randevu Listesi | `GET /api/appointments?userId=...` | ❌ **EXİK** |
| Randevu Detayı | `GET /api/appointments/:id` | ❌ **EXİK** |
| Puanlama Gönder | `POST /api/ratings` | ❌ **EXİK** |
| Favorilere Ekle | `POST /api/favorites` | ❌ **EXİK** |
| Konum Dönüş | `POST /api/location/convert` | ✅ Ready |
| Nöbetçi Eczane | `GET /api/pharmacy?location=...` | ❌ **EXİK** |

### 2️⃣ BACKEND ↔ WEB
**Bağlantı:** REST API + Axios + TypeScript

| Web Paneli | Backend Endpoint | Durum |
|------------|-----------------|-------|
| Klinik Girişi | `POST /api/auth/clinics/login` | ✅ Ready |
| Klinik Şifre Belirleme | `POST /api/auth/clinics/set-password` | ✅ Ready |
| Klinik Profili | `GET /api/auth/clinics/me` | ✅ Ready |
| Doktor Ekle | `POST /api/doctors` | ❌ **EXİK** |
| Doktor Listesi | `GET /api/doctors?clinicId=...` | ❌ **EXİK** |
| Randevu Yönetimi | `GET/PUT /api/appointments` | ❌ **EXİK** |
| İstatistikler | `GET /api/analytics/...` | ❌ **EXİK** |
| Çalışma Saatleri | `PUT /api/clinics/:id/hours` | ❌ **EXİK** |

### 3️⃣ VERİ (Python) ↔ BACKEND
**Bağlantı:** Python API + REST

| Python Servisi | Node Backend | Durum |
|----------------|--------------|-------|
| Analitik Servisi | `/api/analytics/*` | ❌ **EXİK** |
| Raporlama | `/api/reports/*` | ❌ **EXİK** |
| Veri İşleme | Batch jobs | ❌ **EXİK** |

### 4️⃣ MOBİL ↔ VERİ (Doğrudan)
**Bağlantı:** REST API (Analytics dashboard)

Şimdilik sadece Backend üzerinden. Python API'ler daha sonra eklenebilir.

---

## 📡 API Kontratları

### ✅ HAZIR - Backend'de Mevcut

#### 1. Patient Authentication
```
POST /api/auth/patients/signup
Content-Type: application/json

{
  "email": "ayse@example.com",
  "password": "GucluSifre123!",
  "fullName": "Ayşe Yılmaz",
  "phone": "+905551112233"
}

Response (201):
{
  "message": "Kayit basarili",
  "token": "eyJhbGciOi...",
  "patient": {
    "id": "...",
    "email": "ayse@example.com",
    "isPhoneVerified": false,
    "authProviders": ["password"]
  }
}
```

#### 2. OTP Verification
```
POST /api/auth/patients/otp/verify
Content-Type: application/json

{
  "phone": "+905551112233",
  "code": "123456"
}

Response (200):
{
  "message": "Telefon başarıyla doğrulandı",
  "token": "eyJhbGciOi...",
  "patient": {
    "id": "...",
    "phone": "+905551112233",
    "isPhoneVerified": true
  }
}
```

---

### ❌ EXİK - Geliştirme Gerekli

#### 1. Klinik Arama (Mobil & Web)
```
GET /api/clinics/search?location=lat,lon&radius=5&branch=cardiyolog&page=1

Query Parameters:
- location: string (lat,lon format)
- radius: number (km cinsinden, default: 5)
- branch: string (branş adı, optional)
- rating: number (minimum puan, optional)
- page: number (pagination)
- limit: number (default: 10)

Response (200):
{
  "success": true,
  "total": 45,
  "page": 1,
  "limit": 10,
  "clinics": [
    {
      "id": "clinic123",
      "name": "Yıldız Tıp Merkezi",
      "address": "Bağdat Cad. No:42",
      "phone": "+902121234567",
      "branch": "Kardiiyoloji",
      "rating": 4.8,
      "distance": 2.5,
      "availableSlots": 15,
      "doctors": [
        {
          "id": "doc123",
          "name": "Dr. Ahmet Demir",
          "specialization": "Kardiyolog",
          "rating": 4.9
        }
      ]
    }
  ]
}
```

#### 2. Doktor Listesi
```
GET /api/doctors?clinicId=clinic123&branch=&availableOnly=true

Response (200):
{
  "success": true,
  "doctors": [
    {
      "id": "doc123",
      "name": "Dr. Ahmet Demir",
      "specialization": "Kardiyolog",
      "clinicId": "clinic123",
      "rating": 4.9,
      "reviewCount": 127,
      "availableHours": ["09:00", "10:30", "14:00"],
      "nextAvailable": "2026-06-07 09:00"
    }
  ]
}
```

#### 3. Randevu Oluşturma
```
POST /api/appointments
Content-Type: application/json
Authorization: Bearer <token>

{
  "patientId": "patient123",
  "doctorId": "doc123",
  "clinicId": "clinic123",
  "appointmentDate": "2026-06-20",
  "appointmentTime": "14:00",
  "reason": "Kontrol",
  "notes": "İlaç yazılması gerekebilir"
}

Response (201):
{
  "success": true,
  "appointment": {
    "id": "appt123",
    "patientId": "patient123",
    "doctorId": "doc123",
    "clinicId": "clinic123",
    "status": "pending",
    "appointmentDate": "2026-06-20",
    "appointmentTime": "14:00",
    "createdAt": "2026-06-06T10:30:00Z"
  }
}
```

#### 4. Randevu Listesi
```
GET /api/appointments?userId=patient123&status=pending&limit=10

Query Parameters:
- userId: string (hasta ID)
- status: string (pending/confirmed/completed/cancelled)
- startDate: string (ISO format, optional)
- endDate: string (ISO format, optional)
- limit: number (default: 10)
- page: number

Response (200):
{
  "success": true,
  "total": 3,
  "appointments": [
    {
      "id": "appt123",
      "clinic": { "id": "clinic123", "name": "Yıldız Tıp Merkezi" },
      "doctor": { "id": "doc123", "name": "Dr. Ahmet Demir" },
      "appointmentDate": "2026-06-20",
      "appointmentTime": "14:00",
      "status": "pending",
      "createdAt": "2026-06-06T10:30:00Z"
    }
  ]
}
```

#### 5. Puanlama Sistemi
```
POST /api/ratings
Content-Type: application/json
Authorization: Bearer <token>

{
  "appointmentId": "appt123",
  "clinicId": "clinic123",
  "doctorId": "doc123",
  "patientId": "patient123",
  "rating": 5,
  "comment": "Doktor çok ilgili ve yardımcı oldu"
}

Response (201):
{
  "success": true,
  "rating": {
    "id": "rating123",
    "appointmentId": "appt123",
    "rating": 5,
    "comment": "Doktor çok ilgili ve yardımcı oldu",
    "createdAt": "2026-06-21T15:00:00Z"
  }
}
```

#### 6. Favori Sistemi
```
POST /api/favorites
Content-Type: application/json
Authorization: Bearer <token>

{
  "patientId": "patient123",
  "clinicId": "clinic123",
  "doctorId": "doc123" // optional
}

Response (201):
{
  "success": true,
  "favorite": {
    "id": "fav123",
    "patientId": "patient123",
    "clinicId": "clinic123",
    "doctorId": "doc123",
    "createdAt": "2026-06-06T10:30:00Z"
  }
}

GET /api/favorites?userId=patient123
Response:
{
  "success": true,
  "favorites": [
    {
      "clinicId": "clinic123",
      "clinicName": "Yıldız Tıp Merkezi",
      "doctorId": "doc123",
      "doctorName": "Dr. Ahmet Demir"
    }
  ]
}
```

#### 7. Nöbetçi Eczane
```
GET /api/pharmacy/on-duty?location=lat,lon&radius=5

Response (200):
{
  "success": true,
  "pharmacies": [
    {
      "id": "pharm123",
      "name": "Yıldız Eczanesi",
      "address": "Bağdat Cad. No:50",
      "phone": "+902121234568",
      "distance": 1.2,
      "onDutyUntil": "2026-06-07T08:00:00Z"
    }
  ]
}
```

---

## 🗄️ Veri Modelleri

### Mevcut Modeller (Backend)
- **Patient** — Hasta
- **OtpCode** — OTP
- **Clinic** — Klinik
- **Admin** — Admin

### Gerekli Modeller (Eksik)
- **Doctor** — Doktor
- **Appointment** — Randevu
- **Rating** — Puan/Yorum
- **Favorite** — Favori
- **WorkingHours** — Çalışma Saatleri
- **Pharmacy** — Eczane

### Doctor Model Örneği
```javascript
const DoctorSchema = new Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
  bio: String,
  experience: Number, // Yıl
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  availableHours: [String], // ["09:00", "10:00", "14:00"]
  workingDays: [Number], // [0-6, Pazardan itibaren]
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
```

### Appointment Model Örneği
```javascript
const AppointmentSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true }, // "14:00"
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'postponed'],
    default: 'pending'
  },
  reason: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

---

## 📋 Entegrasyon Adımları

### FAZE 1: Hazırlık (Bu Hafta)
- [ ] Tüm repository'leri lokal'a klonla
- [ ] Git dallarını (branches) oluştur
- [ ] .env dosyalarını düzenle
- [ ] İletişim kanalını kur (Slack/Discord/WhatsApp)

### FAZA 2: Temel Modeller & API (Hafta 3)
- [ ] **Doctor Model** oluştur ve test et
- [ ] **Appointment Model** oluştur ve test et
- [ ] **Rating Model** oluştur ve test et
- [ ] **Favorite Model** oluştur ve test et
- [ ] **WorkingHours Model** oluştur ve test et
- [ ] MongoDB indexes tanımla (performans)

### FAZA 3: API Endpoints (Hafta 3-4)
- [ ] `GET /api/doctors` — Doktor listesi
- [ ] `GET /api/doctors/:id` — Doktor detayı
- [ ] `POST /api/doctors` — Doktor ekle (admin)
- [ ] `GET /api/clinics/search` — Klinik arama
- [ ] `POST /api/appointments` — Randevu oluştur
- [ ] `GET /api/appointments` — Randevu listesi
- [ ] `PUT /api/appointments/:id` — Randevu güncelle
- [ ] `DELETE /api/appointments/:id` — Randevu iptal
- [ ] `POST /api/ratings` — Puanlama gönder
- [ ] `GET /api/ratings` — Puanları getir
- [ ] `POST /api/favorites` — Favori ekle
- [ ] `DELETE /api/favorites/:id` — Favori kaldır
- [ ] `GET /api/pharmacy/on-duty` — Nöbetçi eczane

### FAZA 4: Frontend Entegrasyonu (Hafta 4-5)
- [ ] Mobil: Axios interceptor'ları ayarla
- [ ] Mobil: Login/Signup ekranları
- [ ] Mobil: Klinik arama ekranı
- [ ] Mobil: Randevu alma ekranı
- [ ] Mobil: Profil & randevu geçmişi
- [ ] Web: Klinik dashboard
- [ ] Web: Randevu yönetimi
- [ ] Web: Doktor yönetimi
- [ ] Web: İstatistikler

### FAZA 5: Test & Debugging (Hafta 5-6)
- [ ] API testleri (Postman)
- [ ] Mobil testleri
- [ ] Web testleri
- [ ] End-to-end test senaryoları
- [ ] Bug fixleri

### FAZA 6: Deployment (Hafta 7)
- [ ] Production environment ayarı
- [ ] Database backup/restore test
- [ ] Sunucu deployment
- [ ] Demo hazırlığı

---

## 🧪 Test Stratejisi

### 1. API Testleri (Postman)
Her endpoint için:
- Happy path test (başarılı senaryo)
- Error handling (validation hataları)
- Edge cases (sınır durumları)
- Performance test (hız)

**Örnek Test Planı:**
```
✓ POST /api/appointments (geçerli veri)
✗ POST /api/appointments (eksik tarih)
✗ POST /api/appointments (geçmiş tarih)
✓ GET /api/appointments?status=pending
✓ PUT /api/appointments/:id (durum değiştir)
✓ DELETE /api/appointments/:id
```

### 2. Mobile Tests
- Giriş/Kayıt akışı
- Klinik arama filtresi
- Randevu oluşturma
- Bildirim alması
- Offline mode

### 3. Web Tests
- Klinik giriş
- Randevu onaylama
- Doktor ekleme
- İstatistikleri görüntüleme

### 4. Database Tests
- MongoDB indeks performansı
- Query optimization
- Backup/restore test
- Data consistency

---

## 📞 İletişim & Koordinasyon

### Haftalık Meeting
- **Gün**: Pazartesi
- **Saat**: 14:00
- **Süre**: 30 dakika
- **Katılımcılar**: Tüm takım liderleri

### Meeting Gündem
1. Geçen haftanın özeti
2. Mevcut blokajlar
3. Bu haftanın hedefleri
4. Entegrasyon test sonuçları

### İletişim Kanalları
- **Ana**: GitHub Pull Requests + Issues
- **Acil**: Whatsapp Grup
- **Koordinasyon**: Weekly Meeting

### GitHub Workflow
```
main (production)
└── develop (staging)
    ├── feature/backend-doctors
    ├── feature/mobile-search
    ├── feature/web-dashboard
    └── bugfix/appointment-conflict
```

**Commit Mesaj Formatı:**
```
feat(appointments): add appointment creation endpoint
fix(auth): resolve token expiration issue
docs(api): update API documentation
test(ratings): add rating validation tests
```

---

## 🚀 Hızlı Başlangıç

### Backend Setup
```bash
# Repository'yi klonla
git clone https://github.com/MedoraDev-BTU/Medora-Backend
cd Medora-Backend

# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
cp .env.example .env

# Geliştirme server'ını başlat
npm run dev

# Başarılı oldu mu kontrol et
curl http://localhost:3000/health
```

### Mobil Setup
```bash
git clone https://github.com/MedoraDev-BTU/Medora-Mobile
cd Medora-Mobile

npm install
npm start  # Expo başlatır
```

### Web Setup
```bash
git clone https://github.com/MedoraDev-BTU/Medora-Web
cd Medora-Web

npm install
npm start  # React dev server
```

---

## 📋 Entegrasyon Checklist

### Before Production
- [ ] Tüm API'ler yazılı ve test edildi
- [ ] Mobil ve Web arayüzleri hazır
- [ ] Database backup stratejisi tanımlandı
- [ ] Error handling uygun
- [ ] Security checks geçildi
- [ ] Performance optimization yapıldı
- [ ] API documentation complete
- [ ] User testing tamamlandı

---

## 📞 Sorumlu Kişiler

| Rol | Kişi | GitHub | E-mail |
|-----|------|--------|--------|
| **Backend Lead** | Hüseyin Acar | @RetcapS | - |
| **Mobile Lead** | Ece Açar | @ecemino | - |
| **Web Lead** | Yunus Emre | @YunS16 | - |
| **Data Lead** | Kağan Emre | @KaganEM16 | - |
| **Project Manager** | Ahmet Yumutkan | @ahmetymtkn | ymtknahmet@gmail.com |

---

## 🔄 Sonraki Adımlar

1. ✅ **Bu planı tüm takımla paylaş** (GitHub Issues/PR)
2. ✅ **Repository'leri klonla** ve lokal setup yap
3. ✅ **Haftalık meeting'i düzenle** (Pazartesi 14:00)
4. ✅ **Geliştirmeye başla** → Faza 2: Models & APIs

---

**Plan Durumu:** 📝 DRAFT  
**Son Güncelleme:** 6 Haziran 2026  
**Sonraki Review:** 10 Haziran 2026
