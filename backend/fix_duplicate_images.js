require('dotenv').config();
const pool = require('./config/database');

function normalizeShopierImageUrl(url) {
  if (!url) return '';
  let normalized = url.split('?')[0]
    .replace('pictures_mid', 'pictures')
    .replace('pictures_small', 'pictures')
    .replace('pictures_large', 'pictures');
  if (normalized.startsWith('//')) normalized = 'https:' + normalized;
  return normalized;
}

async function cleanupDuplicates() {
  try {
    console.log('🔍 Mevcut ürünlerdeki mükerrer resimler temizleniyor...');
    const res = await pool.query('SELECT id, images FROM products');
    let updatedCount = 0;

    for (const row of res.rows) {
      if (Array.isArray(row.images) && row.images.length > 1) {
        const uniqueImages = [...new Set(row.images.map(img => normalizeShopierImageUrl(img)))].filter(Boolean);
        
        if (uniqueImages.length !== row.images.length) {
          await pool.query('UPDATE products SET images = $1 WHERE id = $2', [JSON.stringify(uniqueImages), row.id]);
          updatedCount++;
        }
      }
    }

    console.log(`✅ İşlem tamam! ${updatedCount} ürün düzeltildi.`);
  } catch (err) {
    console.error('❌ Hata:', err.message);
  } finally {
    process.exit();
  }
}

cleanupDuplicates();
