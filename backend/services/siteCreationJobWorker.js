const crypto = require('crypto');

const AutoBuildJobStore = require('../models/AutoBuildJobStore');
const Site = require('../models/Site');
const Subscription = require('../models/Subscription');
const { fetchShopierCatalog, normalizeShopierUrl } = require('./shopierCatalogService');
const { fetchAllProductsFromShopierAPI } = require('./shopierApiService');

const safeText = (value) => (value == null ? '' : String(value)).trim();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));

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

const slugify = (raw) => {
  let s = safeText(raw).toLowerCase();
  s = s.replace(/shopier|magaza|store|official|resmi/gi, '');
  const ascii = s
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
  const cleaned = ascii
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return (cleaned || 'magaza').slice(0, 20);
};

const nowIso = () => new Date().toISOString();

const newJobId = () => {
  try {
    if (crypto.randomUUID) return crypto.randomUUID();
  } catch (e) {
    void e;
  }
  return `job_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const buildLog = (message, extra) => ({
  timestamp: nowIso(),
  message: safeText(message),
  ...(extra && typeof extra === 'object' ? extra : {})
});

const buildSiteSettings = ({ normalizedShopierUrl, description, products, categories, totalProducts }) => ({
  description: safeText(description),
  created_at: nowIso(),
  products_data: Array.isArray(products) ? products : [],
  collections: Array.isArray(categories) ? categories : [],
  catalog_total_products: Number(totalProducts || 0),
  catalog_full_sync_complete: true,
  catalog_refreshed_at: nowIso(),
  shopier_url: normalizedShopierUrl,
  shopierUrl: normalizedShopierUrl
});

const runOneJob = async (job) => {
  const jobId = safeText(job?.jobId);
  if (!jobId) return;

  const log = async (msg, extra) => {
    await AutoBuildJobStore.appendLog(jobId, buildLog(msg, extra));
  };

  const fail = async (msg) => {
    await AutoBuildJobStore.updateProgress(jobId, { progress: Math.max(1, Number(job?.progress || 1) || 1), message: msg, status: 'failed' });
    await log(`FAILED: ${msg}`);
    await AutoBuildJobStore.markFailed(jobId, { message: msg });
  };

  try {
    await log('Job başladı');
    await AutoBuildJobStore.updateProgress(jobId, { progress: 5, message: 'Plan ve limit kontrolü' });

    const userId = safeText(job?.userId);
    const shopierUrl = safeText(job?.shopierUrl);
    const siteName = safeText(job?.siteName) || 'Mağazam';
    const payload = job?.payload && typeof job.payload === 'object' ? job.payload : {};
    const settingsFromPayload = payload?.settings && typeof payload.settings === 'object' ? payload.settings : {};
    const description = safeText(payload?.description || settingsFromPayload?.description);
    const normalizedShopierUrl = normalizeShopierUrl(shopierUrl);
    const resultSiteId = safeText(job?.resultSiteId || job?.resultSiteID || job?.result_site_id || '');
    if (!userId || !normalizedShopierUrl) {
      await fail('Geçersiz job verisi');
      return;
    }

    // Update site sync state (best-effort)
    if (resultSiteId) {
      try {
        await Site.update(resultSiteId, {
          settings: {
            shopier_sync: {
              status: 'running',
              jobId,
              started_at: nowIso()
            }
          }
        });
      } catch (e) {
        void e;
      }
    }

    // Try to reuse cached catalog from an existing site with the same Shopier URL.
    // This dramatically reduces 429 rate limits for repeated builds.
    try {
      await AutoBuildJobStore.updateProgress(jobId, { progress: 10, message: 'Katalog kontrol ediliyor' });
      const existing = await Site.findMostRecentByShopierUrl(normalizedShopierUrl);
      const settings = existing?.settings && typeof existing.settings === 'object' ? existing.settings : null;
      const existingProducts = Array.isArray(settings?.products_data) ? settings.products_data : [];
      const existingCategories = Array.isArray(settings?.collections) ? settings.collections : [];
      const existingTotal = Number(settings?.catalog_total_products || existingProducts.length || 0);
      if (existingProducts.length) {
        await AutoBuildJobStore.updateProgress(jobId, { progress: 70, message: 'Önceki katalog kullanılıyor' });

        const requestedSub = clampSubdomain(safeText(job?.subdomain) || slugify(siteName), 20);
        const siteData = {
          userId,
          name: siteName,
          shopierUrl: normalizedShopierUrl,
          subdomain: requestedSub,
          settings: {
            ...(settingsFromPayload || {}),
            ...buildSiteSettings({
              normalizedShopierUrl,
              description,
              products: existingProducts,
              categories: existingCategories,
              totalProducts: existingTotal
            })
          }
        };

        const site = resultSiteId
          ? await Site.update(resultSiteId, { settings: siteData.settings })
          : await Site.create(siteData);
        await AutoBuildJobStore.updateProgress(jobId, { progress: 100, message: 'Tamamlandı', status: 'completed' });
        await AutoBuildJobStore.markCompleted(jobId, { resultSiteId: site?.id, message: 'Tamamlandı' });
        await log('COMPLETED (reused catalog)', { siteId: site?.id, subdomain: site?.subdomain });

        if (resultSiteId) {
          try {
            await Site.update(resultSiteId, {
              settings: {
                shopier_sync: {
                  status: 'completed',
                  jobId,
                  completed_at: nowIso()
                }
              }
            });
          } catch (e) {
            void e;
          }
        }
        return;
      }
    } catch (reuseErr) {
      void reuseErr;
    }

    await AutoBuildJobStore.updateProgress(jobId, { progress: 30, message: 'Nova Neural Mirror: Akıllı senkronizasyon başlatılıyor...' });
    
    let basicProducts = [];
    let categories = [];
    let totalProducts = 0;
    let syncMethod = 'NEURAL_MIRROR';

    // 1. ÖNCELİK: Resmi Shopier API (Eğer Token Varsa)
    const apiToken = process.env.SHOPIER_API_TOKEN;
    if (apiToken) {
      await log('Neural Layer 1: Resmi API kanalı aktif.');
      try {
        const apiResult = await fetchAllProductsFromShopierAPI(normalizedShopierUrl, apiToken);
        if (apiResult && apiResult.length > 0) {
          basicProducts = apiResult;
          totalProducts = apiResult.length;
          syncMethod = 'OFFICIAL_API';
          await log(`Resmi API ile ${totalProducts} ürün çekildi.`);
        }
      } catch (apiErr) {
        await log(`Resmi API uyarısı: ${apiErr.message}. Layer 2 (Neural Mirror) deneniyor...`);
      }
    }

    // 2. ÖNCELİK: Nova Neural Mirror (Network Interception) - EN GÜÇLÜ YÖNTEM
    if (basicProducts.length === 0) {
      await log('Neural Layer 2: Nova Neural Mirror (Ağ Dinleme) başlatılıyor...');
      const basicCatalog = await fetchShopierCatalog(normalizedShopierUrl, {
        debug: true,
        skipDetails: true
      });
      basicProducts = Array.isArray(basicCatalog?.products) ? basicCatalog.products : [];
      categories = Array.isArray(basicCatalog?.categories) ? basicCatalog.categories : [];
      totalProducts = Number(basicCatalog?.totalProducts || basicCatalog?.totalCount || basicProducts.length || 0);
      syncMethod = 'NEURAL_MIRROR';
      await log(`Neural Mirror ile ${totalProducts} ürün yakalandı.`);
    }

    if (!basicProducts.length || totalProducts <= 0) {
      await fail('Shopier ürünleri çekilemedi (0 ürün)');
      return;
    }

    await AutoBuildJobStore.updateProgress(jobId, { progress: 50, message: 'Site oluşturuluyor' });

    const requestedSub = clampSubdomain(safeText(job?.subdomain) || slugify(siteName), 20);

    await AutoBuildJobStore.updateProgress(jobId, { progress: 60, message: 'Site kaydediliyor' });

    const siteData = {
      userId,
      name: siteName,
      shopierUrl: normalizedShopierUrl,
      subdomain: requestedSub,
      settings: {
        ...(settingsFromPayload || {}),
        ...buildSiteSettings({
          normalizedShopierUrl,
          description,
          products: basicProducts,
          categories,
          totalProducts
        }),
        catalog_sync_method: syncMethod,
        catalog_enrichment_status: (syncMethod === 'OFFICIAL_API' || syncMethod === 'NEURAL_MIRROR') ? 'completed' : 'pending'
      }
    };

    const site = resultSiteId
      ? await Site.update(resultSiteId, { settings: siteData.settings })
      : await Site.create(siteData);

    await AutoBuildJobStore.updateProgress(jobId, { progress: 100, message: 'Site hazır! Ürün detayları arka planda yükleniyor...' });
    await AutoBuildJobStore.markCompleted(jobId, { resultSiteId: site?.id, message: 'Site oluşturuldu' });
    await log('Site created, starting background enrichment', { siteId: site?.id, subdomain: site?.subdomain });

    if (resultSiteId) {
      try {
        await Site.update(resultSiteId, {
          settings: {
            shopier_sync: {
              status: 'completed',
              jobId,
              completed_at: nowIso()
            }
          }
        });
      } catch (e) {
        void e;
      }
    }

    // ARKA PLANDA DETAYLI ÇEKİM BAŞLAT (Sadece Scraping yapıldıysa gereklidir, API ve Neural zaten tüm veriyi verir)
    if (syncMethod !== 'OFFICIAL_API' && syncMethod !== 'NEURAL_MIRROR') {
      (async () => {
      try {
        await log('Background enrichment started');
        
        const enrichedCatalog = await fetchShopierCatalog(normalizedShopierUrl, {
          debug: false,
          skipDetails: false,
          detailConcurrency: 5,
          detailMaxProducts: 0,
          onProgress: async (currentList, enrichedCount) => {
            // Site'ı güncelle
            try {
              await Site.update(site.id, {
                settings: {
                  products_data: currentList,
                  catalog_enrichment_status: 'in_progress',
                  catalog_enrichment_progress: Math.floor((enrichedCount / currentList.length) * 100)
                }
              });
            } catch (e) {
              void e;
            }
          }
        });

        const enrichedProducts = Array.isArray(enrichedCatalog?.products) ? enrichedCatalog.products : [];
        
        await Site.update(site.id, {
          settings: {
            products_data: enrichedProducts,
            catalog_enrichment_status: 'completed',
            catalog_enrichment_progress: 100,
            catalog_full_sync_complete: true,
            catalog_refreshed_at: nowIso()
          }
        });
        
        await log('Background enrichment completed', { totalEnriched: enrichedProducts.length });
      } catch (enrichErr) {
        await log('Background enrichment failed', { error: safeText(enrichErr?.message || enrichErr) });
        try {
          await Site.update(site.id, {
            settings: {
              catalog_enrichment_status: 'failed'
            }
          });
        } catch (e) {
          void e;
        }
      }
    })().catch(() => void 0);
    }

    return;
  } catch (e) {
    const msg = safeText(e?.message || e) || 'Bilinmeyen hata';
    if (resultSiteId) {
      try {
        await Site.update(resultSiteId, {
          settings: {
            shopier_sync: {
              status: 'failed',
              jobId,
              failed_at: nowIso(),
              message: msg.slice(0, 200)
            }
          }
        });
      } catch (ee) {
        void ee;
      }
    }
    await fail(msg.slice(0, 300));
  }
};

const startSiteCreationJobWorker = ({ intervalMs = 1500 } = {}) => {
  let running = false;

  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const job = await AutoBuildJobStore.claimNextQueuedJob();
      if (job?.jobId) {
        await runOneJob(job);
      }
    } catch (e) {
      void e;
    } finally {
      running = false;
    }
  };

  const timer = setInterval(() => {
    tick().catch(() => void 0);
  }, Math.max(500, Number(intervalMs) || 1500));

  tick().catch(() => void 0);

  return {
    stop: () => {
      try { clearInterval(timer); } catch (e) { void e; }
    }
  };
};

module.exports = {
  newJobId,
  runOneJob,
  startSiteCreationJobWorker
};
