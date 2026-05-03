const PLAN_CATALOG_VERSION = 1;

const PLAN_CATALOG = {
  version: PLAN_CATALOG_VERSION,
  currency: 'TRY',
  tiers: {
    standart: {
      tier: 'standart',
      label: 'Standart',
      billingCycles: {
        monthly: {
          billingCycle: 'monthly',
          price: 299,
          priceBeforeDiscount: 599,
          priceLabel: '₺299 / ay'
        }
      },
      capabilities: {
        maxSites: 1,
        allowCustomDomain: false,
        allowedColors: ['blue', 'purple', 'green', 'amber'],
        allowLogoUpload: true,
        allowHideBranding: false,
        allowedBlocks: ['hero', 'collections', 'products', 'highlights', 'benefits', 'faq', 'contact', 'features', 'testimonials', 'newsletter'],
        allowedDesignControls: ['reorder_blocks', 'edit_copy', 'add_blocks'],
        supportLevel: 'standard',
        analyticsLevel: 'basic',
        monthlyReportDownload: false,
        vipSupport: false
      },
      featureGroups: [
        {
          title: 'Hızlı Kurulum',
          items: [
            '3 dk kurulum',
            'Dakikalar içinde yayına alın',
            'Anında yayın',
            'Shopier linki ile hızlı kurulum'
          ]
        },
        {
          title: 'Kurumsal Tasarım',
          items: [
            'Markanıza uygun, sade ve profesyonel vitrin sayfaları',
            'Mobil uyum (her ekranda temiz görünüm)',
            'Ürün sayfaları ve vitrin akışı'
          ]
        },
        {
          title: 'Mağaza Paneli',
          items: [
            'Site ayarları (genel ayarlar)',
            'İletişim bilgileri (adres, telefon, e-posta)',
            'Sosyal medya alanları (Instagram, TikTok, Facebook)',
            'Politikalar bölümü (KVKK, iade, kargo, gizlilik vb.)'
          ]
        },
        {
          title: 'Performans',
          items: [
            'Hızlı açılış',
            'Hafif sayfa yapısı',
            'Önbellek + CDN'
          ]
        },
        {
          title: 'Güvenlik',
          items: [
            'SSL sertifikası',
            'KVKK odaklı sayfalar',
            'Güven veren arayüz'
          ]
        },
        {
          title: 'Destek',
          items: [
            'E-posta destek',
            'Destek formu ile ticket gönderme'
          ]
        },
        {
          title: 'Ölçeklenebilir',
          items: [
            'Büyüyen katalog ve trafik için hazır',
            'Trafiğe dayanıklı yapı'
          ]
        }
      ]
    },

    profesyonel: {
      tier: 'profesyonel',
      label: 'Profesyonel',
      billingCycles: {
        yearly: {
          billingCycle: 'yearly',
          price: 399,
          priceBeforeDiscount: 1199,
          priceLabel: '₺399 / yıl'
        }
      },
      includes: ['standart'],
      capabilities: {
        maxSites: 10,
        allowCustomDomain: true,
        allowedColors: ['blue', 'purple', 'green', 'amber', 'rose', 'teal', 'indigo', 'yellow', 'cyan', 'emerald'],
        allowLogoUpload: true,
        allowHideBranding: true,
        allowedBlocks: ['hero', 'collections', 'products', 'highlights', 'benefits', 'faq', 'contact', 'features', 'testimonials', 'newsletter', 'video', 'gallery', 'advanced_html'],
        allowedDesignControls: ['reorder_blocks', 'edit_copy', 'add_blocks', 'custom_css', 'advanced_animations'],
        supportLevel: 'vip',
        analyticsLevel: 'advanced',
        monthlyReportDownload: true,
        vipSupport: true
      },
      featureGroups: [
        {
          title: 'Standart Paket Dahil',
          items: ['Standart paketin tüm özellikleri dahildir.']
        },
        {
          title: 'Limitler ve Kapasite',
          items: [
            'Daha yüksek site limiti (10 aktif site)',
            'Daha fazla tasarım slotu',
            'Büyümeye hazır (yüksek trafik için daha stabil)'
          ]
        },
        {
          title: 'Analitik ve Raporlama',
          items: [
            'Aylık rapor indirme (JSON)',
            'Raporlama arşivi'
          ]
        },
        {
          title: 'Destek',
          items: [
            'Öncelikli destek',
            'VIP destek sayfasına erişim',
            'Destek taleplerinde öncelik etiketi (VIP)'
          ]
        },
        {
          title: 'Kurumsal + Kararlı Altyapı',
          items: [
            'Kararlı altyapı',
            'Güvenilir çalışma ve performans odaklı yapı'
          ]
        }
      ]
    }
  }
};

function normalizeTier(raw) {
  const t = (raw || '').toString().trim().toLowerCase();
  if (t === 'standart' || t === 'standard') return 'standart';
  if (t === 'profesyonel' || t === 'professional' || t === 'pro' || t === 'premium') return 'profesyonel';
  return '';
}

function normalizeCycle(raw) {
  const c = (raw || '').toString().trim().toLowerCase();
  if (c === 'yearly' || c === 'annual' || c === 'yillik') return 'yearly';
  return 'monthly';
}

function getPlanDefinition({ tier, billingCycle }) {
  const t = normalizeTier(tier);
  const c = normalizeCycle(billingCycle);
  const def = PLAN_CATALOG.tiers[t];
  if (!def) return null;
  const cycleDef = def.billingCycles?.[c] || null;
  return { ...def, billingCycle: c, cycle: cycleDef };
}

function buildCapabilitiesForTier({ tier, billingCycle }) {
  const def = getPlanDefinition({ tier, billingCycle });
  if (!def) return null;
  return {
    tier: def.tier,
    planCode: def.billingCycle,
    planLabel: def.billingCycle === 'yearly' ? 'Yillik Plan' : 'Aylik Plan',
    planName: def.label,
    maxSites: Number(def.capabilities?.maxSites || 0),
    allowCustomDomain: Boolean(def.capabilities?.allowCustomDomain),
    allowedColors: Array.isArray(def.capabilities?.allowedColors) ? def.capabilities.allowedColors : [],
    allowLogoUpload: Boolean(def.capabilities?.allowLogoUpload),
    allowHideBranding: Boolean(def.capabilities?.allowHideBranding),
    allowedBlocks: Array.isArray(def.capabilities?.allowedBlocks) ? def.capabilities.allowedBlocks : [],
    allowedDesignControls: Array.isArray(def.capabilities?.allowedDesignControls) ? def.capabilities.allowedDesignControls : [],
    analyticsLevel: (def.capabilities?.analyticsLevel || '').toString(),
    supportLevel: (def.capabilities?.supportLevel || '').toString(),
    vipSupport: Boolean(def.capabilities?.vipSupport),
    monthlyReportDownload: Boolean(def.capabilities?.monthlyReportDownload),
    billingCycle: def.billingCycle,
    planFeatures: Array.isArray(def.featureGroups) ? def.featureGroups.flatMap((g) => Array.isArray(g?.items) ? g.items : []) : []
  };
}

module.exports = {
  PLAN_CATALOG,
  normalizeTier,
  normalizeCycle,
  getPlanDefinition,
  buildCapabilitiesForTier
};
