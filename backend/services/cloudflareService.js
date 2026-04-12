/**
 * Cloudflare API Service
 * Otomatik DNS kaydı ekleme/silme
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
 * @param {string} subdomain - Subdomain adı (örn: "flawsomewear")
 * @returns {Promise<Object>} DNS kaydı
 */
async function addDnsRecord(subdomain) {
  try {
    console.log(`🌐 Cloudflare DNS kaydı ekleniyor: ${subdomain}.${CLOUDFLARE_DOMAIN}`);

    // Önce var mı kontrol et
    const existing = await findDnsRecord(subdomain);
    if (existing) {
      console.log(`✅ DNS kaydı zaten var: ${subdomain}.${CLOUDFLARE_DOMAIN}`);
      return existing;
    }

    // Yeni kayıt ekle
    const record = await cloudflareRequest('/dns_records', {
      method: 'POST',
      body: JSON.stringify({
        type: 'A',
        name: subdomain,
        content: VPS_IP,
        ttl: 1, // Auto
        proxied: true, // Cloudflare proxy (turuncu bulut) - SSL otomatik!
        comment: `Auto-created for ${subdomain} site`
      })
    });

    console.log(`✅ DNS kaydı eklendi: ${subdomain}.${CLOUDFLARE_DOMAIN} (ID: ${record.id})`);
    return record;

  } catch (error) {
    console.error(`❌ DNS kaydı eklenemedi: ${subdomain}`, error);
    throw error;
  }
}

/**
 * DNS kaydını bul
 * @param {string} subdomain - Subdomain adı
 * @returns {Promise<Object|null>} DNS kaydı veya null
 */
async function findDnsRecord(subdomain) {
  try {
    const records = await cloudflareRequest(`/dns_records?type=A&name=${subdomain}.${CLOUDFLARE_DOMAIN}`);
    return records?.[0] || null;
  } catch (error) {
    console.error(`❌ DNS kaydı bulunamadı: ${subdomain}`, error);
    return null;
  }
}

/**
 * DNS kaydını sil
 * @param {string} subdomain - Subdomain adı
 * @returns {Promise<boolean>} Başarılı mı?
 */
async function deleteDnsRecord(subdomain) {
  try {
    console.log(`🗑️ Cloudflare DNS kaydı siliniyor: ${subdomain}.${CLOUDFLARE_DOMAIN}`);

    const record = await findDnsRecord(subdomain);
    if (!record) {
      console.log(`⚠️ DNS kaydı bulunamadı: ${subdomain}.${CLOUDFLARE_DOMAIN}`);
      return false;
    }

    await cloudflareRequest(`/dns_records/${record.id}`, {
      method: 'DELETE'
    });

    console.log(`✅ DNS kaydı silindi: ${subdomain}.${CLOUDFLARE_DOMAIN}`);
    return true;

  } catch (error) {
    console.error(`❌ DNS kaydı silinemedi: ${subdomain}`, error);
    throw error;
  }
}

/**
 * Tüm DNS kayıtlarını listele
 * @returns {Promise<Array>} DNS kayıtları
 */
async function listDnsRecords() {
  try {
    const records = await cloudflareRequest('/dns_records?type=A');
    return records || [];
  } catch (error) {
    console.error('❌ DNS kayıtları listelenemedi', error);
    throw error;
  }
}

module.exports = {
  addDnsRecord,
  findDnsRecord,
  deleteDnsRecord,
  listDnsRecords
};
