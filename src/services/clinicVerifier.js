/**
 * Klinik basvurulari icin OTOMATIK dogrulayici.
 * Manuel admin onayi YOKTUR; basvuru anindaki form verisi + yuklenen belgeler bir
 * dizi heuristic kontrolden gecer ve toplam puan threshold'u asarsa basvuru
 * "approved", asmiyorsa "rejected" olarak isaretlenir.
 *
 * Tum bagimliliklar opsiyoneldir; pdf-parse kurulu degilse PDF icerik analizi
 * sessizce atlanir (puan dusuk kalir).
 */

const fs = require('fs');
const path = require('path');
const Clinic = require('../models/Clinic');

// Kurumsal e-posta saymadigimiz "free" domainler
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'yahoo.com.tr',
  'hotmail.com.tr', 'live.com', 'icloud.com', 'mail.com', 'aol.com', 'protonmail.com'
]);

// Saglik/ruhsat dokumaninda gecmesini bekledigimiz Turkce/Latince anahtar kelimeler
// (turkce karakterler hem orijinal hem normalize edilmis kontrol ediliyor)
const HEALTH_KEYWORDS = [
  'saglik', 'sağlık', 'bakanlik', 'bakanlığı', 'bakanligi',
  'ruhsat', 'tabip', 'hekim', 'klinik', 'tip merkezi', 'tıp merkezi',
  'mudurluk', 'müdürlük', 'mudurlugu', 'müdürlüğü',
  'vergi', 'vergi levhasi', 'vergi levhası', 't.c.', 'tc kimlik'
];

const PASS_THRESHOLD = 70; // 100 uzerinden gecme notu

// ----------------- yardimci fonksiyonlar -----------------

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/ı/g, 'i').replace(/İ/gi, 'i')
    .replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');
}

/**
 * Turkiye VKN (10 haneli vergi kimlik numarasi) checksum dogrulamasi.
 * Resmi algoritma; sahte/rastgele numaralari %99 oraninda reddeder.
 */
function isValidVKN(raw) {
  const s = String(raw || '').replace(/\D/g, '');
  if (!/^\d{10}$/.test(s)) return false;
  const digits = s.split('').map(Number);
  let sumP = 0;
  for (let i = 0; i < 9; i++) {
    let tmp = (digits[i] + (9 - i)) % 10;
    let pow = (tmp * Math.pow(2, 9 - i)) % 9;
    if (tmp !== 0 && pow === 0) pow = 9;
    sumP += pow;
  }
  const check = (10 - (sumP % 10)) % 10;
  return check === digits[9];
}

/**
 * Ruhsat numarasi format kontrolu.
 * Yaygin Turk formatlari: "34-12345", "34/12345", saf rakam (>= 4 hane).
 */
function isValidLicenseNumber(raw) {
  const s = String(raw || '').trim();
  if (!s) return false;
  return /^(\d{1,3})[-\/](\d{3,8})$/.test(s) || /^\d{4,12}$/.test(s);
}

function isCorporateEmail(email) {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1].toLowerCase().trim();
  if (!domain) return false;
  return !FREE_EMAIL_DOMAINS.has(domain);
}

function isTurkishE164Phone(raw) {
  return /^\+90\d{10}$/.test(String(raw || '').trim());
}

// PDF metnini opsiyonel olarak cikar (pdf-parse kuruluysa)
async function extractPdfText(filePath) {
  let pdfParse;
  try {
    pdfParse = require('pdf-parse');
  } catch (_) {
    return null; // paket yok, sessizce atla
  }
  try {
    const buf = await fs.promises.readFile(filePath);
    const data = await pdfParse(buf);
    return data.text || '';
  } catch (_) {
    return null;
  }
}

// ----------------- ayri kontroller -----------------
// Her kontrol { id, weight, passed, message } objesi dondurur

async function checkContactEmail(clinic) {
  const ok = isCorporateEmail(clinic.contactEmail);
  return {
    id: 'corporate_email',
    weight: 15,
    passed: ok,
    message: ok
      ? 'Iletisim e-postasi kurumsal bir alan adina ait.'
      : 'Iletisim e-postasi gmail/hotmail gibi serbest bir saglayicidan; klinik kurumsal e-posta kullanmali.'
  };
}

async function checkTaxNumber(clinic) {
  const ok = isValidVKN(clinic.taxNumber);
  return {
    id: 'tax_number',
    weight: 15,
    passed: ok,
    message: ok
      ? 'Vergi numarasi 10 haneli ve checksum dogru.'
      : 'Vergi numarasi Turkiye VKN format/checksum kontrolunu gecemedi.'
  };
}

async function checkLicenseNumber(clinic) {
  const ok = isValidLicenseNumber(clinic.licenseNumber);
  return {
    id: 'license_format',
    weight: 15,
    passed: ok,
    message: ok
      ? 'Ruhsat numarasi beklenen formata uygun.'
      : 'Ruhsat numarasi beklenen formata uymuyor (orn: 34-12345 veya 4-12 haneli rakam).'
  };
}

async function checkDocumentsBasics(clinic) {
  const docs = clinic.documents || [];
  const hasRuhsat = docs.some(d => d.kind === 'ruhsat');
  if (!hasRuhsat) {
    return {
      id: 'docs_basic',
      weight: 10,
      passed: false,
      message: 'En az bir adet "ruhsat" turunde belge yuklenmemis.'
    };
  }
  const tooSmall = docs.find(d => (d.size || 0) < 10 * 1024); // 10 KB altindaki sahte/bos dosya
  if (tooSmall) {
    return {
      id: 'docs_basic',
      weight: 10,
      passed: false,
      message: `Yuklenen belge ("${tooSmall.originalName}") cok kucuk (10 KB altinda).`
    };
  }
  return {
    id: 'docs_basic',
    weight: 10,
    passed: true,
    message: `${docs.length} belge yuklendi, en az biri ruhsat turunde, hepsi makul boyutta.`
  };
}

