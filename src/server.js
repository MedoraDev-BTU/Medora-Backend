require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Medora] Sunucu çalışıyor: http://localhost:${PORT}`);
      console.log(`[Medora] Ortam: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('[Medora] Başlatma hatası:', err);
    process.exit(1);
  }
})();
