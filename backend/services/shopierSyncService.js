/**
 * SHOPIER SYNC SERVICE
 * Shopier'dan otomatik ürün senkronizasyonu
 */

const Site = require('../models/Site');
const { fetchShopierCatalog, normalizeShopierUrl } = require('./shopierCatalogService');

const safeText = (value) => (value == null ? '' : String(value)).trim();

/**
 * İki ürün listesini karşılaştır ve değişiklikleri bul
 */
function compareProducts(oldProducts, newProducts) {
  const oldMap = new Map();
  const newMap = new Map();

  // Eski ürünleri map'e ekle
  (Array.isArray(oldProducts) ? oldProducts : []).forEach((p) => {
    const url = safeText(p?.url).toLowerCase();
    if (url) oldMap.set(url, p);
  });

  // Yeni ürünleri map'e ekle
  (Array.isArray(newProducts) ? newProducts : []).forEach((p) => {
    const url = safeText(p?.url).toLowerCase();
    if (url) newMap.set(url, p);
  });

  const added = [];
  const removed = [];
  const updated = [];

  // Yeni eklenen ürünler
  newMap.forEach((newP, url) => {
    if (!oldMap.has(url)) {
      added.push({ ...newP, isNew: true, addedAt: new Date().toISOString() });
    }
  });

  // Silinen ürünler
  oldMap.forEach((oldP, url) => {
    if (!newMap.has(url)) {
      removed.push(oldP);
    }
  });

  // Güncellenen ürünler
  newMap.forEach((newP, url) => {
    if (oldMap.has(url)) {
      const oldP = oldMap.get(url);
      const hasChanges = 
        safeText(oldP?.name) !== safeText(newP?.name) ||
        safeText(oldP?.price) !== safeText(newP?.price) ||
        safeText(oldP?.image) !== safeText(newP?.image) ||
        JSON.stringify(oldP?.sizes || []) !== JSON.stringify(newP?.sizes || []) ||
        JSON.stringify(oldP?.images || []) !== JSON.stringify(newP?.images || []);

      if (hasChanges) {
        // Eski ürünün isNew ve addedAt bilgilerini koru
        updated.push({
          ...newP,
          isNew: oldP.isNew || false,
          addedAt: oldP.addedAt || null,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Değişiklik yoksa eski bilgileri koru
        updated.push({
          ...newP,
          isNew: oldP.isNew || false,
          addedAt: oldP.addedAt || null
        });
      }
    }
  });

  return { added, removed, updated };
}

/**
 * Eski "YENİ" badge'lerini temizle (7 günden eski)
 */
function cleanOldNewBadges(products) {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  return products.map((p) => {
    if (p.isNew && p.addedAt) {
      const addedTime = new Date(p.addedAt).getTime();
      if (addedTime < sevenDaysAgo) {
        return { ...p, isNew: false };
      }
    }
    return p;
  });
}

/**
 * Tek bir site için senkronizasyon yap
 */
async function syncSite(siteId) {
  try {
    console.log(`🔄 Sync başladı: ${siteId}`);

    const site = await Site.findById(siteId);
    if (!site) {
      console.log(`❌ Site bulunamadı: ${siteId}`);
      return { success: false, error: 'Site not found' };
    }

    const shopierUrl = safeText(site?.shopier_url || site?.shopierUrl);
    if (!shopierUrl) {
      console.log(`❌ Shopier URL yok: ${siteId}`);
      return { success: false, error: 'No Shopier URL' };
    }

    const normalizedUrl = normalizeShopierUrl(shopierUrl);
    if (!normalizedUrl) {
      console.log(`❌ Geçersiz Shopier URL: ${siteId}`);
      return { success: false, error: 'Invalid Shopier URL' };
    }

    // Shopier'dan güncel ürünleri çek
    console.log(`📦 Shopier'dan çekiliyor: ${normalizedUrl}`);
    const catalog = await fetchShopierCatalog(normalizedUrl, {
      debug: false,
      skipDetails: false,
      detailConcurrency: 2,
      detailMaxProducts: 0
    });

    const newProducts = Array.isArray(catalog?.products) ? catalog.products : [];
    if (!newProducts.length) {
      console.log(`⚠️ Shopier'dan ürün çekilemedi: ${siteId}`);
      return { success: false, error: 'No products from Shopier' };
    }

    // Mevcut ürünleri al
    const settings = site?.settings && typeof site.settings === 'object' ? site.settings : {};
    const oldProducts = Array.isArray(settings?.products_data) ? settings.products_data : [];

    // Karşılaştır
    const { added, removed, updated } = compareProducts(oldProducts, newProducts);

    console.log(`📊 Değişiklikler: +${added.length} yeni, -${removed.length} silindi, ~${updated.length} güncellendi`);

    // Tüm ürünleri birleştir
    let allProducts = [...added, ...updated];

    // Eski "YENİ" badge'lerini temizle
    allProducts = cleanOldNewBadges(allProducts);

    // Kategorileri güncelle
    const categories = Array.isArray(catalog?.categories) ? catalog.categories : [];

    // Site'ı güncelle
    await Site.update(siteId, {
      settings: {
        products_data: allProducts,
        collections: categories,
        catalog_total_products: allProducts.length,
        catalog_full_sync_complete: true,
        catalog_refreshed_at: new Date().toISOString(),
        last_sync_stats: {
          added: added.length,
          removed: removed.length,
          updated: updated.length,
          total: allProducts.length,
          synced_at: new Date().toISOString()
        }
      }
    });

    console.log(`✅ Sync tamamlandı: ${siteId}`);

    return {
      success: true,
      stats: {
        added: added.length,
        removed: removed.length,
        updated: updated.length,
        total: allProducts.length
      }
    };

  } catch (error) {
    console.error(`❌ Sync hatası: ${siteId}`, error);
    return {
      success: false,
      error: error?.message || String(error)
    };
  }
}

/**
 * Tüm siteleri senkronize et
 */
async function syncAllSites() {
  try {
    console.log('🚀 Tüm siteler için sync başladı');

    // Tüm siteleri al
    const sites = await Site.findAll();
    if (!Array.isArray(sites) || !sites.length) {
      console.log('⚠️ Hiç site yok');
      return { success: true, synced: 0, failed: 0 };
    }

    console.log(`📋 ${sites.length} site bulundu`);

    let synced = 0;
    let failed = 0;

    // Her site için senkronizasyon yap (sırayla, rate limit için)
    for (const site of sites) {
      try {
        const result = await syncSite(site.id);
        if (result.success) {
          synced++;
        } else {
          failed++;
        }

        // Rate limit için bekleme
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.error(`❌ Site sync hatası: ${site.id}`, e);
        failed++;
      }
    }

    console.log(`✅ Sync tamamlandı: ${synced} başarılı, ${failed} başarısız`);

    return {
      success: true,
      synced,
      failed,
      total: sites.length
    };

  } catch (error) {
    console.error('❌ syncAllSites hatası:', error);
    return {
      success: false,
      error: error?.message || String(error)
    };
  }
}

/**
 * Cron job başlat (her 1 dakikada bir - maksimum hız)
 */
function startSyncCron() {
  console.log('⏰ Shopier sync cron başlatıldı (her 1 dakikada bir - HIZLI MOD)');

  // İlk sync'i 30 saniye sonra yap
  setTimeout(() => {
    syncAllSites().catch(e => console.error('Cron sync error:', e));
  }, 30000);

  // Her 1 dakikada bir sync yap (daha hızlı ama güvenli)
  setInterval(() => {
    syncAllSites().catch(e => console.error('Cron sync error:', e));
  }, 60 * 1000);  // 1 DAKİKA - Ban yemeden maksimum hız
}

module.exports = {
  syncSite,
  syncAllSites,
  startSyncCron,
  compareProducts,
  cleanOldNewBadges
};
