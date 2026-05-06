const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Clinic = require('../models/Clinic');

/**
 * NOT: Klinik onayi tamamen otomatiktir (clinicVerifier.js).
 * Bu modul sadece audit (gozlem) icindir; admin klinik kararini DEGISTIREMEZ.
 */

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email ve password zorunlu' });
    }
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) return res.status(401).json({ error: 'Gecersiz kimlik bilgileri' });

    const ok = await admin.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Gecersiz kimlik bilgileri' });

    const token = jwt.sign(
      { sub: admin._id.toString(), role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token, admin: { id: admin._id, email: admin.email, name: admin.name } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/clinics?status=approved|rejected|pending
 * Read-only: otomatik dogrulayicinin verdigi kararlari gozlemlemek icin.
 */
exports.listClinics = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const clinics = await Clinic.find(filter)
      .sort({ createdAt: -1 })
      .select('name contactEmail status verificationScore verificationSummary autoVerifiedAt createdAt')
      .lean();
    res.json({ count: clinics.length, clinics });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/clinics/:id
 * Read-only detay: dogrulama raporu dahil.
 */
exports.getClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) return res.status(404).json({ error: 'Klinik bulunamadi' });
    res.json(clinic);
  } catch (err) {
    next(err);
  }
};
