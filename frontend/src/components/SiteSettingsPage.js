import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useCapabilities from '../hooks/useCapabilities';
import { clearAuthSession, getAuthHeaders, getAuthToken } from '../utils/authStorage';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5000'
    : '');

const SITE_SETTINGS_CACHE_PREFIX = 'odelink_cache_site_settings_v1:';
const STATIC_THEME_ID = '';
const THEME_LABELS = {};
const DEFAULT_THEME_CUSTOMIZATION = {
  brandLogoText: '',
  heroBadge: '',
  heroLine1: '',
  heroAccent: '',
  heroLine3: '',
  heroDescription: '',
  heroImage1: '',
  heroImage2: '',
  heroImage3: '',
  catalogTitle: '',
  catalogSubtitle: '',
  featuredLabel: '',
  featuredTitle: '',
  featuredDescription: '',
  featuredButtonText: '',
  featuredImage1: '',
  featuredImage2: '',
  featuredImage3: '',
  contactTitle: '',
  contactSubtitle: '',
  ctaBoxTitle: '',
  ctaBoxText: '',
  ctaBoxButtonText: '',
  footerAbout: '',
  productImageHeight: 300,
  productTitleSize: 22,
  productImageFit: 'cover'
};

const THEME_TEXT_FIELDS = [
  { key: 'brandLogoText', label: 'Marka metni', placeholder: 'Üstte görünecek kısa marka adı' },
  { key: 'heroBadge', label: 'Kapak rozeti', placeholder: 'Örn: Yeni sezon • 128 ürün' },
  { key: 'heroLine1', label: 'Kapak satır 1', placeholder: 'Örn: Stilini' },
  { key: 'heroAccent', label: 'Kapak vurgu metni', placeholder: 'Örn: yeniden' },
  { key: 'heroLine3', label: 'Kapak satır 3', placeholder: 'Örn: tek vitrinde kur' },
  { key: 'heroDescription', label: 'Kapak açıklaması', placeholder: 'Kapakta görünecek açıklama', rows: 3 },
  { key: 'catalogTitle', label: 'Ürünler başlığı', placeholder: 'Örn: Tüm Ürünler' },
  { key: 'catalogSubtitle', label: 'Ürünler alt başlığı', placeholder: 'Katalog açıklaması', rows: 2 },
  { key: 'featuredLabel', label: 'Öne çıkan etiket', placeholder: 'Örn: Mağaza özeti' },
  { key: 'featuredTitle', label: 'Öne çıkan başlık', placeholder: 'Örn: Katalog tek vitrinde' },
  { key: 'featuredDescription', label: 'Öne çıkan açıklama', placeholder: 'Bu bölümde görünecek açıklama', rows: 3 },
  { key: 'featuredButtonText', label: 'Öne çıkan buton metni', placeholder: 'Örn: Tüm ürünleri incele' },
  { key: 'contactTitle', label: 'İletişim başlığı', placeholder: 'Örn: İletişim' },
  { key: 'contactSubtitle', label: 'İletişim açıklaması', placeholder: 'İletişim alanı açıklaması', rows: 2 },
  { key: 'ctaBoxTitle', label: 'CTA kutu başlığı', placeholder: 'Örn: Shopier üzerinden satın alın' },
  { key: 'ctaBoxText', label: 'CTA kutu açıklaması', placeholder: 'Buton üstündeki açıklama', rows: 2 },
  { key: 'ctaBoxButtonText', label: 'CTA kutu butonu', placeholder: 'Örn: Mağazayı aç' },
  { key: 'footerAbout', label: 'Footer açıklaması', placeholder: 'Footer sol bölüm metni', rows: 3 }
];

const THEME_IMAGE_FIELDS = [
  { key: 'heroImage1', label: 'Kapak görseli 1' },
  { key: 'heroImage2', label: 'Kapak görseli 2' },
  { key: 'heroImage3', label: 'Kapak görseli 3' },
  { key: 'featuredImage1', label: 'Öne çıkan görsel 1' },
  { key: 'featuredImage2', label: 'Öne çıkan görsel 2' },
  { key: 'featuredImage3', label: 'Öne çıkan görsel 3' }
];

const normalizeThemeId = (raw) => {
  const themeId = (raw || '').toString().trim().toLowerCase();
  if (themeId === STATIC_THEME_ID) return themeId;
  return '';
};

const normalizeThemeCustomization = (raw) => {
  const input = raw && typeof raw === 'object' ? raw : {};
  const numericHeight = Number(input.productImageHeight);
  const numericTitleSize = Number(input.productTitleSize);
  const imageFit = (input.productImageFit || DEFAULT_THEME_CUSTOMIZATION.productImageFit).toString().trim().toLowerCase();

  return {
    ...DEFAULT_THEME_CUSTOMIZATION,
    ...Object.fromEntries(
      Object.keys(DEFAULT_THEME_CUSTOMIZATION)
        .filter((key) => !['productImageHeight', 'productTitleSize', 'productImageFit'].includes(key))
        .map((key) => [key, (input[key] || '').toString()])
    ),
    productImageHeight: Number.isFinite(numericHeight) ? Math.max(180, Math.min(520, Math.round(numericHeight))) : DEFAULT_THEME_CUSTOMIZATION.productImageHeight,
    productTitleSize: Number.isFinite(numericTitleSize) ? Math.max(16, Math.min(40, Math.round(numericTitleSize))) : DEFAULT_THEME_CUSTOMIZATION.productTitleSize,
    productImageFit: ['cover', 'contain'].includes(imageFit) ? imageFit : DEFAULT_THEME_CUSTOMIZATION.productImageFit
  };
};