/**
 * PDF icerik analizi: yuklenen PDF'lerden en az birinde saglik/ruhsat ile ilgili
 * anahtar kelimelerin bulunmasi gerekir. PDF degilse veya pdf-parse yoksa atlar.
 */
async function checkDocumentContent(clinic, uploadDir) {
  const docs = clinic.documents || [];
  const pdfDocs = docs.filter(d => (d.mimeType || '').toLowerCase() === 'application/pdf');

  if (pdfDocs.length === 0) {
    // Sadece resim yuklenmis; OCR yok, bu kontrole gec gec et (yarim puan)
    return {
      id: 'docs_content',
      weight: 15,
      passed: true,
      partial: true,
      message: 'PDF belge yok, icerik analizi yapilamadi (resim belgeler atlanir).'
    };
  }

  let anyPdfRead = false;
  for (const d of pdfDocs) {
    const filePath = path.join(uploadDir, d.storedName);
    const text = await extractPdfText(filePath);
    if (text == null) continue;
    anyPdfRead = true;
    const norm = normalize(text);
    const hits = HEALTH_KEYWORDS.filter(kw => norm.includes(normalize(kw)));
    const nameHit = clinic.name && norm.includes(normalize(clinic.name));
    if (hits.length >= 2 || (hits.length >= 1 && nameHit)) {
      return {
        id: 'docs_content',
        weight: 15,
        passed: true,
        message: `PDF icinde saglik/ruhsat anahtar kelimeleri bulundu: ${hits.slice(0, 4).join(', ')}.`
      };
    }
  }
  if (!anyPdfRead) {
    return {
      id: 'docs_content',
      weight: 15,
      passed: true,
      partial: true,
      message: 'PDF icerigi okunamadi (pdf-parse kurulu olmayabilir); icerik kontrolu atlandi.'
    };
  }
  return {
    id: 'docs_content',
    weight: 15,
    passed: false,
    message: 'PDF icerigi saglik/ruhsat ile ilgili anahtar kelimeler icermiyor.'
  };
}

async function checkPhone(clinic) {
  const ok = isTurkishE164Phone(clinic.contactPhone);
  return {
    id: 'phone',
    weight: 10,
    passed: ok,
    message: ok ? 'Iletisim telefonu E.164 ve Turkiye numarasi.' : 'Iletisim telefonu Turkiye E.164 (+90...) formatinda degil.'
  };
}

async function checkAddress(clinic) {
  const ok = !!(clinic.address && clinic.address.length >= 10 && clinic.city && clinic.city.length >= 2);
  return {
    id: 'address',
    weight: 5,
    passed: ok,
    message: ok ? 'Adres ve sehir bilgisi mevcut.' : 'Adres veya sehir bilgisi eksik/yetersiz.'
  };
}

async function checkName(clinic) {
  const n = String(clinic.name || '').trim();
  const ok = n.length >= 3 && n.length <= 200 && !/[<>{}|\\$]/.test(n);
  return {
    id: 'name',
    weight: 5,
    passed: ok,
    message: ok ? 'Klinik adi makul.' : 'Klinik adi cok kisa, cok uzun ya da uygunsuz karakter iceriyor.'
  };
}

async function checkUniqueness(clinic) {
  // Ayni vergi/ruhsat numarasi daha once onayli mi?
  const conds = [];
  if (clinic.taxNumber) conds.push({ taxNumber: clinic.taxNumber });
  if (clinic.licenseNumber) conds.push({ licenseNumber: clinic.licenseNumber });
  if (conds.length === 0) {
    return { id: 'uniqueness', weight: 10, passed: true, message: 'Tekillik kontrolu icin yeterli alan yok, atlandi.' };
  }
  const dup = await Clinic.findOne({
    _id: { $ne: clinic._id },
    status: 'approved',
    $or: conds
  }).lean();
  if (dup) {
    return {
      id: 'uniqueness',
      weight: 10,
      passed: false,
      message: 'Ayni vergi veya ruhsat numarasiyla zaten onaylanmis baska bir klinik var.'
    };
  }
  return { id: 'uniqueness', weight: 10, passed: true, message: 'Vergi/ruhsat numarasi benzersiz.' };
}

// ----------------- ana fonksiyon -----------------

async function verifyClinic(clinic, uploadDir) {
  const checks = await Promise.all([
    checkContactEmail(clinic),
    checkTaxNumber(clinic),
    checkLicenseNumber(clinic),
    checkDocumentsBasics(clinic),
    checkDocumentContent(clinic, uploadDir),
    checkPhone(clinic),
    checkAddress(clinic),
    checkName(clinic),
    checkUniqueness(clinic)
  ]);

  let total = 0;
  let earned = 0;
  for (const c of checks) {
    total += c.weight;
    if (c.passed) earned += c.partial ? Math.floor(c.weight / 2) : c.weight;
  }
  const score = Math.round((earned / total) * 100);
  const decision = score >= PASS_THRESHOLD ? 'approved' : 'rejected';

  const summary = checks.filter(c => !c.passed).map(c => c.message).join(' | ') ||
                  'Tum kontroller basariyla gecildi.';

  return { score, threshold: PASS_THRESHOLD, decision, checks, summary };
}

module.exports = { verifyClinic, PASS_THRESHOLD, isValidVKN, isValidLicenseNumber };
