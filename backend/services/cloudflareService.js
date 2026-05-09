/**
 * Cloudflare API Service
 * Otomatik DNS kaydı ekleme/silme ve Özel Alan Adı (Custom Hostname) yönetimi
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || '';
const CLOUDFLARE_DOMAIN = 'odelink.shop';
const VPS_IP = '89.144.10.94';

/**
 * Cloudflare API isteği
 */
async function cloudflareRequest(endpoint, options = {}) {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    throw new Error('Cloudflare API yapılandırması eksik (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID)');
  }

  const url = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const error = new Error(data.errors?.[0]?.message || 'Cloudflare API hatası');
    error.cloudflareErrors = data.errors;
    throw error;
  }

  return data.result;
}

/**
 * DNS kaydı ekle (subdomain için)
 */
async function addDnsRecord(subdomain) {
  try {
    console.log(`🌐 Cloudflare DNS kaydı ekleniyor: ${subdomain}.${CLOUDFLARE_DOMAIN}`);
    const existing = await findDnsRecord(subdomain);
    if (existing) return existing;

    const record = await cloudflareRequest('/dns_records', {
      method: 'POST',
      body: JSON.stringify({
        type: 'A',
        name: subdomain,
        content: VPS_IP,
        ttl: 1,
        proxied: true,
        comment: `Auto-created for ${subdomain} site`
      })
    });

    return record;
  } catch (error) {
    console.error(`❌ DNS kaydı eklenemedi: ${subdomain}`, error);
    throw error;
  }
}

/**
 * DNS kaydını bul
 */
async function findDnsRecord(subdomain) {
  try {
    const records = await cloudflareRequest(`/dns_records?type=A&name=${subdomain}.${CLOUDFLARE_DOMAIN}`);
    return records?.[0] || null;
  } catch (error) {
    return null;
  }
}

/**
 * DNS kaydını sil
 */
async function deleteDnsRecord(subdomain) {
  try {
    const record = await findDnsRecord(subdomain);
    if (!record) return false;

    await cloudflareRequest(`/dns_records/${record.id}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * ÖZEL ALAN ADI (Custom Hostname) EKLE
 * Cloudflare for SaaS kullanarak SSL ve yönlendirme sağlar.
 * @param {string} hostname - Kullanıcının özel alan adı (örn: "magaza.com")
 */
async function addCustomHostname(hostname) {
  try {
    const domain = (hostname || '').toString().trim().toLowerCase();
    if (!domain) throw new Error('Geçersiz alan adı');

    console.log(`🛰️ Cloudflare Custom Hostname ekleniyor: ${domain}`);

    // Cloudflare Custom Hostnames API (SaaS)
    const result = await cloudflareRequest('/custom_hostnames', {
      method: 'POST',
      body: JSON.stringify({
        hostname: domain,
        ssl: {
          method: 'http',
          type: 'dv',
          settings: {
            min_tls_version: '1.2'
          }
        }
      })
    });

    console.log(`✅ Custom Hostname eklendi: ${domain} (ID: ${result.id})`);
    return result;
  } catch (error) {
    // Zaten ekliyse hata vermeden devam et
    if (error.message?.includes('already exists')) {
       console.log(`⚠️ Alan adı zaten kayıtlı: ${hostname}`);
       return { alreadyExists: true };
    }
    console.error(`❌ Custom Hostname eklenemedi: ${hostname}`, error);
    throw error;
  }
}

/**
 * Özel Alan Adı Durumunu Sorgula
 */
async function getCustomHostnameStatus(hostname) {
  try {
    const result = await cloudflareRequest(`/custom_hostnames?hostname=${hostname}`);
    return result?.[0] || null;
  } catch (error) {
    return null;
  }
}

/**
 * Özel Alan Adını Sil
 */
async function deleteCustomHostname(hostname) {
  try {
    const existing = await getCustomHostnameStatus(hostname);
    if (!existing) return false;

    await cloudflareRequest(`/custom_hostnames/${existing.id}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error(`❌ Custom Hostname silinemedi: ${hostname}`, error);
    throw error;
  }
}

module.exports = {
  addDnsRecord,
  findDnsRecord,
  deleteDnsRecord,
  addCustomHostname,
  getCustomHostnameStatus,
  deleteCustomHostname
};
