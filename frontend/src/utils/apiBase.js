export function getApiBase() {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;

  if (typeof window !== 'undefined') {
    const host = (window.location.hostname || '').toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:5000';

    // Keep platform requests on canonical origin to avoid cross-host redirects.
    if (host === 'odelink.shop' || host === 'www.odelink.shop') {
      return 'https://www.odelink.shop';
    }

    return `${window.location.protocol}//${window.location.host}`;
  }

  return 'https://www.odelink.shop';
}
