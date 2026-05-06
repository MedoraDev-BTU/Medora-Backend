const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'clinics');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg'
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const random = crypto.randomBytes(12).toString('hex');
    cb(null, `${Date.now()}-${random}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new Error('Yalnızca PDF, PNG veya JPG yükleyebilirsiniz'), false);
  }
  cb(null, true);
};

const maxMb = parseInt(process.env.MAX_UPLOAD_MB || '10', 10);

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxMb * 1024 * 1024,
    files: 6
  }
});
