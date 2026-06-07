# Medora — Doğrulama Servisi

Medora projesinin **kullanıcı doğrulama** modülü. Bu repo iki akıştan sorumludur:

1. **Hasta telefon doğrulaması** — SMS ile gönderilen tek kullanımlık kod (OTP) ile.
2. **Klinik doğrulaması** — klinik kaydı + ruhsat / vergi levhası gibi belgelerin yüklenmesi ve **admin tarafından manuel onaylanması**.

> Bu servis Node.js + Express + MongoDB (Mongoose) tabanlıdır.
> Bildirim katmanı **provider-agnostic**'tir: `mock`, `whatsapp` (Meta Cloud API — ayda 1000 mesaj **ücretsiz**) ve `email` (Nodemailer + SMTP — **ücretsiz**) kanallarından biri seçilir. Twilio gibi ücretli bir servise bağımlı değildir.

---

## Hızlı başlangıç

```bash
# 1. Bağımlılıklar
npm install

# 2. Ortam değişkenleri
cp .env.example .env
# .env dosyasını düzenleyin (en azından MONGO_URI ve JWT_SECRET)

# 3. MongoDB'yi başlatın (yerelde mongod çalışıyor olmalı)

# 4. İlk admini oluşturun (klinik onaylayabilen kullanıcı)
npm run seed:admin

# 5. Sunucuyu başlatın
npm run dev      # geliştirme (nodemon)
# veya
npm start
```

Sunucu varsayılan olarak `http://localhost:3000` adresinde çalışır.
Sağlık kontrolü: `GET /health`.

---

## Mimari

```
src/
  server.js              # giriş noktası
  app.js                 # Express uygulama (middleware, route'lar)
  config/db.js           # MongoDB bağlantısı
  models/                # Mongoose şemaları
    Patient.js           # hasta + telefon doğrulama durumu
    OtpCode.js           # hash'lenmiş OTP, TTL ile otomatik silinir
    Clinic.js            # klinik kaydı + yüklenen belgeler + onay durumu
    Admin.js             # klinik onayı yapan admin kullanıcı
  services/
    messageService.js    # OTP gönderimi: mock / whatsapp / email adapter'ları
    otpService.js        # OTP üretme / doğrulama mantığı
  controllers/
    patient.controller.js
    clinic.controller.js
    admin.controller.js
  routes/                # Express router'ları
  middlewares/
    auth.js              # JWT ile admin kimlik doğrulama
    upload.js            # multer ile belge yükleme (PDF/PNG/JPG, max 10 MB)
    errorHandler.js
  scripts/seedAdmin.js   # ilk admini oluşturur
uploads/clinics/         # yüklenen klinik belgeleri (gitignored)
```

---

## Hasta telefon doğrulaması

Akış: **istek at → SMS gelir → kodu gönder → telefon doğrulandı.**

OTP'ler veritabanına **bcrypt ile hash'lenerek** yazılır. 5 dk geçerli, en fazla 5 yanlış deneme, dakikada en fazla 5 istek (rate limit) ve aynı numaraya 60 sn cooldown vardır. Süresi dolan kayıtlar MongoDB TTL index ile otomatik temizlenir.

### `POST /api/patients/request-otp`

```json
{
  "phone": "+905551112233",
  "fullName": "Ayşe Yılmaz",
  "email": "ayse@example.com"
}
```
> `email` opsiyoneldir — yalnızca `MESSAGE_PROVIDER=email` kullanıldığında zorunludur.

Cevap:
```json
{ "message": "Doğrulama kodu gönderildi", "phone": "+905551112233", "ttlMinutes": 5 }
```

### `POST /api/patients/verify-otp`

```json
{ "phone": "+905551112233", "code": "123456" }
```

Cevap:
```json
{
  "message": "Telefon başarıyla doğrulandı",
  "patient": { "id": "...", "phone": "+905551112233", "isPhoneVerified": true }
}
```

