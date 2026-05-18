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
  'billing', 'support', 'help', 'status', 'assets', 'static', 'cdn', 'custom'
];

const isSubdomainReserved = (subdomain) => {
  const s = (subdomain || '').toLowerCase().trim();
  return SUBDOMAIN_BLACKLIST.includes(s);
};

const isValidSubdomainStructure = (subdomain) => {
  const s = (subdomain || '').toLowerCase().trim();
  
  // 1. Min length: 3 characters, Max length: 20 characters
  if (s.length < 3 || s.length > 20) return false;
  
  // 2. Must contain at least one lowercase letter (no pure number subdomains)
  if (!/[a-z]/.test(s)) return false;
  
  // 3. Block consecutive repeating characters more than 3 times (e.g. aaaa, xxxx)
  if (/(.)\1\1\1/.test(s)) return false;
  
  // 4. Block 5 or more consecutive consonants (typical random keyboard walks like asdfg, sdfghj, qwrty)
  // Consonants: b, c, d, f, g, h, j, k, l, m, n, p, q, r, s, t, v, w, x, y, z
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(s)) return false;
  
  // 5. Block consecutive vowels more than 4 times (e.g., aeiou)
  if (/[aeiou]{4,}/.test(s)) return false;
  
  // 6. Block common keyboard walks/nonsense patterns
  const keyboardWalks = ['asdf', 'qwer', 'zxcv', 'hjkl', 'yuiop', 'bnm', 'lkj', 'mnb', 'rewq', 'fdsa'];
  for (const walk of keyboardWalks) {
    if (s.includes(walk)) return false;
  }
  
  return true;
};

module.exports = {
  normalizeTurkishChars,
  slugify,
  clampSubdomain,
  isSubdomainReserved,
  isValidSubdomainStructure,
  SUBDOMAIN_BLACKLIST
};