export default function SiteSettingsPage({ forcedSection }) {
  const navigate = useNavigate();
  const { id, section: sectionParam } = useParams();

  const { capabilities } = useCapabilities();

  const effectiveSection = useMemo(() => {
    const s = (forcedSection ?? sectionParam ?? '').toString().trim().toLowerCase();
    return s;
  }, [forcedSection, sectionParam]);

  const activeTab = useMemo(() => {
    const s = (effectiveSection || '').toString().trim().toLowerCase();
    if (s === 'general') return 'general';
    if (s === 'design') return 'design';
    return 'general';
  }, [effectiveSection]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const [site, setSite] = useState(null);

  const [name, setName] = useState('');
  const [shopierUrl, setShopierUrl] = useState('');
  const [description, setDescription] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(STATIC_THEME_ID);
  const [selectedColor, setSelectedColor] = useState('blue');
  const [hideBranding, setHideBranding] = useState(false);

  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactInstagram, setContactInstagram] = useState('');
  const [contactTikTok, setContactTikTok] = useState('');
  const [contactFacebook, setContactFacebook] = useState('');

  const [logoFile, setLogoFile] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');

  const [layout, setLayout] = useState([]);
  const [layoutError, setLayoutError] = useState('');
  const [themeCustomization, setThemeCustomization] = useState(DEFAULT_THEME_CUSTOMIZATION);

  useEffect(() => {
    if (!id) return;
    if (forcedSection) return;
    const s = (sectionParam || '').toString().trim();
    if (!s) {
      navigate(`/sites/${encodeURIComponent(id)}/settings/general`, { replace: true });
      return;
    }
    if (!['general', 'design'].includes(s.toString().trim().toLowerCase())) {
      navigate(`/sites/${encodeURIComponent(id)}/settings/general`, { replace: true });
    }
  }, [forcedSection, id, navigate, sectionParam]);

  const cacheKey = useMemo(() => {
    const sid = (id || '').toString();
    return `${SITE_SETTINGS_CACHE_PREFIX}${sid}`;
  }, [id]);

  const normalizeShopierUrl = (raw) => {
    try {
      const s = (raw || '').toString().trim();
      if (!s) return '';
      if (/^https?:\/\//i.test(s)) return s;
      return `https://${s.replace(/^\/\/+/, '')}`;
    } catch (e) {
      void e;
      return '';
    }
  };

  const token = getAuthToken();

  const canUploadLogo = useMemo(() => Boolean(capabilities?.allowLogoUpload), [capabilities?.allowLogoUpload]);
  const canHideBranding = useMemo(() => Boolean(capabilities?.allowHideBranding), [capabilities?.allowHideBranding]);

  const currentLogoUrl = useMemo(() => {
    const s = site?.settings;
    if (s && typeof s === 'object') return (s.logoUrl || '').toString();
    if (typeof s === 'string') {
      try {
        const obj = JSON.parse(s);
        return (obj?.logoUrl || '').toString();
      } catch (e) {
        void e;
      }
    }
    return '';
  }, [site?.settings]);

  const currentHideBrandingFromSite = useMemo(() => {
    const s = site?.settings;
    if (s && typeof s === 'object') return Boolean(s.hideBranding);
    if (typeof s === 'string') {
      try {
        const obj = JSON.parse(s);
        return Boolean(obj?.hideBranding);
      } catch (e) {
        void e;
      }
    }
    return false;
  }, [site?.settings]);

  useEffect(() => {
    const rawSettings = site?.settings;
    let settings = {};

    if (rawSettings && typeof rawSettings === 'object') settings = rawSettings;
    if (typeof rawSettings === 'string') {
      try {
        const parsed = JSON.parse(rawSettings);
        if (parsed && typeof parsed === 'object') settings = parsed;
      } catch (e) {
        void e;
      }
    }

    setThemeCustomization(normalizeThemeCustomization(settings?.themeCustomization || settings?.theme_customization));
  }, [site]);

  const allowedColors = useMemo(() => {
    const raw = capabilities?.allowedColors;
    const list = Array.isArray(raw) ? raw : [];
    return list.map((x) => (x || '').toString().trim().toLowerCase()).filter(Boolean);
  }, [capabilities?.allowedColors]);

  const canSelectColor = useMemo(() => allowedColors.length > 0, [allowedColors.length]);

  const currentColorFromSite = useMemo(() => {
    const s = site?.settings;
    if (s && typeof s === 'object') return (s.color || '').toString();
    if (typeof s === 'string') {
      try {
        const obj = JSON.parse(s);
        return (obj?.color || '').toString();
      } catch (e) {
        void e;
      }
    }
    return '';
  }, [site?.settings]);

  const uploadLogo = async () => {
    if (!token || !id) return;
    if (!logoFile) {
      setLogoError('Logo dosyası seçin');
      return;
    }
    if (!canUploadLogo) {
      setLogoError('Logo yükleme özelliği mevcut aboneliğinizde kullanılamıyor.');
      return;
    }

    setLogoUploading(true);
    setLogoError('');
    try {
      const fd = new FormData();
      fd.append('logo', logoFile);

      const res = await fetch(`${API_BASE}/api/sites/${encodeURIComponent(id)}/logo`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: fd
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLogoError((data?.error || 'Logo yüklenemedi').toString());
        setLogoUploading(false);
        return;
      }

      const updatedSite = data?.site || null;
      if (updatedSite) setSite(updatedSite);

      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          at: Date.now(),
          site: updatedSite || site
        }));
      } catch (e) {
        void e;
      }

      setLogoFile(null);
    } catch (e) {
      setLogoError('Logo yüklenemedi');
    } finally {
      setLogoUploading(false);
    }
  };

  const themes = useMemo(() => {
    const ids = new Set();
    const rawAllowedThemes = Array.isArray(capabilities?.allowedThemes) ? capabilities.allowedThemes : [];

    rawAllowedThemes.forEach((rawTheme) => {
      const themeId = normalizeThemeId(rawTheme);
      if (themeId && THEME_LABELS[themeId]) ids.add(themeId);
    });

    const currentThemeId = normalizeThemeId(site?.settings?.theme || site?.theme || selectedTheme);
    if (currentThemeId && THEME_LABELS[currentThemeId]) ids.add(currentThemeId);

    if (!ids.size) ids.add(STATIC_THEME_ID);

    return [];
  }, [capabilities?.allowedThemes, selectedTheme, site?.settings?.theme, site?.theme]);

  const themeIds = useMemo(() => new Set(themes.map((t) => t.id)), [themes]);

  const allowedThemes = useMemo(() => themes.map((t) => t.id), [themes]);

  const updateThemeCustomizationField = (key, value) => {
    setThemeCustomization((prev) => normalizeThemeCustomization({
      ...prev,
      [key]: value
    }));
  };

  const updateThemeCustomizationNumber = (key, value) => {
    const numericValue = Number(value);
    setThemeCustomization((prev) => normalizeThemeCustomization({
      ...prev,
      [key]: Number.isFinite(numericValue) ? numericValue : prev[key]
    }));
  };


  useEffect(() => {
    if (!token) {
      navigate('/auth');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!saveSuccess) return;
    const id = setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
    return () => clearTimeout(id);
  }, [saveSuccess]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!token) return;

      try {
        const raw = localStorage.getItem(cacheKey);
        const cached = raw ? JSON.parse(raw) : null;
        if (cached && typeof cached === 'object' && cached.site) {
          const loadedSite = cached.site;
          setSite(loadedSite);

          setName((loadedSite?.name || '').toString());
          setShopierUrl((loadedSite?.shopier_url || loadedSite?.shopierUrl || '').toString());
          setSelectedTheme((() => {
            const raw = normalizeThemeId(loadedSite?.settings?.theme || loadedSite?.theme || STATIC_THEME_ID);
            if (themeIds.has(raw)) return raw;
            return raw || STATIC_THEME_ID;
          })());

          const rawSettings = loadedSite?.settings;
          let s = {};
          if (rawSettings && typeof rawSettings === 'object') s = rawSettings;
          if (typeof rawSettings === 'string') {
            try {
              const obj = JSON.parse(rawSettings);
              if (obj && typeof obj === 'object') s = obj;
            } catch (e) {
              void e;
            }
          }

          setDescription((s?.description || '').toString());
          setHeroImageUrl((s?.heroImageUrl || s?.heroImageURL || s?.hero_image_url || '').toString());
          setAboutText((s?.aboutText || s?.ai_config?.footer?.aboutText || '').toString());
          setContactPhone((s?.contact?.phone || s?.contactPhone || '').toString());
          setContactEmail((s?.contact?.email || s?.contactEmail || '').toString());
          setContactAddress((s?.contact?.address || s?.contactAddress || '').toString());
          setContactInstagram((s?.contact?.instagram || '').toString());
          setContactTikTok((s?.contact?.tiktok || s?.contact?.tikTok || '').toString());
          setContactFacebook((s?.contact?.facebook || '').toString());
          setSelectedColor((s?.color || 'blue').toString());
          setHideBranding(Boolean(s?.hideBranding));
          setLayout(Array.isArray(s?.layout) ? s.layout : []);
        }

        try {
          const siteRes = await fetch(`${API_BASE}/api/sites/${encodeURIComponent(id)}`, {
            headers: getAuthHeaders()
          });
          const siteData = await siteRes.json().catch(() => ({}));

          if (!siteRes.ok) {
            if (siteRes.status === 401) {
              try {
                clearAuthSession();
              } catch (e) {
                void e;
              }
              navigate('/auth');
              return;
            }
            setError(siteData?.error || 'Site bilgileri alınamadı');
            return;
          }

          if (cancelled) return;

          const loadedSite = siteData?.site || null;
          setSite(loadedSite);

          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              at: Date.now(),
              site: loadedSite,
            }));
          } catch (e) {
            void e;
          }

          setName((loadedSite?.name || '').toString());
          setShopierUrl((loadedSite?.shopier_url || loadedSite?.shopierUrl || '').toString());
          setSelectedTheme((() => {
            const raw = normalizeThemeId(loadedSite?.settings?.theme || loadedSite?.theme || STATIC_THEME_ID);
            if (themeIds.has(raw)) return raw;
            return raw || STATIC_THEME_ID;
          })());

          const rawSettings = loadedSite?.settings;
          let s = {};
          if (rawSettings && typeof rawSettings === 'object') s = rawSettings;
          if (typeof rawSettings === 'string') {
            try {
              const obj = JSON.parse(rawSettings);
              if (obj && typeof obj === 'object') s = obj;
            } catch (e) {
              void e;
            }
          }
          setDescription((s?.description || '').toString());
          setHeroImageUrl((s?.heroImageUrl || s?.heroImageURL || s?.hero_image_url || '').toString());
          setAboutText((s?.aboutText || s?.ai_config?.footer?.aboutText || '').toString());
          setContactPhone((s?.contact?.phone || s?.contactPhone || '').toString());
          setContactEmail((s?.contact?.email || s?.contactEmail || '').toString());
          setContactAddress((s?.contact?.address || s?.contactAddress || '').toString());
          setContactInstagram((s?.contact?.instagram || '').toString());
          setContactTikTok((s?.contact?.tiktok || s?.contact?.tikTok || '').toString());
          setContactFacebook((s?.contact?.facebook || '').toString());
          setSelectedColor((s?.color || 'blue').toString());
          setHideBranding(Boolean(s?.hideBranding));
          setLayout(Array.isArray(s?.layout) ? s.layout : []);
        } catch (e) {
          setError('Backend veya veritabanına bağlanılamadı.');
        } finally {
          if (!cancelled) setLoading(false);
        }
      } catch (e) {
        void e;
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, token, cacheKey, themeIds]);


  useEffect(() => {
    if (allowedThemes.length > 0 && selectedTheme && !allowedThemes.includes(selectedTheme)) {
      setSelectedTheme(allowedThemes[0]);
    }
  }, [allowedThemes, selectedTheme]);

  const save = async () => {
    if (!token || !id) return;
    setSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const nextTheme = allowedThemes.includes(selectedTheme) ? selectedTheme : (allowedThemes[0] || STATIC_THEME_ID);
      const existingSettings = (site?.settings && typeof site.settings === 'object') ? site.settings : {};
      const nextColor = (() => {
        const c = (selectedColor || '').toString().trim().toLowerCase();
        if (!c) return existingSettings.color || 'blue';
        if (allowedColors.length && !allowedColors.includes(c)) return existingSettings.color || 'blue';
        return c;
      })();
      const nextHideBranding = Boolean(canHideBranding ? hideBranding : existingSettings.hideBranding);

      const payload = {
        name: name.toString().trim(),
        shopierUrl: normalizeShopierUrl(shopierUrl),
        theme: nextTheme,
        settings: {
          ...existingSettings,
          description: description.toString().trim(),
          heroImageUrl: heroImageUrl.toString().trim(),
          aboutText: aboutText.toString().trim(),
          contact: {
            phone: contactPhone.toString().trim(),
            email: contactEmail.toString().trim(),
            address: contactAddress.toString().trim(),
            instagram: contactInstagram.toString().trim(),
            tiktok: contactTikTok.toString().trim(),
            facebook: contactFacebook.toString().trim(),
          },
          theme: nextTheme,
          color: nextColor,
          hideBranding: nextHideBranding,
          layout: Array.isArray(layout) ? layout : [],
          themeCustomization: normalizeThemeCustomization(themeCustomization),
        }
      };

      if (!payload.name) {
        setError('Site adı gerekli');
        setSaving(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/sites/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (data?.details || data?.error || 'Site güncellenemedi').toString();
        setError(msg);
        setSaving(false);
        return;
      }

      const updated = data?.site || null;
      setSite(updated);
      setSaveSuccess(true);
    } catch (e) {
      setError('Site güncellenemedi');
    } finally {
      setSaving(false);
    }
  };



  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 pt-16 sm:pt-24 pb-16 sm:pb-20 px-4">
        <div className="container mx-auto" style={{ maxWidth: 980 }}>
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur p-4 sm:p-6">
            <div className="text-2xl font-bold text-white">Site Ayarları</div>
            <div className="text-gray-200 mt-2">{error}</div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button type="button" className="btn-secondary" onClick={() => navigate('/panel')}>
                Panele Dön
              </button>
              <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
                Tekrar Dene
              </button>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-white">Mağaza Yapısı</div>
                <div className="text-xs text-gray-300">Tasarım</div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-1 gap-2">
                <button
                  type="button"
                  className="btn-secondary w-full"
                  onClick={() => navigate(`/sites/${encodeURIComponent(id || '')}/builder`)}
                  disabled={!id}
                >
                  Tasarım
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
      <div className="sticky top-0 inset-x-0 z-50 bg-black/35 backdrop-blur border-b border-white/10 shadow-2xl">
        <div className="container mx-auto px-4 py-4" style={{ maxWidth: 980 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs text-gray-300/90">Mağaza Paneli</div>
              <div className="text-2xl font-bold text-white truncate">Site Ayarları</div>
              <div className="text-sm text-gray-300 mt-1 truncate">{site?.subdomain || '-'}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => navigate('/panel')}>
                Panele Dön
              </button>
              <button type="button" className="btn-primary w-full sm:w-auto" onClick={save} disabled={saving}>
                {saving ? 'Kaydediliyorâ€¦' : (saveSuccess ? 'Kaydedildi' : 'Kaydet')}
              </button>
            </div>
          </div>

          <div className="mt-4 -mb-1 flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'general', label: 'Genel' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  if (!id) return;
                  navigate(`/sites/${encodeURIComponent(id)}/settings/${t.id}`);
                }}
                className={`shrink-0 inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === t.id
                    ? 'bg-white text-gray-900 border-white'
                    : 'bg-white/5 text-gray-100 border-white/10 hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6 sm:pt-8 pb-16 sm:pb-20" style={{ maxWidth: 980 }}>
        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur p-4 sm:p-6 md:p-7">
          {loading ? (
            <div className="space-y-4">
              <div className="h-6 w-44 rounded bg-white/10" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-56 rounded-2xl bg-white/5 border border-white/10" />
                <div className="h-56 rounded-2xl bg-white/5 border border-white/10" />
              </div>
            </div>
          ) : null}

          {!loading ? (
            <div className="mb-5 rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/0 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-gray-200 font-semibold truncate">{(site?.name || name || 'Site').toString()}</div>
                  <div className="text-xs text-gray-300 mt-1 truncate">
                    {site?.subdomain ? `https://odelink.shop/s/${encodeURIComponent(site.subdomain)}` : '-'}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {!loading ? (
            null
          ) : null}

          {activeTab === 'general' ? (
            <div className="mt-2 bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-white">Genel</div>
                <div className="text-xs text-gray-300">Zorunlu alanlar: Site adı</div>
              </div>

              <label className="block text-sm text-gray-200 mt-4">Site adı</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="örn: Odelink Mağazası"
                className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
              />
              <div className="text-xs text-gray-300 mt-2">Panelde ve sitende görünen isim.</div>

              <label className="block text-sm text-gray-200 mt-4">Shopier mağaza URL</label>
              <input
                value={shopierUrl}
                onChange={(e) => setShopierUrl(e.target.value)}
                placeholder="örn: https://shopier.com/odelink"
                className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
              />
              <div className="text-xs text-gray-300 mt-2">Ürünleri buradan çekiyoruz. Protokol yazmazsan otomatik eklenir.</div>

              <label className="block text-sm text-gray-200 mt-4">Açıklama</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Kısa bir açıklama yaz (SEO + ziyaretçi için)"
                className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-3 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
              />
              <div className="text-xs text-gray-300 mt-2">Örn: “Özel tasarım ürünler • Hızlı kargo • Güvenli ödeme”</div>
            </div>
          ) : null}

          {activeTab === 'general' && (
            <div className="mt-4 bg-white/5 rounded-2xl p-5 border border-white/10">
              <label className="block text-sm text-gray-200">Hakkımızda</label>
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText((e.target.value || '').toString())}
                placeholder="Mağazanız hakkında kısa metin (footer'da gösterilir)"
                className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-3 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
              />
              <div className="text-xs text-gray-300 mt-2">İsterseniz bu metni buradan değiştirebilirsiniz.</div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="mt-4 bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-white">İletişim</div>
                <div className="text-xs text-gray-300">Opsiyonel</div>
              </div>

              <label className="block text-sm text-gray-200 mt-4">Telefon</label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="örn: +90 555 000 00 00"
                className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
              />

              <label className="block text-sm text-gray-200 mt-4">E-posta</label>
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="örn: destek@magaza.com"
                className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
              />

              <label className="block text-sm text-gray-200 mt-4">Adres</label>
              <textarea
                value={contactAddress}
                onChange={(e) => setContactAddress((e.target.value || '').toString())}
                rows={3}
                placeholder="örn: İstanbul / Türkiye"
                className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-3 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
              />

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="block">
                  <span className="block text-sm text-gray-200">Instagram linki</span>
                  <input
                    value={contactInstagram}
                    onChange={(e) => setContactInstagram(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm text-gray-200">TikTok linki</span>
                  <input
                    value={contactTikTok}
                    onChange={(e) => setContactTikTok(e.target.value)}
                    placeholder="https://tiktok.com/@..."
                    className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm text-gray-200">Facebook linki</span>
                  <input
                    value={contactFacebook}
                    onChange={(e) => setContactFacebook(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                  />
                </label>
              </div>

              <div className="text-xs text-gray-300 mt-2">Kaydet butonuna basınca footer ve İletişim sayfasında otomatik gösterilir.</div>
            </div>
          )}

          {activeTab === 'design' ? (
            <div className="mt-2 bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">Tasarım (Bloklar)</div>
                  <div className="text-xs text-gray-300 mt-1">Blok ekle / sırala / kaldır</div>
                </div>
                <button
                  type="button"
                  className="btn-secondary whitespace-nowrap"
                  disabled={!site?.subdomain}
                  onClick={() => {
                    const sd = (site?.subdomain || '').toString().trim();
                    if (!sd) return;
                    const href = `https://odelink.shop/s/${encodeURIComponent(sd)}`;
                    try {
                      window.open(href, '_blank', 'noopener,noreferrer');
                    } catch (e) {
                      void e;
                      window.location.href = href;
                    }
                  }}
                >
                  Önizleme
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-sm text-gray-200 font-semibold">Tema icerigi</div>
                <div className="mt-1 text-xs text-gray-400">Kapak metinleri, butonlar, fotograflar ve urun karti boyutlari buradan yonetilir.</div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {THEME_TEXT_FIELDS.map((field) => (
                    <label key={field.key} className={`block ${field.rows ? 'lg:col-span-2' : ''}`}>
                      <span className="block text-xs text-gray-300">{field.label}</span>
                      {field.rows ? (
                        <textarea
                          value={(themeCustomization?.[field.key] || '').toString()}
                          onChange={(e) => updateThemeCustomizationField(field.key, e.target.value)}
                          rows={field.rows}
                          placeholder={field.placeholder}
                          className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-3 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                        />
                      ) : (
                        <input
                          value={(themeCustomization?.[field.key] || '').toString()}
                          onChange={(e) => updateThemeCustomizationField(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                        />
                      )}
                    </label>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="text-sm text-gray-200 font-semibold">Tema gorselleri</div>
                  <div className="mt-1 text-xs text-gray-400">Bos birakirsan tema katalogdaki urun gorsellerini kullanir.</div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {THEME_IMAGE_FIELDS.map((field) => (
                      <label key={field.key} className="block">
                        <span className="block text-xs text-gray-300">{field.label}</span>
                        <input
                          value={(themeCustomization?.[field.key] || '').toString()}
                          onChange={(e) => updateThemeCustomizationField(field.key, e.target.value)}
                          placeholder="https://.../gorsel.jpg"
                          className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm text-gray-200 font-semibold">Urun karti boyutlari</div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <label className="block">
                      <span className="block text-xs text-gray-300">Gorsel yuksekligi</span>
                      <input
                        type="number"
                        min="180"
                        max="520"
                        value={Number(themeCustomization?.productImageHeight || 300)}
                        onChange={(e) => updateThemeCustomizationNumber('productImageHeight', e.target.value)}
                        className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs text-gray-300">Baslik boyutu</span>
                      <input
                        type="number"
                        min="16"
                        max="40"
                        value={Number(themeCustomization?.productTitleSize || 22)}
                        onChange={(e) => updateThemeCustomizationNumber('productTitleSize', e.target.value)}
                        className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs text-gray-300">Gorsel sigdirma</span>
                      <select
                        value={(themeCustomization?.productImageFit || 'cover').toString()}
                        onChange={(e) => updateThemeCustomizationField('productImageFit', e.target.value)}
                        className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10 [color-scheme:dark]"
                      >
                        <option value="cover">Kapla</option>
                        <option value="contain">Sigdir</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              {layoutError ? (
                <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {layoutError}
                </div>
              ) : null}

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-sm text-gray-200 font-semibold">Blok Ekle</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { type: 'hero', label: 'Kapak' },
                    { type: 'products', label: 'Ürünler' },
                    { type: 'highlights', label: 'Highlights' },
                    { type: 'faq', label: 'FAQ' },
                    { type: 'contact', label: 'İletişim' }
                  ].map((b) => (
                    <button
                      key={b.type}
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setLayoutError('');
                        const idPart = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
                        const base = { id: `${b.type}-${idPart}`, type: b.type, props: {} };
                        const withDefaults = (() => {
                          if (b.type === 'highlights') {
                            return {
                              ...base,
                              props: {
                                title: 'Öne Çıkanlar',
                                items: [
                                  { title: 'Hızlı kargo', description: '1-3 iş günü içinde kargoya teslim.' },
                                  { title: 'Güvenli ödeme', description: 'Ödeme Shopier üzerinden tamamlanır.' },
                                  { title: 'Kaliteli ürünler', description: 'Seçilmiş ürünler, net vitrin.' }
                                ]
                              }
                            };
                          }
                          if (b.type === 'faq') {
                            return {
                              ...base,
                              props: {
                                title: 'SSS',
                                items: [
                                  { q: 'Kargo ne zaman çıkar?', a: 'Siparişler 1-3 iş günü içinde kargoya verilir.' },
                                  { q: 'İade var mı?', a: '14 gün içinde iade hakkınız vardır.' },
                                  { q: 'Ödeme nasıl?', a: 'Ödeme adımı Shopier üzerinden güvenle tamamlanır.' }
                                ]
                              }
                            };
                          }
                          if (b.type === 'contact') {
                            return {
                              ...base,
                              props: {
                                title: 'İletişim',
                                subtitle: 'Sorularınız için bize yazın.',
                                whatsapp: '',
                                instagram: '',
                                email: ''
                              }
                            };
                          }
                          if (b.type === 'hero') {
                            return {
                              ...base,
                              props: {
                                title: (name || site?.name || 'Mağaza').toString(),
                                subtitle: (description || 'Premium vitrin deneyimi').toString(),
                                primaryButtonText: 'Ürünleri İncele',
                                secondaryButtonText: 'Hakkında'
                              }
                            };
                          }
                          if (b.type === 'products') {
                            return {
                              ...base,
                              props: {
                                title: 'Öne Çıkan Ürünler',
                                buttonText: "Shopier'de Satın Al"
                              }
                            };
                          }
                          return base;
                        })();
                        setLayout((prev) => prev.concat([withDefaults]));
                      }}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-400">Not: Kaydet'e basınca backend paketine göre blokları doğrular.</div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-sm text-gray-200 font-semibold">Bloklar</div>
                {Array.isArray(layout) && layout.length ? (
                  <div className="mt-3 grid gap-3">
                    {layout.map((b, idx) => (
                      <div key={b.id || `${b.type}-${idx}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white">{(b?.type || 'block').toString()}</div>
                            <div className="text-xs text-gray-400 truncate">{b?.id || ''}</div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="btn-secondary"
                              disabled={idx === 0}
                              onClick={() => {
                                setLayoutError('');
                                setLayout((prev) => {
                                  const next = prev.slice();
                                  const t = next[idx - 1];
                                  next[idx - 1] = next[idx];
                                  next[idx] = t;
                                  return next;
                                });
                              }}
                            >
                              Yukarı
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              disabled={idx === layout.length - 1}
                              onClick={() => {
                                setLayoutError('');
                                setLayout((prev) => {
                                  const next = prev.slice();
                                  const t = next[idx + 1];
                                  next[idx + 1] = next[idx];
                                  next[idx] = t;
                                  return next;
                                });
                              }}
                            >
                              Aşağı
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => {
                                setLayoutError('');
                                setLayout((prev) => prev.filter((_, i) => i !== idx));
                              }}
                            >
                              Sil
                            </button>
                          </div>
                        </div>

                        {b?.type === 'highlights' ? (
                          <div className="mt-3 grid gap-2">
                            <label className="block text-xs text-gray-300">Başlık</label>
                            <input
                              value={(b?.props?.title || '').toString()}
                              onChange={(e) => {
                                const v = (e.target.value || '').toString();
                                setLayout((prev) => prev.map((x, i) => (i === idx ? { ...x, props: { ...(x.props || {}), title: v } } : x)));
                              }}
                              className="w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                            />
                            <label className="block text-xs text-gray-300 mt-2">Items (3 satır: başlık|açıklama)</label>
                            <textarea
                              value={(() => {
                                const items = Array.isArray(b?.props?.items) ? b.props.items : [];
                                return items.slice(0, 3).map((it) => `${(it?.title || '').toString()}|${(it?.description || '').toString()}`).join('\n');
                              })()}
                              onChange={(e) => {
                                const raw = (e.target.value || '').toString();
                                const nextItems = raw
                                  .split('\n')
                                  .map((line) => line.trim())
                                  .filter(Boolean)
                                  .slice(0, 3)
                                  .map((line) => {
                                    const [title, description] = line.split('|');
                                    return { title: (title || '').trim(), description: (description || '').trim() };
                                  });
                                setLayout((prev) => prev.map((x, i) => (i === idx ? { ...x, props: { ...(x.props || {}), items: nextItems } } : x)));
                              }}
                              rows={4}
                              className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                            />
                          </div>
                        ) : null}

                        {b?.type === 'faq' ? (
                          <div className="mt-3 grid gap-2">
                            <label className="block text-xs text-gray-300">Başlık</label>
                            <input
                              value={(b?.props?.title || '').toString()}
                              onChange={(e) => {
                                const v = (e.target.value || '').toString();
                                setLayout((prev) => prev.map((x, i) => (i === idx ? { ...x, props: { ...(x.props || {}), title: v } } : x)));
                              }}
                              className="w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                            />
                            <label className="block text-xs text-gray-300 mt-2">Sorular (3 satır: soru|cevap)</label>
                            <textarea
                              value={(() => {
                                const items = Array.isArray(b?.props?.items) ? b.props.items : [];
                                return items.slice(0, 6).map((it) => `${(it?.q || '').toString()}|${(it?.a || '').toString()}`).join('\n');
                              })()}
                              onChange={(e) => {
                                const raw = (e.target.value || '').toString();
                                const nextItems = raw
                                  .split('\n')
                                  .map((line) => line.trim())
                                  .filter(Boolean)
                                  .slice(0, 6)
                                  .map((line) => {
                                    const [q, a] = line.split('|');
                                    return { q: (q || '').trim(), a: (a || '').trim() };
                                  });
                                setLayout((prev) => prev.map((x, i) => (i === idx ? { ...x, props: { ...(x.props || {}), items: nextItems } } : x)));
                              }}
                              rows={5}
                              className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                            />
                          </div>
                        ) : null}

                        {b?.type === 'contact' ? (
                          <div className="mt-3 grid gap-2">
                            <label className="block text-xs text-gray-300">Başlık</label>
                            <input
                              value={(b?.props?.title || '').toString()}
                              onChange={(e) => {
                                const v = (e.target.value || '').toString();
                                setLayout((prev) => prev.map((x, i) => (i === idx ? { ...x, props: { ...(x.props || {}), title: v } } : x)));
                              }}
                              className="w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                            />
                            <label className="block text-xs text-gray-300">Alt metin</label>
                            <input
                              value={(b?.props?.subtitle || '').toString()}
                              onChange={(e) => {
                                const v = (e.target.value || '').toString();
                                setLayout((prev) => prev.map((x, i) => (i === idx ? { ...x, props: { ...(x.props || {}), subtitle: v } } : x)));
                              }}
                              className="w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                              <div>
                                <label className="block text-xs text-gray-300">WhatsApp</label>
                                <input
                                  value={(b?.props?.whatsapp || '').toString()}
                                  onChange={(e) => {
                                    const v = (e.target.value || '').toString();
                                    setLayout((prev) => prev.map((x, i) => (i === idx ? { ...x, props: { ...(x.props || {}), whatsapp: v } } : x)));
                                  }}
                                  className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-300">Instagram URL</label>
                                <input
                                  value={(b?.props?.instagram || '').toString()}
                                  onChange={(e) => {
                                    const v = (e.target.value || '').toString();
                                    setLayout((prev) => prev.map((x, i) => (i === idx ? { ...x, props: { ...(x.props || {}), instagram: v } } : x)));
                                  }}
                                  className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-300">E-posta</label>
                                <input
                                  value={(b?.props?.email || '').toString()}
                                  onChange={(e) => {
                                    const v = (e.target.value || '').toString();
                                    setLayout((prev) => prev.map((x, i) => (i === idx ? { ...x, props: { ...(x.props || {}), email: v } } : x)));
                                  }}
                                  className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                              <div className="md:col-span-3">
                                <label className="block text-xs text-gray-300">Adres</label>
                                <input
                                  value={(b?.props?.address || '').toString()}
                                  onChange={(e) => {
                                    const v = (e.target.value || '').toString();
                                    setLayout((prev) => prev.map((x, i) => (i === idx ? { ...x, props: { ...(x.props || {}), address: v } } : x)));
                                  }}
                                  className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                                />
                                <button
                                  type="button"
                                  className="btn-secondary mt-2"
                                  onClick={() => {
                                    const addr = (b?.props?.address || '').toString().trim();
                                    if (!addr) return;
                                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
                                    window.open(url, '_blank', 'noopener,noreferrer');
                                  }}
                                >
                                  Google Maps'te Aç
                                </button>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-300">Enlem (lat)</label>
                                <input
                                  value={(b?.props?.lat ?? '').toString()}
                                  onChange={(e) => {
                                    const v = (e.target.value || '').toString();
                                    setLayout((prev) => prev.map((x, i) => (i === idx ? { ...x, props: { ...(x.props || {}), lat: v } } : x)));
                                  }}
                                  className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-300">Boylam (lng)</label>
                                <input
                                  value={(b?.props?.lng ?? '').toString()}
                                  onChange={(e) => {
                                    const v = (e.target.value || '').toString();
                                    setLayout((prev) => prev.map((x, i) => (i === idx ? { ...x, props: { ...(x.props || {}), lng: v } } : x)));
                                  }}
                                  className="mt-2 w-full h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-300">Harita Önizleme</label>
                                <div className="mt-2 rounded-xl border border-white/10 overflow-hidden bg-black/20" style={{ height: 140 }}>
                                  <iframe
                                    title="map-preview"
                                    width="100%"
                                    height="140"
                                    frameBorder="0"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={(() => {
                                      const lat = Number(b?.props?.lat);
                                      const lng = Number(b?.props?.lng);
                                      if (Number.isFinite(lat) && Number.isFinite(lng)) {
                                        const bbox = `${lng - 0.03},${lat - 0.02},${lng + 0.03},${lat + 0.02}`;
                                        return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`;
                                      }
                                      const q = (b?.props?.address || 'Türkiye').toString().trim() || 'Türkiye';
                                      return `https://www.openstreetmap.org/export/embed.html?search=${encodeURIComponent(q)}`;
                                    })()}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-gray-400">Henüz blok eklenmedi. "Blok Ekle" kısmından ekleyebilirsin.</div>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-400">Blokları kaydetmek için üstteki Kaydet butonuna bas.</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