### `GET /api/patients/status?phone=+905551112233`
Doğrulama durumunu döner.

---

## Klinik doğrulaması (OTOMATİK — admin onayı yok)

Klinik başvuruları `clinicVerifier.js` tarafından **anlık** olarak puanlanır ve sistem kendi kararını verir. Admin manuel onaylama yapmaz; sadece audit (gözlem) yetkisi vardır.

### Çalışan kontroller (toplam 100 puan)

| Kontrol | Puan | Ne yapıyor |
|---------|-----:|-----------|
| `corporate_email` | 15 | İletişim e-postası gmail/hotmail vb. değil, kurumsal alan adında. |
| `tax_number` | 15 | Türkiye **VKN checksum** algoritmasını geçiyor mu? |
| `license_format` | 15 | Ruhsat numarası beklenen formata uyuyor mu (örn. `34-12345`)? |
| `docs_basic` | 10 | En az bir `ruhsat` belgesi var mı? Tüm dosyalar > 10 KB mı? |
| `docs_content` | 15 | PDF içinde "Sağlık", "Ruhsat", "Bakanlığı" gibi anahtar kelimeler ve klinik adı geçiyor mu? (`pdf-parse` ile, kurulu değilse atlanır) |
| `phone` | 10 | İletişim telefonu `+90` ile başlayan 12 haneli E.164 mü? |
| `address` | 5 | Adres ≥ 10 karakter ve şehir dolu mu? |
| `name` | 5 | Klinik adı 3–200 karakter, uygunsuz karakter içermiyor mu? |
| `uniqueness` | 10 | Aynı vergi/ruhsat numarası daha önce **onaylanmış** başka bir klinikte yok mu? |

**Karar:** toplam puan ≥ **70** ise `approved`, değilse `rejected`. Reddedilen başvurularda yüklenmiş dosyalar diskten otomatik silinir.

### `POST /api/clinics/register`  (multipart/form-data)

| Alan | Açıklama |
|------|----------|
| `name` | Klinik adı (zorunlu) |
| `legalName` | Yasal ünvan |
| `taxNumber` | Vergi numarası (10 haneli, VKN) |
| `licenseNumber` | Sağlık Bakanlığı ruhsat no (örn. `34-12345`) |
| `contactEmail` | İletişim e-postası (zorunlu, benzersiz, kurumsal alan adı tercih edilir) |
| `contactPhone` | E.164 formatında telefon (`+905XX...`) |
| `address`, `city` | Adres bilgileri |
| `documents` | 1–6 dosya (PDF/PNG/JPG, max 10 MB) |
| `docKinds` | Her dosyanın türü, sırayla: `ruhsat`, `vergi-levhasi`, `imza-sirkuleri`, `diger` |

Örnek `curl`:
```bash
curl -X POST http://localhost:3000/api/clinics/register \
  -F "name=Yıldız Tıp Merkezi" \
  -F "legalName=Yıldız Sağlık Hizmetleri A.Ş." \
  -F "taxNumber=1234567890" \
  -F "contactEmail=info@yildiztip.com" \
  -F "contactPhone=+902121234567" \
  -F "address=Bağdat Cad. No:42 Kadıköy" \
  -F "city=İstanbul" \
  -F "licenseNumber=34-12345" \
  -F "documents=@./ruhsat.pdf" -F "docKinds=ruhsat" \
  -F "documents=@./vergi.pdf"  -F "docKinds=vergi-levhasi"
```

Yanıt (örnek — onay):
```json
{
  "message": "Klinik başarıyla doğrulandı ve onaylandı.",
  "clinic": {
    "id": "...",
    "status": "approved",
    "verificationScore": 85,
    "threshold": 70,
    "verificationSummary": "Tum kontroller basariyla gecildi.",
    "verificationReport": [
      { "id": "corporate_email", "weight": 15, "passed": true, "message": "..." },
      { "id": "tax_number",      "weight": 15, "passed": true, "message": "..." }
      // ...
    ]
  }
}
```

