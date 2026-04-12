const parseCookieHeader = (value) => {
  const header = (value || '').toString();
  if (!header) return {};

  return header
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const eqIndex = part.indexOf('=');
      if (eqIndex <= 0) return acc;

      const key = part.slice(0, eqIndex).trim();
      const rawValue = part.slice(eqIndex + 1).trim();
      if (!key) return acc;

      try {
        acc[key] = decodeURIComponent(rawValue);
      } catch (error) {
        acc[key] = rawValue;
      }
      return acc;
    }, {});
};

const getCookieValue = (req, name) => {
  const key = (name || '').toString().trim();
  if (!key) return '';
  const cookies = parseCookieHeader(req?.headers?.cookie || '');
  return (cookies[key] || '').toString();
};

const normalizeCookieDomain = (host) => {
  const raw = (host || '').toString().trim().toLowerCase();
  if (!raw) return undefined;
  const hostname = raw.split(',')[0].trim().split(':')[0];
  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') return undefined;
  if (hostname === 'odelink.shop' || hostname === 'www.odelink.shop' || hostname.endsWith('.odelink.shop')) {
    return '.odelink.shop';
  }
  return undefined;
};

const parseDurationToMs = (value, fallbackMs) => {
  if (value === null || value === undefined || value === '') {
    return Number(fallbackMs || 0);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  const raw = (value || '').toString().trim().toLowerCase();
  if (!raw) return Math.max(0, Number(fallbackMs || 0));

  if (/^\d+$/.test(raw)) {
    return Math.max(0, Number(raw));
  }

  const match = raw.match(/^(\d+)\s*(ms|s|m|h|d)$/);
  if (!match) return Math.max(0, Number(fallbackMs || 0));

  const amount = Number(match[1] || 0);
  const unit = (match[2] || 'ms').toString();
  const factors = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return Math.max(0, amount * (factors[unit] || 1));
};

module.exports = {
  parseCookieHeader,
  getCookieValue,
  normalizeCookieDomain,
  parseDurationToMs
};
