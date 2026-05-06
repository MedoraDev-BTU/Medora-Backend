/**
 * Provider-agnostic bildirim servisi.
 * Twilio'ya bağımlı değildir; kanal seçimine göre çalışır:
 *
 *   MESSAGE_PROVIDER=mock       (varsayılan)  Kod terminale yazılır. Geliştirme/demo için bedava.
 *   MESSAGE_PROVIDER=whatsapp   Meta WhatsApp Cloud API. Ayda 1000 mesaj ücretsiz.
 *   MESSAGE_PROVIDER=email      Nodemailer + SMTP (Gmail vb.). Tamamen ücretsiz.
 *
 * Üst katmandaki kod (otpService) sadece sendOtp({ phone, email, code, ttlMinutes })
 * çağırır; bu modül uygun kanalı seçer.
 */

const PROVIDER = (process.env.MESSAGE_PROVIDER || 'mock').toLowerCase();

function buildBody(code, ttlMinutes) {
  return `Medora dogrulama kodunuz: ${code}\nKod ${ttlMinutes} dakika icinde gecerlidir. Kodu kimseyle paylasmayin.`;
}

// -------------------- MOCK --------------------
async function sendViaMock({ phone, email, code, ttlMinutes }) {
  const target = phone || email || 'unknown';
  console.log('--------------------------------------------------');
  console.log(`[MOCK MESSAGE] -> ${target}`);
  console.log(`[MOCK MESSAGE] ${buildBody(code, ttlMinutes)}`);
  console.log('--------------------------------------------------');
  return { provider: 'mock', target };
}

// -------------------- WHATSAPP CLOUD API --------------------
/**
 * Meta WhatsApp Cloud API (ayda 1000 ücretsiz konuşma).
 * Gerekli env:
 *   WHATSAPP_TOKEN          (Meta'dan alınan Access Token)
 *   WHATSAPP_PHONE_ID       (gönderici WhatsApp Business numarasının id'si)
 *   WHATSAPP_TEMPLATE_NAME  (önceden onaylı şablon, örn: 'medora_otp')
 *   WHATSAPP_TEMPLATE_LANG  (varsayılan: 'tr')
 *
 * Şablon, ilk parametre olarak {{1}} kodunu beklemelidir.
 */
async function sendViaWhatsApp({ phone, code }) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const template = process.env.WHATSAPP_TEMPLATE_NAME || 'medora_otp';
  const lang = process.env.WHATSAPP_TEMPLATE_LANG || 'tr';

  if (!token || !phoneId) {
    throw new Error('WHATSAPP_TOKEN veya WHATSAPP_PHONE_ID tanımlı değil');
  }
  if (!phone) throw new Error('WhatsApp için phone zorunlu');

  // E.164 formatından "+" kaldırılır (Meta API "+" istemez)
  const to = phone.replace(/^\+/, '');

  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: template,
      language: { code: lang },
      components: [
        {
          type: 'body',
          parameters: [{ type: 'text', text: String(code) }]
        }
      ]
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`WhatsApp API hatası: ${res.status} ${JSON.stringify(data)}`);
  }
  return { provider: 'whatsapp', target: phone, response: data };
}

// -------------------- EMAIL (Nodemailer) --------------------
let _transporter = null;
function getMailer() {
  if (_transporter) return _transporter;
  const nodemailer = require('nodemailer');

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error('SMTP_HOST, SMTP_USER, SMTP_PASS tanımlı olmalı');
  }
  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
  return _transporter;
}

async function sendViaEmail({ email, phone, code, ttlMinutes }) {
  if (!email) {
    throw new Error('Email kanalı seçildi ama hasta kayıtta email yok');
  }
  const mailer = getMailer();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const info = await mailer.sendMail({
    from: `"Medora" <${from}>`,
    to: email,
    subject: 'Medora doğrulama kodunuz',
    text: buildBody(code, ttlMinutes),
    html: `<p>Merhaba,</p>
           <p>Medora doğrulama kodunuz: <b style="font-size:18px">${code}</b></p>
           <p>Kod ${ttlMinutes} dakika içinde geçerlidir. Kodu kimseyle paylaşmayın.</p>`
  });
  return { provider: 'email', target: email, messageId: info.messageId };
}

// -------------------- DISPATCHER --------------------
async function sendOtp({ phone, email, code, ttlMinutes }) {
  switch (PROVIDER) {
    case 'whatsapp':
      return sendViaWhatsApp({ phone, code });
    case 'email':
      return sendViaEmail({ email, phone, code, ttlMinutes });
    case 'mock':
    default:
      return sendViaMock({ phone, email, code, ttlMinutes });
  }
}

module.exports = { sendOtp, PROVIDER };
