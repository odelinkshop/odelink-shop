const jwt = require('jsonwebtoken');
const { getCookieValue } = require('../utils/httpCookies');

const ACCESS_COOKIE_NAME = (process.env.AUTH_ACCESS_COOKIE_NAME || 'odelink_access').toString().trim() || 'odelink_access';

const extractBearerToken = (value) => {
  const header = (value || '').toString().trim();
  if (!header) return '';

  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return '';

  return (match[1] || '').toString().trim();
};

const resolveRequestToken = (req) => {
  const bearerToken = extractBearerToken(req?.header?.('Authorization'));
  if (bearerToken) {
    return {
      token: bearerToken,
      source: 'bearer'
    };
  }

  const queryToken = (req?.query?.access_token || '').toString().trim();
  if (queryToken) {
    return {
      token: queryToken,
      source: 'query'
    };
  }

  const cookieToken = getCookieValue(req, ACCESS_COOKIE_NAME);
  if (cookieToken) {
    return {
      token: cookieToken,
      source: 'cookie'
    };
  }

  return {
    token: '',
    source: ''
  };
};

const authMiddleware = (req, res, next) => {
  try {
    const { token, source } = resolveRequestToken(req);

    if (!token) {
      return res.status(401).json({ error: 'Erisim reddedildi - Token bulunamadi' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not set');
      return res.status(500).json({ error: 'Sunucu yapilandirma hatasi' });
    }

    const decoded = jwt.verify(token, secret);
    const userId = (decoded?.userId || '').toString().trim();

    if (!userId) {
      return res.status(401).json({ error: 'Gecersiz token' });
    }

    req.userId = userId;
    req.authSource = source;
    req.authToken = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Gecersiz token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token suresi dolmus' });
    }
    res.status(500).json({ error: 'Sunucu hatasi' });
  }
};

module.exports = authMiddleware;
module.exports.extractBearerToken = extractBearerToken;
module.exports.resolveRequestToken = resolveRequestToken;
