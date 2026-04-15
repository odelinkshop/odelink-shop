const rateLimit = require('express-rate-limit');

const createLimiter = (options) => rateLimit({
  windowMs: options.windowMs,
  max: options.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: options.message || 'Çok fazla istek.' }
});

const globalLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Çok fazla istek gönderildi.'
});

const authLimiter = createLimiter({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Çok fazla giriş denemesi.'
});

const supportLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Çok fazla destek mesajı.'
});

const sitesLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Site işlemleri limiti aşıldı.'
});

const shopierLimiter = createLimiter({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Shopier bağlantı limiti.'
});

const metricsLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: 'Metrik limiti.'
});

const realShopierLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Gerçek zamanlı veri limiti.'
});

const paymentLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Çok fazla ödeme isteği.'
});

const webhookLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Webhook rate limit exceeded.'
});

module.exports = {
  globalLimiter,
  authLimiter,
  supportLimiter,
  sitesLimiter,
  shopierLimiter,
  realShopierLimiter,
  metricsLimiter,
  paymentLimiter,
  webhookLimiter
};
