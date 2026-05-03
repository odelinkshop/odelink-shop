/**
 * SHOPIER SYNC SERVICE
 * Shopier'dan otomatik ürün senkronizasyonu
 */

const Site = require('../models/Site');
const { fetchShopierCatalog, normalizeShopierUrl } = require('./shopierCatalogService');
const aiSEOContentService = require('./aiSEOContentService');

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
        safeText(oldP?.description) !== safeText(newP?.description) ||
        JSON.stringify(oldP?.sizes || []) !== JSON.stringify(newP?.sizes || []) ||
        JSON.stringify(oldP?.variations || []) !== JSON.stringify(newP?.variations || []) ||
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

    // Mevcut ayarları al
    const settings = site?.settings && typeof site.settings === 'object' ? site.settings : {};
    const apiKey = settings?.shopier_api_key || '';

    // Shopier'dan güncel ürünleri çek
    console.log(`📦 Shopier'dan çekiliyor: ${normalizedUrl} ${apiKey ? '(API Key kullanılıyor)' : '(Scraping)'}`);
    const catalog = await fetchShopierCatalog(normalizedUrl, {
      debug: false,
      skipDetails: false,
      detailConcurrency: 2,
      detailMaxProducts: 0,
      apiKey: apiKey,
      bypassCache: true // Taze veri çek, eski veriyi unut!
    });

    const newProducts = Array.isArray(catalog?.products) ? catalog.products : [];
    if (!newProducts.length) {
      console.log(`⚠️ Shopier'dan ürün çekilemedi: ${siteId}`);
      return { success: false, error: 'No products from Shopier' };
    }

    // Mevcut ürünleri al
    const oldProducts = Array.isArray(settings?.products_data) ? settings.products_data : [];

    // Karşılaştır
    const { added, removed, updated } = compareProducts(oldProducts, newProducts);

    // 🤖 AI SEO Optimization (Sadece yeni eklenen ilk 10 ürün için - hız ve maliyet dengesi)
    if (added.length > 0) {
      console.log(`🤖 AI SEO Optimization başlıyor (${added.length} yeni ürün)...`);
      for (let i = 0; i < Math.min(added.length, 10); i++) {
        try {
          const optimized = await aiSEOContentService.optimizeProduct(added[i].name, added[i].description);
          added[i].description = optimized.description;
          console.log(`✨ Optimized: ${added[i].name}`);
        } catch (err) {
          console.error(`⚠️ Ürün AI hatası (${added[i].name}):`, err.message);
        }
      }
    }

    console.log(`📊 Değişiklikler: +${added.length} yeni, -${removed.length} silindi, ~${updated.length} güncellendi`);

    // Tüm ürünleri birleştir
    let allProducts = [...added, ...updated];

    // Kategorileri güncelle
    const categories = Array.isArray(catalog?.categories) ? catalog.categories : [];

    // Mağaza SEO Meta Verilerini Üret (Eğer yoksa)
    if (!settings.seoTitle || !settings.seoDescription) {
      console.log('📝 Mağaza SEO meta verileri AI ile oluşturuluyor...');
      const storeMeta = await aiSEOContentService.generateStoreMeta(site.name, categories);
      if (storeMeta) {
        settings.seoTitle = storeMeta.title;
        settings.seoDescription = storeMeta.description;
        console.log(`✅ SEO Title: ${storeMeta.title}`);
      }
    }

    // Eski "YENİ" badge'lerini temizle
    allProducts = cleanOldNewBadges(allProducts);

    // Site'ı güncelle
    await Site.update(siteId, {
      settings: {
        ...settings,
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
/**
 * Tüm siteleri senkronize et - AKILLI MOD
 */
let syncInProgress = false;
async function syncAllSites() {
  if (syncInProgress) {
    console.log('⚠️ Önceki sync hala devam ediyor, atlanıyor...');
    return;
  }
  
  syncInProgress = true;
  try {
    console.log('🚀 Akıllı Otomatik Pilot: Senkronizasyon başladı');

    // Tüm siteleri al
    const sites = await Site.findAll();
    if (!Array.isArray(sites) || !sites.length) {
      console.log('⚠️ Hiç site bulunamadı');
      return { success: true, synced: 0 };
    }

    const now = Date.now();
    let synced = 0;
    let failed = 0;

    // SİTELERİ FİLTRELE VE ÖNCELİKLENDİR
    const sitesToSync = sites.filter(site => {
      const settings = site?.settings || {};
      const lastSync = new Date(settings.catalog_refreshed_at || 0).getTime();
      const tier = (site.tier || 'standart').toLowerCase();
      
      // Profesyonel: 1 dakikada bir (60sn)
      // Standart: 5 dakikada bir (300sn)
      const threshold = tier === 'profesyonel' ? 60 * 1000 : 300 * 1000;
      
      return (now - lastSync) >= threshold;
    });

    if (sitesToSync.length === 0) {
      console.log('😴 Tüm siteler güncel, senkronizasyona gerek yok.');
      return { success: true, synced: 0 };
    }

    console.log(`📋 ${sitesToSync.length} site senkronizasyon sırasına alındı.`);

    for (const site of sitesToSync) {
      try {
        const result = await syncSite(site.id);
        if (result.success) synced++;
        else failed++;

        // Shopier'ı yormamak için uzun bekleme
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (e) {
        console.error(`❌ Site sync hatası: ${site.id}`, e);
        failed++;
      }
    }

    console.log(`✅ Akıllı Senkronizasyon Tamamlandı: ${synced} güncellendi, ${failed} başarısız.`);
    return { success: true, synced, failed };

  } catch (error) {
    console.error('❌ syncAllSites hatası:', error);
    return { success: false, error: error.message };
  } finally {
    syncInProgress = false;
  }
}

/**
 * Cron job başlat - GERÇEKTEN OTOMATİK MOD
 */
function startSyncCron() {
  console.log('⏰ Shopier Akıllı Otomatik Pilot Beklemede (Site Builder önceliği için arka plan sync kısıtlandı)');

  // Sunucu başladığında tüm siteleri YENİ MOTORLA zorla senkronize etme (Site Builder'ı engellememek için kapalı)
  /*
  setTimeout(async () => {
    // ...
  }, 5000);
  */

  // Her 10 dakikada bir kontrol et (daha seyrek)
  setInterval(() => {
    syncAllSites().catch(e => console.error('Cron sync error:', e));
  }, 10 * 60 * 1000); 
}

module.exports = {
  syncSite,
  syncAllSites,
  startSyncCron,
  compareProducts,
  cleanOldNewBadges
};
