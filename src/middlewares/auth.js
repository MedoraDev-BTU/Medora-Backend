const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');

function extractToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

exports.requireAdmin = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Yetkisiz: token yok' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Yetersiz yetki' });

    const admin = await Admin.findById(payload.sub);
    if (!admin) return res.status(401).json({ error: 'Admin bulunamadı' });

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token geçersiz veya süresi dolmuş' });
  }
};

/**
 * Mobil uygulamadan gelen hasta isteklerini dogrular.
 * req.patient olarak Patient dokumanini yerlestirir.
 */
exports.requirePatient = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Yetkisiz: token yok' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'patient') return res.status(403).json({ error: 'Yetersiz yetki' });

    const patient = await Patient.findById(payload.sub);
    if (!patient) return res.status(401).json({ error: 'Hasta bulunamadi' });

    req.patient = patient;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token gecersiz veya suresi dolmus' });
  }
};

/**
 * Klinik mobil/web isteklerini dogrular.
 */
exports.requireClinic = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Yetkisiz: token yok' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'clinic') return res.status(403).json({ error: 'Yetersiz yetki' });

    const clinic = await Clinic.findById(payload.sub);
    if (!clinic) return res.status(401).json({ error: 'Klinik bulunamadi' });
    if (clinic.status !== 'approved') {
      return res.status(403).json({ error: 'Klinik henuz onaylanmamis' });
    }

    req.clinic = clinic;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token gecersiz veya suresi dolmus' });
  }
};
