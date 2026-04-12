import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuthHeaders, getAuthToken } from '../utils/authStorage';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5000'
    : '');

const formatTrDayLabel = (rawDate) => {
  try {
    const value = (rawDate || '').toString().trim();
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const weekday = date.toLocaleDateString('tr-TR', { weekday: 'long' });
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = String(date.getFullYear());
    return `${weekday} ${dd}.${mm}.${yyyy}`;
  } catch (error) {
    void error;
    return (rawDate || '').toString();
  }
};

export default function SiteAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const token = useMemo(() => getAuthToken(), []);

  useEffect(() => {
    if (!token || !id) return undefined;
    let es;
    let cancelled = false;
    let sseFailed = false;

    const open = () => {
      try {
        const url = `${API_BASE}/api/sites/${encodeURIComponent(id)}/analytics/stream?days=${encodeURIComponent(String(days))}&access_token=${encodeURIComponent(token)}`;
        es = new EventSource(url);
        es.addEventListener('analytics', (event) => {
          try {
            const parsed = JSON.parse(event.data || '{}');
            if (!cancelled) setData(parsed);
          } catch (e) {
            void e;
          }
        });
        es.onerror = () => {
          if (sseFailed) return;
          sseFailed = true;
          try { es.close(); } catch (e) { void e; }
        };
      } catch (e) {
        void e;
      }
    };

    open();
    return () => {
      cancelled = true;
      try { es && es.close(); } catch (e) { void e; }
    };
  }, [days, id, token]);

  useEffect(() => {
    if (!token) {
      navigate('/auth');
    }
  }, [navigate, token]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!token || !id) return;
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE}/api/sites/${encodeURIComponent(id)}/analytics?days=${encodeURIComponent(String(days))}`, {
          headers: getAuthHeaders()
        });
        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (!cancelled) {
            setError((body?.error || 'Analitik verisi alinamadi.').toString());
          }
          return;
        }

        if (!cancelled) {
          setData(body);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError('Analitik verisi alinamadi.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [days, id, token, refreshTick]);

  useEffect(() => {
    if (!token || !id) return undefined;
    const intervalId = setInterval(() => {
      setRefreshTick((value) => value + 1);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [id, token]);

  const totals = useMemo(() => {
    const raw = data?.totals || {};
    return {
      pageViews: Number(raw.pageViews || 0),
      uniqueVisitors: Number(raw.uniqueVisitors || 0),
      clicks: Number(raw.clicks || 0)
    };
  }, [data?.totals]);

  const series = useMemo(() => {
    const raw = Array.isArray(data?.series) ? data.series : [];
    return raw.map((row) => ({
      date: (row?.date || '').toString(),
      pageViews: Number(row?.pageViews || 0),
      uniqueVisitors: Number(row?.uniqueVisitors || 0),
      clicks: Number(row?.clicks || 0)
    }));
  }, [data?.series]);

  const breakdowns = useMemo(() => {
    const b = data?.breakdowns || {};
    const norm = (arr) => (Array.isArray(arr) ? arr : []).map((x) => ({ key: String(x?.key || ''), count: Number(x?.count || 0) }));
    return {
      referrers: norm(b.referrers),
      devices: norm(b.devices),
      countries: norm(b.countries)
    };
  }, [data?.breakdowns]);

  const topProducts = useMemo(() => {
    const raw = Array.isArray(data?.topProducts) ? data.topProducts : [];
    return raw.map((x) => ({ productKey: String(x?.productKey || ''), clicks: Number(x?.clicks || 0) }));
  }, [data?.topProducts]);

  const realtime = useMemo(() => {
    const r = data?.realtime || {};
    return {
      activeVisitors: Number(r.activeVisitors || 0),
      windowSeconds: Number(r.windowSeconds || 0),
      windowCounts: r?.window?.counts || {}
    };
  }, [data?.realtime]);

  const derived = useMemo(() => {
    const dayCount = Math.max(series.length, 1);
    const clickRate = totals.pageViews > 0 ? (totals.clicks / totals.pageViews) * 100 : 0;
    return {
      averageDailyViews: Math.round(totals.pageViews / dayCount),
      clickRate: clickRate.toFixed(1),
      lastUpdated: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
  }, [series.length, totals.clicks, totals.pageViews]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 pt-16 sm:pt-24 pb-16 sm:pb-20 px-4">
      <div className="container mx-auto" style={{ maxWidth: 980 }}>
        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="text-xs text-gray-300/90">Site</div>
              <div className="text-2xl font-bold text-white">Analitik Ozeti</div>
              <div className="text-xs text-gray-400 mt-1">Son {days} gunluk ozet. Ekran otomatik yenilenir.</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <select
                  value={days}
                  onChange={(event) => setDays(Number(event.target.value || 30))}
                  className="h-11 w-full appearance-none rounded-xl bg-black/20 border border-white/10 px-3 pr-10 text-sm text-white outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10 [color-scheme:dark] [&>option]:text-black [&>option]:bg-white"
                >
                  <option value={7}>7 gun</option>
                  <option value={30}>30 gun</option>
                  <option value={90}>90 gun</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-white">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <button
                type="button"
                className="h-11 rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white outline-none hover:bg-white/10 focus:border-red-500/40 focus:ring-4 focus:ring-red-500/10"
                onClick={() => setRefreshTick((value) => value + 1)}
              >
                Yenile
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/panel')}>
                Panele Don
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-24 rounded-2xl bg-white/5 border border-white/10" />
              <div className="h-24 rounded-2xl bg-white/5 border border-white/10" />
              <div className="h-24 rounded-2xl bg-white/5 border border-white/10" />
            </div>
          ) : null}

          {!loading && !error ? (
            <>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-xs text-gray-300">Toplam goruntulenme</div>
                  <div className="text-3xl font-black text-white mt-1">{totals.pageViews}</div>
                  <div className="text-xs text-gray-400 mt-1">Tum sayfa goruntulenmeleri</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-xs text-gray-300">Tekil ziyaretci</div>
                  <div className="text-3xl font-black text-white mt-1">{totals.uniqueVisitors}</div>
                  <div className="text-xs text-gray-400 mt-1">Ayrisik ziyaretci sayisi</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-xs text-gray-300">Tiklama</div>
                  <div className="text-3xl font-black text-white mt-1">{totals.clicks}</div>
                  <div className="text-xs text-gray-400 mt-1">Shopier ve aksiyon tiklamalari</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
                  <div className="text-xs text-gray-300">Gunluk ortalama</div>
                  <div className="text-2xl font-black text-white mt-1">{derived.averageDailyViews}</div>
                  <div className="text-xs text-gray-400 mt-1">Gun basina goruntulenme</div>
                </div>
                <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
                  <div className="text-xs text-gray-300">Tiklama orani</div>
                  <div className="text-2xl font-black text-white mt-1">%{derived.clickRate}</div>
                  <div className="text-xs text-gray-400 mt-1">Tiklama / goruntulenme</div>
                </div>
                <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
                  <div className="text-xs text-gray-300">Son yenileme</div>
                  <div className="text-2xl font-black text-white mt-1">{derived.lastUpdated}</div>
                  <div className="text-xs text-gray-400 mt-1">Bu ekran 10 saniyede bir guncellenir</div>
                </div>
              </div>

              <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">Gunluk dagilim</div>
                  <div className="text-xs text-gray-400">Tarih / Goruntulenme / Tekil / Tiklama</div>
                </div>
                <div className="max-h-[420px] overflow-auto">
                  {series.length ? series.map((row) => (
                    <div key={row.date} className="px-4 py-3 border-b border-white/10 text-sm text-gray-200 flex items-center justify-between gap-4">
                      <div className="text-xs text-gray-200">{formatTrDayLabel(row.date)}</div>
                      <div className="flex items-center gap-5">
                        <div className="text-xs">{row.pageViews}</div>
                        <div className="text-xs">{row.uniqueVisitors}</div>
                        <div className="text-xs">{row.clicks}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="px-4 py-6 text-sm text-gray-300">Henuz veri yok.</div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">Kirilimlar</div>
                    <div className="text-xs text-gray-400">Referrer / Cihaz / Ulke</div>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-gray-300 mb-2">Referrer</div>
                      {(breakdowns.referrers.length ? breakdowns.referrers : [{ key: '-', count: 0 }]).map((r) => (
                        <div key={`ref-${r.key}`} className="flex items-center justify-between text-xs text-gray-200 py-1 border-b border-white/5">
                          <span className="truncate pr-2">{r.key || '-'}</span>
                          <span className="text-gray-300">{r.count}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs text-gray-300 mb-2">Cihaz</div>
                      {(breakdowns.devices.length ? breakdowns.devices : [{ key: '-', count: 0 }]).map((r) => (
                        <div key={`dev-${r.key}`} className="flex items-center justify-between text-xs text-gray-200 py-1 border-b border-white/5">
                          <span className="truncate pr-2">{r.key || '-'}</span>
                          <span className="text-gray-300">{r.count}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs text-gray-300 mb-2">Ulke</div>
                      {(breakdowns.countries.length ? breakdowns.countries : [{ key: '-', count: 0 }]).map((r) => (
                        <div key={`ct-${r.key}`} className="flex items-center justify-between text-xs text-gray-200 py-1 border-b border-white/5">
                          <span className="truncate pr-2">{r.key || '-'}</span>
                          <span className="text-gray-300">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">En cok tiklanan urunler</div>
                    <div className="text-xs text-gray-400">ProductKey / Tiklama</div>
                  </div>
                  <div className="max-h-[360px] overflow-auto">
                    {(topProducts.length ? topProducts : [{ productKey: '-', clicks: 0 }]).map((p) => (
                      <div key={`tp-${p.productKey}`} className="px-4 py-3 border-b border-white/10 text-xs text-gray-200 flex items-center justify-between gap-4">
                        <div className="truncate pr-3">{p.productKey || '-'}</div>
                        <div className="text-gray-300">{p.clicks}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-black/20 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-300">Anlik</div>
                    <div className="text-sm font-semibold text-white">Online: {realtime.activeVisitors}</div>
                  </div>
                  <div className="text-xs text-gray-400">Son {Math.round((realtime.windowSeconds || 0) / 60)} dk pencere</div>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="text-xs text-gray-300">Page View</div>
                    <div className="text-lg font-black text-white">{Number(realtime.windowCounts?.page_view || 0)}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="text-xs text-gray-300">Click</div>
                    <div className="text-lg font-black text-white">{Number(realtime.windowCounts?.click || 0)}</div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
