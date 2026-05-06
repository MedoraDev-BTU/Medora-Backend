const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.requireAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
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
