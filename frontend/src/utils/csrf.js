/**
 * CSRF TOKEN HELPER
 * Frontend'de CSRF token kullanımı için yardımcı fonksiyonlar
 */

let cachedToken = null;
let tokenExpiry = 0;

/**
 * CSRF token al (cache'li)
 */
export async function getCsrfToken() {
  try {
    // Cache'de token varsa ve süresi dolmamışsa kullan
    const now = Date.now();
    if (cachedToken && now < tokenExpiry) {
      return cachedToken;
    }

    // Yeni token al
    const response = await fetch('/api/csrf-token', {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('CSRF token alınamadı');
    }

    const data = await response.json();
    cachedToken = data.csrfToken;
    
    // Token'ı 50 dakika cache'le (60 dakika geçerli ama güvenli olmak için 50)
    tokenExpiry = now + (50 * 60 * 1000);

    return cachedToken;
  } catch (error) {
    console.error('❌ CSRF token error:', error);
    throw error;
  }
}

/**
 * CSRF token'ı temizle (logout vs. için)
 */
export function clearCsrfToken() {
  cachedToken = null;
  tokenExpiry = 0;
}

/**
 * Fetch wrapper - otomatik CSRF token ekler
 */
export async function fetchWithCsrf(url, options = {}) {
  try {
    const method = (options.method || 'GET').toUpperCase();
    
    // GET, HEAD, OPTIONS için token gerekmez
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return fetch(url, {
        ...options,
        credentials: 'include'
      });
    }

    // POST, PUT, DELETE için token ekle
    const token = await getCsrfToken();
    
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        'X-CSRF-Token': token
      }
    });
  } catch (error) {
    console.error('❌ Fetch with CSRF error:', error);
    throw error;
  }
}

/**
 * Axios interceptor için CSRF token ekleyici
 */
export function setupAxiosCsrfInterceptor(axios) {
  axios.interceptors.request.use(
    async (config) => {
      const method = (config.method || 'get').toLowerCase();
      
      // GET, HEAD, OPTIONS için token gerekmez
      if (['get', 'head', 'options'].includes(method)) {
        return config;
      }

      // POST, PUT, DELETE için token ekle
      try {
        const token = await getCsrfToken();
        config.headers['X-CSRF-Token'] = token;
      } catch (error) {
        console.error('❌ Axios CSRF interceptor error:', error);
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

/**
 * Form submit için CSRF token ekle
 */
export async function addCsrfToFormData(formData) {
  try {
    const token = await getCsrfToken();
    formData.append('_csrf', token);
    return formData;
  } catch (error) {
    console.error('❌ Add CSRF to FormData error:', error);
    throw error;
  }
}

/**
 * JSON body'ye CSRF token ekle
 */
export async function addCsrfToBody(body) {
  try {
    const token = await getCsrfToken();
    return {
      ...body,
      _csrf: token
    };
  } catch (error) {
    console.error('❌ Add CSRF to body error:', error);
    throw error;
  }
}

// Kullanım örnekleri:
/*

// 1. fetchWithCsrf kullanımı (önerilen)
import { fetchWithCsrf } from './utils/csrf';

const response = await fetchWithCsrf('/api/sites', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

// 2. Manuel token kullanımı
import { getCsrfToken } from './utils/csrf';

const token = await getCsrfToken();
const response = await fetch('/api/sites', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token
  },
  body: JSON.stringify(data)
});

// 3. Axios ile kullanım
import axios from 'axios';
import { setupAxiosCsrfInterceptor } from './utils/csrf';

setupAxiosCsrfInterceptor(axios);

// Artık tüm axios istekleri otomatik olarak CSRF token içerir
await axios.post('/api/sites', data);

// 4. FormData ile kullanım
import { addCsrfToFormData } from './utils/csrf';

const formData = new FormData();
formData.append('name', 'Site Adı');
await addCsrfToFormData(formData);

await fetch('/api/sites', {
  method: 'POST',
  body: formData
});

// 5. Logout sonrası token temizleme
import { clearCsrfToken } from './utils/csrf';

function logout() {
  clearCsrfToken();
  // ... diğer logout işlemleri
}

*/
