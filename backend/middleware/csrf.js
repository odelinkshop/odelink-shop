/**
 * CSRF PROTECTION MIDDLEWARE
 * Cross-Site Request Forgery saldırılarına karşı koruma
 */

const crypto = require('crypto');

// CSRF token'ları için in-memory store (production'da Redis kullanılabilir)
const tokenStore = new Map();

// Token temizleme - 1 saat eski token'ları sil
setInterval(() => {
  try {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    for (const [token, timestamp] of tokenStore.entries()) {
      if (now - timestamp > oneHour) {
        tokenStore.delete(token);
      }
    }
  } catch (e) {
    void e;
  }
}, 10 * 60 * 1000); // Her 10 dakikada bir temizle

/**
 * CSRF token oluştur
 */
function generateCsrfToken() {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    tokenStore.set(token, Date.now());
    return token;
  } catch (e) {
    console.error('❌ CSRF token generation error:', e);
    return null;
  }
}

/**
 * CSRF token doğrula
 */
function validateCsrfToken(token) {
  try {
    if (!token || typeof token !== 'string') return false;
    const exists = tokenStore.has(token);
    if (exists) {
      // Token kullanıldı, sil (one-time use)
      tokenStore.delete(token);
      return true;
    }
    return false;
  } catch (e) {
    console.error('❌ CSRF token validation error:', e);
    return false;
  }
}

/**
 * CSRF token middleware - token oluştur ve cookie'ye ekle
 */
const csrfTokenMiddleware = (req, res, next) => {
  try {
    // Token zaten varsa yeniden oluşturma
    if (req.csrfToken) return next();
    
    const token = generateCsrfToken();
    if (!token) {
      return res.status(500).json({ error: 'CSRF token oluşturulamadı' });
    }
    
    // Token'ı request'e ekle
    req.csrfToken = token;
    
    // Token'ı cookie'ye ekle (HttpOnly değil, JS'den okunabilir olmalı)
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // JS'den okunabilir olmalı
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 saat
    });
    
    next();
  } catch (e) {
    console.error('❌ CSRF token middleware error:', e);
    return res.status(500).json({ error: 'CSRF koruması başarısız' });
  }
};

/**
 * CSRF doğrulama middleware - POST/PUT/DELETE isteklerinde token kontrol et
 */
const csrfProtection = (req, res, next) => {
  try {
    // GET, HEAD, OPTIONS isteklerini atla
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    
    // Token'ı header'dan veya body'den al
    const token = req.headers['x-csrf-token'] || 
                  req.headers['x-xsrf-token'] || 
                  req.body?._csrf ||
                  req.body?.csrfToken;
    
    if (!token) {
      return res.status(403).json({ 
        error: 'CSRF token eksik',
        code: 'CSRF_TOKEN_MISSING'
      });
    }
    
    if (!validateCsrfToken(token)) {
      return res.status(403).json({ 
        error: 'Geçersiz CSRF token',
        code: 'CSRF_TOKEN_INVALID'
      });
    }
    
    next();
  } catch (e) {
    console.error('❌ CSRF protection error:', e);
    return res.status(500).json({ error: 'CSRF doğrulaması başarısız' });
  }
};

/**
 * Public endpoint'ler için CSRF koruması (daha esnek)
 * Newsletter, contact form gibi public form'lar için
 */
const csrfProtectionPublic = (req, res, next) => {
  try {
    // GET, HEAD, OPTIONS isteklerini atla
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    
    // Token varsa doğrula, yoksa geç (public endpoint)
    const token = req.headers['x-csrf-token'] || 
                  req.headers['x-xsrf-token'] || 
                  req.body?._csrf ||
                  req.body?.csrfToken;
    
    if (token && !validateCsrfToken(token)) {
      return res.status(403).json({ 
        error: 'Geçersiz CSRF token',
        code: 'CSRF_TOKEN_INVALID'
      });
    }
    
    next();
  } catch (e) {
    console.error('❌ CSRF protection public error:', e);
    return res.status(500).json({ error: 'CSRF doğrulaması başarısız' });
  }
};

module.exports = {
  generateCsrfToken,
  validateCsrfToken,
  csrfTokenMiddleware,
  csrfProtection,
  csrfProtectionPublic
};