Yanıt (örnek — ret, HTTP 422):
```json
{
  "message": "Klinik başvurusu otomatik olarak reddedildi.",
  "clinic": {
    "status": "rejected",
    "verificationScore": 45,
    "threshold": 70,
    "verificationSummary": "Vergi numarasi Turkiye VKN format/checksum kontrolunu gecemedi. | ..."
  }
}
```

### `GET /api/clinics/status?email=info@yildiztip.com`
Klinik kendi başvurusunun durumunu, puanını ve özet sebebi görür.

---

## Admin (sadece audit)

Admin **klinik kararlarını değiştiremez**; sadece `clinicVerifier`'ın verdiği kararları görüntüler.

| Endpoint | Açıklama |
|----------|----------|
| `POST /api/admin/login` | JWT döner |
| `GET /api/admin/clinics?status=approved` | Otomatik onaylanan/reddedilen başvuruları listeler |
| `GET /api/admin/clinics/:id` | Detay: tüm puanlama raporu |

---

## OTP gönderim kanalları (ücretsiz)

`.env` içindeki `MESSAGE_PROVIDER` değişkeni hangi kanalın kullanılacağını belirler.

### 1. `mock` (varsayılan, ücretsiz)
Üretilen OTP terminale yazdırılır, gerçek bir mesaj gönderilmez. Geliştirme ve demo için yeterlidir; hocaya/jüriye sunum yaparken konsol çıktısı gösterilebilir.

### 2. `whatsapp` (Meta WhatsApp Cloud API — ayda 1000 mesaj ücretsiz)
Üretim için en iyi ücretsiz seçenek. Gerçekten kullanıcının telefonuna WhatsApp mesajı gönderir.

Adımlar:
1. https://developers.facebook.com adresinden bir uygulama oluştur, "WhatsApp" ürününü ekle.
2. Test phone number ID ve geçici Access Token al.
3. Mesaj şablonu (örnek `medora_otp`) oluşturup onaylat — şablon ilk parametre olarak kodu beklemeli (`{{1}}`).
4. `.env` dosyasını doldur:
   ```
   MESSAGE_PROVIDER=whatsapp
   WHATSAPP_TOKEN=EAAB...
   WHATSAPP_PHONE_ID=1234567890
   WHATSAPP_TEMPLATE_NAME=medora_otp
   WHATSAPP_TEMPLATE_LANG=tr
   ```

### 3. `email` (Nodemailer + SMTP — %100 ücretsiz)
OTP'yi telefon yerine e-postaya gönderir. Hasta kaydında `email` alanı varsa kullanılır.
Gmail için: hesapta 2FA'yı aç → "Uygulama şifresi" oluştur → `SMTP_PASS` olarak kullan.
```
MESSAGE_PROVIDER=email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ornek@gmail.com
SMTP_PASS=xxxxxxxxxxxxxxxx
SMTP_FROM="Medora <ornek@gmail.com>"
```

> İstersen iki kanalı birden çalıştırmak için kolayca `messageService.js` içinde `Promise.all` ile her iki adapter'ı da çağırabilirsin.

---

## Güvenlik notları

- OTP kodları veritabanında **asla düz metin** tutulmaz, bcrypt ile hash'lenir.
- Rate limit + cooldown ile brute force ve SMS bombing engellenir.
- Klinik belgeleri `/uploads` altında saklanır; üretimde S3 / GCS gibi private storage'a taşınmalı ve indirme imzalı URL ile yapılmalıdır.
- Admin token'ları JWT, varsayılan ömür 7 gün; `JWT_SECRET` mutlaka değiştirilmeli.
- Helmet ve CORS varsayılan olarak açıktır; üretimde CORS allowed origin listesi sıkılaştırılmalıdır.

---

## Mobil Auth API (yeni)

