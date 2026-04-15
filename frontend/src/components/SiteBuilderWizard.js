import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Globe, Loader2, Rocket, Settings, Store } from 'lucide-react';
import useAuthSession from '../hooks/useAuthSession';
import { getAuthHeaders } from '../utils/authStorage';
import { getApiBase } from '../utils/apiBase';
import { apiFetch } from '../utils/api';

const API_BASE = getApiBase();

const STEPS = [
  { id: 1, title: 'Bağlantı', icon: Globe },
  { id: 2, title: 'Ayarlar', icon: Settings },
  { id: 3, title: 'Hazır', icon: Rocket }
];

export default function SiteBuilderWizard() {
  const navigate = useNavigate();
  const { token, ready } = useAuthSession();

  const [step, setStep] = useState(1);
  const [shopierUrl, setShopierUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [createdSite, setCreatedSite] = useState(null);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));

  useEffect(() => {
    if (!ready) return;
    if (!token) navigate('/auth');
  }, [navigate, ready, token]);

  const normalizedShopierUrl = useMemo(() => {
    const raw = (shopierUrl || '').toString().trim();
    return raw ? raw.replace(/\/$/, '') : '';
  }, [shopierUrl]);

  const siteUrl = useMemo(() => {
    const direct = (createdSite?.url || '').toString().trim();
    if (direct) return direct;
    const sd = (createdSite?.subdomain || '').toString().trim();
    if (!sd) return '';
    return `https://odelink.shop/s/${encodeURIComponent(sd)}`;
  }, [createdSite]);

  const goNextFromLink = () => {
    setError('');
    if (!normalizedShopierUrl) {
      setError('Shopier mağaza linki gerekli.');
      return;
    }
    setStep(2);
  };

  const createSite = async () => {
    setCreating(true);
    setError('');
    setLoadingMessage('Site oluşturuluyor...');
    
    try {
      if (!normalizedShopierUrl) {
        throw new Error('Shopier mağaza linki gerekli.');
      }

      const deriveStoreNameFromUrl = (rawUrl) => {
        try {
          const u = new URL((rawUrl || '').toString());
          const parts = (u.pathname || '').split('/').map((x) => x.trim()).filter(Boolean);
          const first = parts[0] || '';
          if (!first) return '';
          if (first.toLowerCase() === 'shop') return '';
          return first;
        } catch (e) {
          void e;
          return '';
        }
      };

      const derived = deriveStoreNameFromUrl(normalizedShopierUrl);
      const storeName = siteName || derived || 'Odelink';
      const description = siteDescription || '';

      const payload = {
        name: storeName,
        shopierUrl: normalizedShopierUrl,
        theme: 'wear', // WEAR teması (Framer Pro)
        settings: {
          description: description
        }
      };

      const res = await apiFetch(`${API_BASE}/api/sites`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data?.message || data?.error || '').toString().trim();
        const errorCode = (data?.errorCode || '').toString().trim();
        
        // Kullanıcı dostu hata mesajları
        if (msg) {
          throw new Error(msg);
        } else if (res.status === 400) {
          throw new Error('Geçersiz bilgiler. Lütfen kontrol edin.');
        } else if (res.status === 403) {
          throw new Error('Bu işlem için yetkiniz yok.');
        } else if (res.status === 413) {
          throw new Error('Çok fazla ürün var. Lütfen tekrar deneyin.');
        } else if (res.status === 429) {
          throw new Error('Çok fazla istek. Lütfen biraz bekleyin.');
        } else if (res.status >= 500) {
          throw new Error('Sunucu hatası. Lütfen tekrar deneyin.');
        } else {
          throw new Error('Site oluşturulamadı. Lütfen tekrar deneyin.');
        }
      }

      const data = await res.json();
      const site = data?.site;
      
      if (!site) {
        throw new Error('Site oluşturuldu ama bilgiler alınamadı.');
      }

      setCreatedSite(site);
      setLoadingMessage('Tamamlandı!');
      setStep(3);

    } catch (e) {
      const errorMsg = (e?.message || 'Beklenmedik bir hata oluştu.').toString();
      setError(errorMsg);
      console.error('Site creation error:', e);
    } finally {
      setCreating(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-red-500/30 bg-[#050505] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-red-600/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[520px] h-[520px] bg-red-600/5 blur-[160px]" />
        <div className="absolute -bottom-40 left-1/4 w-[520px] h-[520px] bg-white/5 blur-[200px]" />
      </div>

      <div className="fixed top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Odelink</h1>
              <p className="text-xs text-white/40 font-medium uppercase tracking-widest">Site Oluştur</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/panel')}
            className="hidden sm:inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Panele Dön
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-8 items-start">
          <div className="bg-white/[0.03] rounded-[32px] border border-white/10 p-7 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/10 blur-[120px] -mr-40 -mt-40" />

            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <div className="text-xs text-white/40 font-semibold uppercase tracking-[0.25em]">Adım {step} / {STEPS.length}</div>
                <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">{STEPS.find((s) => s.id === step)?.title || 'Site Oluştur'}</div>
                <div className="mt-2 text-sm text-white/45">Shopier mağazanı bağla, siteni hemen yayınla.</div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                {STEPS.map((s) => {
                  const Icon = s.icon;
                  const active = s.id <= step;
                  const current = s.id === step;
                  return (
                    <div
                      key={s.id}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        current
                          ? 'bg-red-600 text-white shadow-xl shadow-red-600/40 scale-105'
                          : active
                            ? 'bg-red-600/15 text-red-400 border border-red-500/20'
                            : 'bg-black/30 text-white/20 border border-white/10'
                      }`}
                      title={s.title}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  );
                })}
              </div>
            </div>

            {error ? (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                {error}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-7">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50">Shopier Mağaza Linki</label>
                  <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                    <input
                      type="text"
                      placeholder="https://www.shopier.com/magazaniz"
                      value={shopierUrl}
                      onChange={(e) => setShopierUrl(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all"
                    />
                  </div>
                  <div className="text-xs text-white/35 leading-relaxed">
                    Shopier mağaza linkini yapıştır. Tüm ürünlerin otomatik çekilip profesyonel vitrin ile yayınlanacak.
                  </div>
                </div>

                <button
                  onClick={goNextFromLink}
                  disabled={!normalizedShopierUrl}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  Devam
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Site Adı</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Örn: Gloss Giyim"
                    className="w-full bg-black/30 border border-white/10 rounded-2xl py-3.5 px-5 text-white placeholder:text-white/25 focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Kısa Açıklama</label>
                  <textarea
                    rows={3}
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    placeholder="Mağazan hakkında kısa bir açıklama (opsiyonel)"
                    className="w-full bg-black/30 border border-white/10 rounded-2xl py-3.5 px-5 text-white placeholder:text-white/25 focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all resize-none"
                  />
                </div>

                {/* Framer Pro Tema Bilgisi */}
                <div className="space-y-3 pt-2">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-600/10 to-purple-700/10 border-2 border-purple-500/30">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-600/30 flex-shrink-0">
                        <Store className="w-7 h-7 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg text-white mb-1">WEAR - Framer Pro</div>
                        <div className="text-sm text-white/60 leading-relaxed mb-3">
                          Premium Framer teması ile profesyonel animasyonlar, modern tasarım ve yüksek performans
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 text-xs font-semibold">
                            <Rocket className="w-3.5 h-3.5" />
                            Otomatik Aktif
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Geri
                  </button>
                  <button
                    onClick={createSite}
                    disabled={creating}
                    className="flex-[2] py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                    {creating ? (loadingMessage || 'Oluşturuluyor...') : 'Oluştur'}
                  </button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="text-center space-y-7">
              <div className="w-20 h-20 bg-red-600/10 rounded-[28px] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-red-500" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">3. Hazır</h2>
                <p className="text-white/40">
                  Site hazır! {createdSite?.productsLoaded != null ? `${createdSite.productsLoaded} ürün yüklendi.` : 'Ürünler yüklendi.'}
                </p>
              </div>

              <div className="p-7 rounded-[28px] bg-white/[0.02] border border-white/5 space-y-4 max-w-md mx-auto">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/20">Adres</div>
                  <div className="text-lg font-bold text-red-500 truncate">{siteUrl || '-'}</div>
                </div>

                <div className="flex flex-col gap-3">
                  <a
                    href={siteUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                      siteUrl ? '' : 'opacity-50 pointer-events-none'
                    }`}
                  >
                    Siteyi Aç
                    <Globe className="w-5 h-5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => navigate('/panel')}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
                  >
                    Panele Dön
                  </button>
                </div>
              </div>
              </div>
            ) : null}
          </div>

          <aside className="hidden lg:block">
            <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 shadow-2xl">
              <div className="text-xs text-white/40 font-semibold uppercase tracking-[0.25em]">Neler olacak?</div>
              <div className="mt-4 space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <div className="font-bold">Shopier bağlantısı</div>
                    <div className="text-sm text-white/45">Mağaza linki ile tüm ürünler çekilir.</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <div className="font-bold">Site ayarları</div>
                    <div className="text-sm text-white/45">Ad ve açıklama eklenir.</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <div className="font-bold">Profesyonel vitrin</div>
                    <div className="text-sm text-white/45">Shopify kalitesinde profesyonel vitrin aktif olur.</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <div className="font-bold">Anında yayında</div>
                    <div className="text-sm text-white/45">Site linki ile hemen paylaşabilirsin.</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
