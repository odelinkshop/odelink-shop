import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiBase } from '../utils/apiBase';
import { clearAuthSession, getAuthHeaders, getAuthToken } from '../utils/authStorage';

const API_BASE = getApiBase();
const FALLBACK_LOCAL_API_BASE = 'http://localhost:5001';
const DASH_CACHE_KEY = 'odelink_cache_dashboard_v1';
const PUBLIC_SITE_CACHE_PREFIX = 'odelink_cache_public_site_v1:';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const UserPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [me, setMe] = useState(null);
  const [sites, setSites] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [stats, setStats] = useState(null);
  const [capabilities, setCapabilities] = useState(null);
  const [reportError, setReportError] = useState('');
  const [nowTs, setNowTs] = useState(() => Date.now());

  const didWarmPrefetchRef = useRef(false);

  useEffect(() => {
    try {
      const cachedRaw = localStorage.getItem(DASH_CACHE_KEY);
      const cached = cachedRaw ? JSON.parse(cachedRaw) : null;
      if (cached && typeof cached === 'object') {
        setMe(cached.user || null);
        setSites(Array.isArray(cached.sites) ? cached.sites : []);
        setSubscription(cached.subscription || null);
        setStats(cached.stats || null);
        setLoading(false);
      }
    } catch (e) {
      void e;
    }

    const token = getAuthToken();
    if (!token) {
      navigate('/auth', { state: { from: location.pathname } });
      return;
    }

    let cancelled = false;

    const fetchWithTimeout = async (url, options, timeoutMs) => {
      const controller = new AbortController();
      const t = setTimeout(() => {
        try {
          controller.abort();
        } catch (e) {
          void e;
        }
      }, timeoutMs);

      try {
        const res = await fetch(url, {
          ...(options || {}),
          signal: controller.signal
        });
        return res;
      } finally {
        clearTimeout(t);
      }
    };

    const isDefaultLocalBase = API_BASE === 'http://localhost:5000' || API_BASE === 'http://127.0.0.1:5000';

    const loadFromBase = async (base) => {
      setLoading((prev) => {
        try {
          const hasCached = Boolean(localStorage.getItem(DASH_CACHE_KEY));
          return hasCached ? prev : true;
        } catch (e) {
          void e;
          return true;
        }
      });
      setError('');

      const hardStop = setTimeout(() => {
        if (!cancelled) {
          setError(`Panel yanıt vermiyor. Backend çalışmıyor olabilir (${base}).`);
          setLoading(false);
        }
      }, 20 * 1000);
      let lastError = '';
      try {
        const timeoutMs = 15 * 1000;
        const shouldRetryResponse = (res) => {
          try {
            const s = Number(res?.status || 0);
            return s === 429 || s === 502 || s === 503 || s === 504;
          } catch (e) {
            void e;
            return false;
          }
        };

        const shouldRetryError = (e) => {
          const name = (e?.name || '').toString();
          const msg = (e?.message || '').toString().toLowerCase();
          if (name === 'AbortError') return true;
          if (msg.includes('network') || msg.includes('failed to fetch') || msg.includes('fetch')) return true;
          if (msg.includes('timeout') || msg.includes('zaman')) return true;
          return false;
        };

        const maxAttempts = 4;
        let attempt = 0;
        let res = null;
        let data = {};

        while (attempt < maxAttempts && !cancelled) {
          attempt += 1;
          try {
            res = await fetchWithTimeout(`${base}/api/users/dashboard`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }, timeoutMs);

            data = res ? await res.json().catch(() => ({})) : {};

            if (res && res.status === 401) {
              try {
                clearAuthSession();
              } catch (e) {
                void e;
              }
              navigate('/auth', { state: { from: location.pathname } });
              return { ok: false, error: 'Unauthorized' };
            }

            if (!res || !res.ok) {
              lastError = (data?.error || 'Panel verileri alınamadı').toString();
              if (attempt < maxAttempts && shouldRetryResponse(res)) {
                await sleep(500 * attempt);
                continue;
              }
              if (!cancelled) setError(lastError);
              return { ok: false, error: lastError };
            }

            break;
          } catch (e) {
            lastError = (e?.name === 'AbortError')
              ? 'İstek zaman aşımına uğradı. Backend yanıt vermiyor.'
              : 'Backend veya veritabanına bağlanılamadı.';
            if (attempt < maxAttempts && shouldRetryError(e)) {
              await sleep(500 * attempt);
              continue;
            }
            if (!cancelled) setError(lastError);
            return { ok: false, error: lastError };
          }
        }

        if (cancelled) return;
        setMe(data.user || null);
        setSites(Array.isArray(data.sites) ? data.sites : []);
        setSubscription(data.subscription || null);
        setStats(data.stats || null);

        try {
          localStorage.setItem(DASH_CACHE_KEY, JSON.stringify({
            at: Date.now(),
            user: data.user || null,
            sites: Array.isArray(data.sites) ? data.sites : [],
            subscription: data.subscription || null,
            stats: data.stats || null
          }));
        } catch (e) {
          void e;
        }

        fetchWithTimeout(`${base}/api/subscriptions/capabilities`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }, timeoutMs)
          .then(async (capsRes) => {
            if (cancelled) return;
            if (!capsRes || !capsRes.ok) return;
            const capsData = await capsRes.json().catch(() => ({}));
            if (cancelled) return;
            setCapabilities(capsData?.capabilities || null);
          })
          .catch(() => {
            // ignore
          });

        return { ok: true };
      } finally {
        clearTimeout(hardStop);
        if (!cancelled) setLoading(false);
      }
    };

    const load = async () => {
      const r1 = await loadFromBase(API_BASE);
      if (cancelled) return;
      if (r1 && r1.ok) return;

      if (r1 && r1.error === 'Unauthorized') return;

      if (isDefaultLocalBase) {
        const e1 = (r1?.error || '').toString();
        const looksLikeNetwork = e1.toLowerCase().includes('backend') || e1.toLowerCase().includes('bağlan') || e1.toLowerCase().includes('zaman aşımı');
        if (!looksLikeNetwork) return;

        const r2 = await loadFromBase(FALLBACK_LOCAL_API_BASE);
        if (cancelled) return;
        if (r2 && r2.ok) return;

        if (!cancelled) {
          const e2 = (r2?.error || '').toString();
          if (e1) {
            setError(e1);
            return;
          }
          if (e2) {
            setError(e2);
            return;
          }
          setError('Panel açılamadı. Backend 5000 ve 5001 üzerinde yanıt vermiyor.');
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate, location.pathname]);

  const myStats = useMemo(() => {
    const totalSites = Number(stats?.total_sites || 0);
    const activeSites = Number(stats?.active_sites || 0);
    return { totalSites, activeSites };
  }, [stats]);

  const normalizeTier = useCallback((tierRaw) => {
    const t = (tierRaw || '').toString().trim().toLowerCase();
    if (t === 'standart' || t === 'standard') return 'standart';
    if (t === 'profesyonel' || t === 'professional' || t === 'pro' || t === 'premium') return 'profesyonel';
    return '';
  }, []);

  const tierLabel = useCallback((tierRaw) => {
    const t = normalizeTier(tierRaw);
    if (!t) return '';
    if (t === 'standart') return 'Standart';
    if (t === 'profesyonel') return 'Profesyonel';
    return '';
  }, [normalizeTier]);

  const subscriptionView = useMemo(() => {
    const tier = normalizeTier(capabilities?.tier);
    const maxSites = Number(capabilities?.maxSites || 0);
    const hasActive = Boolean(tier) && maxSites > 0;
    if (capabilities) {
      return {
        hasActive,
        label: hasActive ? (tierLabel(tier) || '-') : 'Yok',
        subtitle: hasActive ? 'Ödeme Shopier üzerinden' : 'Plan yok'
      };
    }

    const dashName = (subscription?.subscription_name || '').toString().trim();
    const hasDash = Boolean(dashName);
    return {
      hasActive: hasDash,
      label: hasDash ? dashName : '-',
      subtitle: hasDash ? 'Ödeme Shopier üzerinden' : 'Plan yok'
    };
  }, [capabilities, subscription, normalizeTier, tierLabel]);

  const trialView = useMemo(() => {
    const isTrial = (capabilities?.planCode || '').toString().toLowerCase() === 'trial' || Boolean(capabilities?.trial?.active);
    if (!isTrial) return null;

    const endsAtRaw = (capabilities?.trial?.endsAt || capabilities?.trial?.trialEndsAt || '').toString();
    const endsAt = endsAtRaw ? new Date(endsAtRaw) : null;
    const endsAtMs = endsAt && !Number.isNaN(endsAt.getTime()) ? endsAt.getTime() : null;

    let msLeft = Number(capabilities?.trial?.msLeft ?? capabilities?.trial?.remainingMs ?? capabilities?.trial?.remaining_ms ?? 0);
    if (!Number.isFinite(msLeft) || msLeft < 0) msLeft = 0;

    if (endsAtMs) {
      const diff = endsAtMs - nowTs;
      if (Number.isFinite(diff)) msLeft = Math.max(0, diff);
    }

    const totalSeconds = Math.floor(msLeft / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} gün`);
    if (hours > 0 || days > 0) parts.push(`${hours} saat`);
    parts.push(`${minutes} dk`);
    parts.push(`${seconds} sn`);

    const pad2 = (n) => String(Number(n) || 0).padStart(2, '0');
    const endLabel = endsAt && !Number.isNaN(endsAt.getTime())
      ? `${pad2(endsAt.getDate())}.${pad2(endsAt.getMonth() + 1)}.${endsAt.getFullYear()} ${pad2(endsAt.getHours())}:${pad2(endsAt.getMinutes())}`
      : '';

    return {
      label: parts.join(' '),
      endsAt: endsAtRaw,
      endsAtLabel: endLabel
    };
  }, [capabilities, nowTs]);

  useEffect(() => {
    const isTrial = (capabilities?.planCode || '').toString().toLowerCase() === 'trial' || Boolean(capabilities?.trial?.active);
    if (!isTrial) return;

    const t = setInterval(() => {
      setNowTs(Date.now());
    }, 1000);
    return () => {
      clearInterval(t);
    };
  }, [capabilities]);

  const prefillPublicCache = useCallback((subdomain, siteObj) => {
    try {
      const s = (subdomain || '').toString().trim().toLowerCase();
      if (!s) return;
      const key = `${PUBLIC_SITE_CACHE_PREFIX}${s}`;
      localStorage.setItem(key, JSON.stringify({ at: Date.now(), site: siteObj || null }));
    } catch (e) {
      void e;
    }
  }, []);

  const prefetchPublicSite = useCallback(async (subdomain, shopierUrl) => {
    const sd = (subdomain || '').toString().trim().toLowerCase();
    if (!sd) return;

    try {
      const visitorId = (() => {
        try {
          let v = localStorage.getItem('odelink_visitor_id');
          if (!v) {
            if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') v = crypto.randomUUID();
            else v = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
            localStorage.setItem('odelink_visitor_id', v);
          }
          return v;
        } catch (e) {
          void e;
          return '';
        }
      })();

      const qs = visitorId ? `?visitorId=${encodeURIComponent(visitorId)}` : '';
      const res = await fetch(`${API_BASE}/api/sites/public/${encodeURIComponent(sd)}${qs}`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.site) {
        prefillPublicCache(sd, data.site);
      }
    } catch (e) {
      void e;
    }

    const su = (shopierUrl || '').toString().trim();
    if (!su) return;
    try {
      const headers = getAuthHeaders({ 'Content-Type': 'application/json' });
      await fetch(`${API_BASE}/api/shopier/scrape`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ shopierUrl: su }),
        cache: 'no-store'
      }).catch(() => {});
    } catch (e) {
      void e;
    }
  }, [prefillPublicCache]);

  const openPublicSiteNewTab = async (siteRow) => {
    try {
      const subdomain = (siteRow?.subdomain || '').toString().trim();
      if (!subdomain) return;

      prefillPublicCache(subdomain, siteRow);
      prefetchPublicSite(subdomain, siteRow?.shopier_url || siteRow?.shopierUrl || siteRow?.shopier || '').catch(() => {});
      window.open(`https://odelink.shop/s/${encodeURIComponent(subdomain)}`, '_blank', 'noopener,noreferrer');
    } catch (e) {
      void e;
    }
  };

  useEffect(() => {
    if (didWarmPrefetchRef.current) return;
    if (loading) return;
    if (!Array.isArray(sites) || sites.length === 0) return;

    didWarmPrefetchRef.current = true;

    const run = () => {
      try {
        const list = sites.slice(0, 3);
        for (const s of list) {
          const sd = (s?.subdomain || '').toString().trim();
          if (!sd) continue;
          prefillPublicCache(sd, s);
          prefetchPublicSite(sd, s?.shopier_url || s?.shopierUrl || s?.shopier || '').catch(() => {});
        }
      } catch (e) {
        void e;
      }
    };

    let t = null;
    try {
      if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
        t = window.requestIdleCallback(run, { timeout: 1500 });
        return () => {
          try {
            window.cancelIdleCallback(t);
          } catch (e) {
            void e;
          }
        };
      }
    } catch (e) {
      void e;
    }

    t = setTimeout(run, 0);
    return () => {
      try {
        clearTimeout(t);
      } catch (e) {
        void e;
      }
    };
  }, [loading, sites, prefetchPublicSite, prefillPublicCache]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-white">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 pt-12 sm:pt-16 md:pt-24 pb-12 sm:pb-16 md:pb-20 px-4">
      <div className="container mx-auto" style={{ maxWidth: 980 }}>
        {error ? (
          <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur p-4 sm:p-6 mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Mağaza Paneli</h1>
            <p className="text-sm sm:text-base text-gray-200 mt-2">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
              <button type="button" className="btn-primary min-h-[48px]" onClick={() => window.location.reload()}>
                Tekrar Dene
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur overflow-hidden">
            <div className="p-4 sm:p-6">
              {trialView ? (
                <div className="mb-4 flex justify-end">
                  <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm px-4 py-3 w-full sm:w-auto sm:min-w-[320px]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">Deneme aktif</div>
                        <div className="text-gray-300 text-xs mt-1">Kalan: <span className="font-semibold text-white">{trialView.label}</span></div>
                        {trialView.endsAtLabel ? (
                          <div className="text-gray-300 text-xs mt-1">Bitiş: <span className="font-semibold text-white">{trialView.endsAtLabel}</span></div>
                        ) : null}
                      </div>
                      <div className="shrink-0">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/plans')}>Plan Seç</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10 flex flex-col justify-center items-center text-center min-h-[100px]">
                  <div className="text-xs sm:text-sm text-gray-300">Toplam Site</div>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1">{myStats.totalSites}</div>
                  <div className="text-xs sm:text-sm text-gray-300 mt-1">{myStats.activeSites} aktif</div>
                </div>
                <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10 flex flex-col justify-center items-center text-center min-h-[100px]">
                  <div className="text-xs sm:text-sm text-gray-300">Abonelik</div>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1">{subscriptionView.label}</div>
                  <div className="text-xs sm:text-sm text-gray-300 mt-1">{subscriptionView.subtitle}</div>
                </div>
                <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10 flex flex-col justify-center items-center text-center min-h-[100px]">
                  <div className="text-xs sm:text-sm text-gray-300">Yeni Siteler</div>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1">{Number(stats?.recent_sites || 0)}</div>
                  <div className="text-xs sm:text-sm text-gray-300 mt-1">Son 30 gün</div>
                </div>
              </div>

              {(capabilities?.monthlyReportDownload || capabilities?.vipSupport) && (
                <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10">
                  <div className="font-semibold text-white">Yıllık Avantajlar Aktif</div>
                  <div className="text-gray-300 text-sm mt-1">Aylık rapor erişimi ve destek önceliği aktif.</div>
                  {reportError && (
                    <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                      {reportError}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    {capabilities?.monthlyReportDownload ? (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={async () => {
                          setReportError('');
                          try {
                            const res = await fetch(`${API_BASE}/api/reports/monthly-summary`, {
                              headers: getAuthHeaders()
                            });
                            const data = await res.json().catch(() => ({}));
                            if (!res.ok) {
                              setReportError((data?.error || 'Rapor alınamadı').toString());
                              return;
                            }
                            const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `odelink-rapor-${new Date().toISOString().slice(0, 10)}.json`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            URL.revokeObjectURL(url);
                          } catch (e) {
                            setReportError('Rapor alınamadı');
                          }
                        }}
                      >
                        Aylık Raporu İndir
                      </button>
                    ) : null}

                    {capabilities?.vipSupport ? (
                      <button type="button" className="btn-primary" onClick={() => navigate('/vip-support')}>
                        VIP Destek
                      </button>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-10">
                <h2 className="text-xl font-bold text-white">Sitelerim</h2>
                <button type="button" className="btn-secondary" onClick={() => navigate('/site-builder')}>
                  Yeni Site
                </button>
              </div>

              {sites.length === 0 ? (
                <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10">
                  <div className="font-semibold text-white">Henüz siten yok</div>
                  <div className="text-gray-300 text-sm mt-1">Hemen bir vitrin sayfası oluştur.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {sites.map((site) => (
                    <div key={site.id} className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-bold text-white">{site.name}</div>
                        </div>
                        <div className="shrink-0">
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => openPublicSiteNewTab(site)}
                            disabled={!String(site?.subdomain || '').trim()}
                            title={String(site?.subdomain || '').trim() ? 'Siteyi aç' : 'Subdomain bulunamadı'}
                          >
                            Aç
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="w-full text-xs text-gray-300">Mağazayı Yönet</div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}/policies`)}
                          >
                            Politikalar
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}/analytics`)}
                          >
                            Analitik
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}/builder`)}
                          >
                            Tasarım
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}/settings/general`)}
                          >
                            Ayarlar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPanel;
