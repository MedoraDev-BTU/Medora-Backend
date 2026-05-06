/* eslint-disable no-unused-vars */
module.exports = function errorHandler(err, req, res, next) {
  console.error('[Hata]', err);

  // Multer dosya boyutu vb.
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Dosya boyutu çok büyük' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Geçersiz veri', details: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Bu kayıt zaten mevcut', details: err.keyValue });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Sunucu hatası'
  });
};
