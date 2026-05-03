/**
 * API UTILITY WITH CSRF TOKEN SUPPORT
 * Tüm API çağrıları için merkezi utility
 */

let csrfToken = null;
let tokenExpiry = 0;

/**
 * CSRF token al (cache'li)
 */
async function getCsrfToken() {
  try {
    // Cache'de token varsa ve süresi dolmamışsa kullan
    const now = Date.now();
    if (csrfToken && now < tokenExpiry) {
      return csrfToken;
    }

    // Yeni token al
    const response = await fetch('/api/csrf-token', {
      credentials: 'include'
    });

    if (!response.ok) {
      console.warn('CSRF token alınamadı, devam ediliyor...');
      return null;
    }

    const data = await response.json();
    csrfToken = data.csrfToken;
    
    // Token'ı 50 dakika cache'le (60 dakika geçerli ama güvenli olmak için 50)
    tokenExpiry = now + (50 * 60 * 1000);

    return csrfToken;
  } catch (error) {
    console.warn('CSRF token error:', error);
    return null;
  }
}

/**
 * CSRF token'ı temizle (logout vs. için)
 */
export function clearCsrfToken() {
  csrfToken = null;
  tokenExpiry = 0;
}

/**
 * Fetch wrapper - otomatik CSRF token ekler
 */
export async function apiFetch(url, options = {}) {
  try {
    const method = (options.method || 'GET').toUpperCase();
    
    // GET, HEAD, OPTIONS için token gerekmez
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return fetch(url, {
        ...options,
        credentials: options.credentials || 'include'
      });
    }

    // POST, PUT, DELETE için token ekle
    const token = await getCsrfToken();
    
    const headers = {
      ...options.headers
    };
    
    // Token varsa ekle, yoksa devam et (backward compatibility)
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
    
    return fetch(url, {
      ...options,
      credentials: options.credentials || 'include',
      headers
    });
  } catch (error) {
    console.error('apiFetch error:', error);
    // Hata olsa bile fetch'i dene (backward compatibility)
    return fetch(url, {
      ...options,
      credentials: options.credentials || 'include'
    });
  }
}

/**
 * API helper fonksiyonları
 */
export const api = {
  get: (url, options = {}) => apiFetch(url, { ...options, method: 'GET' }),
  post: (url, data, options = {}) => apiFetch(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: JSON.stringify(data)
  }),
  put: (url, data, options = {}) => apiFetch(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: JSON.stringify(data)
  }),
  delete: (url, options = {}) => apiFetch(url, { ...options, method: 'DELETE' })
};

export default api;
