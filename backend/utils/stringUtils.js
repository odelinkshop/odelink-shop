/**
 * NOVA STRING UTILS
 * Tüm proje genelinde kullanılan normalizasyon ve güvenli string işlemleri
 */

const normalizeTurkishChars = (str) => {
  return (str || '')
    .toString()
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C');
};

const slugify = (raw, maxLen = 20) => {
  let s = normalizeTurkishChars(raw).toLowerCase();
  s = s.replace(/shopier|magaza|store|official|resmi/gi, '');
  const cleaned = s
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return (cleaned || 'magaza').slice(0, maxLen);
};

const clampSubdomain = (raw, maxLen = 20) => {
  const cleaned = (raw || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return (cleaned || '').slice(0, Math.max(1, Number(maxLen) || 20));
};

const SUBDOMAIN_BLACKLIST = [
  'admin', 'api', 'pay', 'auth', 'login', 'www', 'mail', 'smtp', 'pop3', 
  'dev', 'test', 'stage', 'prod', 'root', 'super', 'odelink', 'nova',
  'billing', 'support', 'help', 'status', 'assets', 'static', 'cdn'
];

const isSubdomainReserved = (subdomain) => {
  const s = (subdomain || '').toLowerCase().trim();
  return SUBDOMAIN_BLACKLIST.includes(s);
};

module.exports = {
  normalizeTurkishChars,
  slugify,
  clampSubdomain,
  isSubdomainReserved,
  SUBDOMAIN_BLACKLIST
};
