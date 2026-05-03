const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const CacheService = require('../services/cacheService');

const createLimiter = (options) => rateLimit({
  windowMs: options.windowMs,
  max: options.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: options.message || 'Çok fazla istek.' },
  store: new RedisStore({
    sendCommand: (...args) => CacheService.client.call(...args),
    prefix: `rl:${options.prefix || 'global'}:`,
  }),
});

const globalLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Çok fazla istek gönderildi.',
  prefix: 'global'
});

const authLimiter = createLimiter({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Çok fazla giriş denemesi.',
  prefix: 'auth'
});

const supportLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Çok fazla destek mesajı.',
  prefix: 'support'
});

const sitesLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Site işlemleri limiti aşıldı.',
  prefix: 'sites'
});

const shopierLimiter = createLimiter({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Shopier bağlantı limiti.',
  prefix: 'shopier'
});

const metricsLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: 'Metrik limiti.'
});

const realShopierLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Gerçek zamanlı veri limiti.',
  prefix: 'real-shopier'
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