Mobil uygulama için **hasta** ve **klinik** girişlerini kapsayan, JWT tabanlı login/signup uçları. Tüm uçlar JSON kabul eder ve döner; başarılı girişlerde `Authorization: Bearer <token>` header'ı ile korunan endpoint'lere erişilir.

### Hasta — e-posta + şifre

#### `POST /api/auth/patients/signup`
```json
{ "email": "ayse@example.com", "password": "GucluSifre123!", "fullName": "Ayşe Yılmaz", "phone": "+905551112233" }
```
Cevap (201):
```json
{
  "message": "Kayit basarili",
  "token": "eyJhbGciOi...",
  "patient": { "id": "...", "email": "ayse@example.com", "isPhoneVerified": false, "authProviders": ["password"] }
}
```

#### `POST /api/auth/patients/login`
```json
{ "email": "ayse@example.com", "password": "GucluSifre123!" }
```

### Hasta — telefon + OTP

#### `POST /api/auth/patients/otp/request`
```json
{ "phone": "+905551112233", "fullName": "Ayşe Yılmaz" }
```

#### `POST /api/auth/patients/otp/verify`
```json
{ "phone": "+905551112233", "code": "123456" }
```
Cevap, `token` + `patient` döner; mobil uygulama token'ı saklar.

#### `GET /api/auth/patients/me`
Header: `Authorization: Bearer <token>` → kimliklenmiş hastayı döner.

### Klinik

#### `POST /api/auth/clinics/set-password`
İlk kez şifre belirleme (sadece **approved** klinikler için, kayıt sırasında verilen `taxNumber` ile doğrulanır).
```json
{ "contactEmail": "info@yildiztip.com", "password": "KlinikSifre123!", "taxNumber": "1234567890" }
```

#### `POST /api/auth/clinics/login`
```json
{ "contactEmail": "info@yildiztip.com", "password": "KlinikSifre123!" }
```

#### `GET /api/auth/clinics/me`
Header: `Authorization: Bearer <token>` → kimliklenmiş kliniği döner.

---

## Konum Dönüşümü — `/api/location`

Mobil cihaz GPS'inden gelen **lat/lon** koordinatları, harita kütüphaneleri (Google Maps, Leaflet, OSM) ve MongoDB 2dsphere ile uyumlu olması için **Web Mercator (EPSG:3857) x/y metre** ve **GeoJSON Point** formatlarına çevrilir.

> Bu uç, frontend (Ece Açar) ve backend arasında ortak veri formatı sağlamak için tasarlandı: mobil GPS'ten gelen değeri tek bir istekle backend'de kullanılabilir hâle getirir.

#### `POST /api/location/convert`

İstek (lat/lon → x/y):
```json
{ "lat": 41.0082, "lon": 28.9784 }
```

Cevap:
```json
{
  "input":      { "lat": 41.0082, "lon": 28.9784 },
  "projection": "EPSG:3857 (Web Mercator)",
  "xy":         { "x": 3225167.45, "y": 5014203.86 },
  "geoJSON":    { "type": "Point", "coordinates": [28.9784, 41.0082] },
  "unit":       "meters"
}
```

Ters çevirim (x/y → lat/lon):
```json
{ "x": 3225167.45, "y": 5014203.86 }
```

#### `POST /api/location/distance`
İki nokta arası kuş uçuşu mesafe (Haversine, metre):
```json
{ "from": { "lat": 41.0082, "lon": 28.9784 }, "to": { "lat": 39.9208, "lon": 32.8541 } }
```
Cevap:
```json
{ "meters": 351327.12, "kilometers": 351.33 }
```

---

## Yapılacaklar (sonraki sprintlere)

- E-posta ile klinik onay/red bildirimi gönderme
- Klinik admin paneli için web arayüzü
- Hasta + klinik için JWT tabanlı oturum
- Belgeler için private storage + virüs taraması
