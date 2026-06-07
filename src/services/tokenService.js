const jwt = require('jsonwebtoken');

const DEFAULT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Yeni bir JWT uretir.
 * @param {object} payload - sub, role gibi alanlar
 * @param {object} [options] - { expiresIn }
 */
function signToken(payload, options = {}) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET tanimli degil; .env dosyasini kontrol edin');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: options.expiresIn || DEFAULT_EXPIRES_IN
  });
}

/**
 * Tokeni dogrular, gecersizse hata firlatir.
 */
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
