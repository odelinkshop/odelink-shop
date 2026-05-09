import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

const API_BASE = (() => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:5000';
    // Use same protocol and host as current page (handles both www and non-www)
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'https://www.odelink.shop';
})();

const POLICY_FIELDS = [
  { key: 'privacy', title: 'Gizlilik Politikası' },
  { key: 'terms', title: 'Kullanım Koşulları' },
  { key: 'returns', title: 'İade ve Değişim Politikası' },
  { key: 'shipping', title: 'Kargo ve Teslimat' },
  { key: 'kvkk', title: 'KVKK Aydınlatma Metni' },
  { key: 'cookies', title: 'Çerez Politikası' }
];

export default function PublicPoliciesPage() {
  const { subdomain } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [policies, setPolicies] = useState({});

  const backHref = useMemo(() => `https://www.odelink.shop/s/${encodeURIComponent(subdomain || '')}`, [subdomain]);

  const fields = useMemo(
    () => POLICY_FIELDS.filter((f) => (policies?.[f.key] || '').toString().trim().length > 0),
    [policies]
  );

  const selectedKey = useMemo(() => {
    try {
      const sp = new URLSearchParams(location?.search || '');
      const p = (sp.get('p') || '').toString().trim().toLowerCase();
      if (!p) return '';
      if (POLICY_FIELDS.some((f) => f.key === p)) return p;
      return '';
    } catch (e) {
      void e;
      return '';
    }
  }, [location?.search]);

  useEffect(() => {
    try {
      if (!selectedKey) return;
      const el = document.getElementById(`policy-${selectedKey}`);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      void e;
    }
  }, [selectedKey, loading]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/api/sites/public/${encodeURIComponent(subdomain || '')}/policies`, {
          cache: 'no-store'
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `HTTP_${res.status}`);
        if (!cancelled) setPolicies(data?.policies || {});
      } catch (e) {
        if (!cancelled) setError((e?.message || 'Politikalar yüklenemedi').toString());
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [subdomain]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <button type="button" className="btn-secondary" onClick={() => { window.location.href = backHref; }}>
              Siteye Dön
            </button>
            <div className="text-sm text-slate-600">Politikalar</div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
          <div className="h-10 w-64 bg-slate-200 rounded" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-5/6 bg-slate-200 rounded" />
            <div className="h-4 w-4/6 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <button type="button" className="btn-secondary" onClick={() => { window.location.href = backHref; }}>
              Siteye Dön
            </button>
            <div className="text-sm text-slate-600">Politikalar</div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">Politikalar</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <button type="button" className="btn-primary" onClick={() => { window.location.href = backHref; }}>
              Siteye Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button type="button" className="btn-secondary" onClick={() => { window.location.href = backHref; }}>
            Siteye Dön
          </button>
          <div className="text-sm text-slate-600">{(subdomain || '').toString()}</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Politikalar</h1>
          <p className="text-slate-600">Bu sayfa, mağazanızın yasal metinlerini içerir.</p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          <aside className="hidden md:block">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-20">
              <div className="text-xs font-semibold text-slate-500 mb-3">BAŞLIKLAR</div>
              <div className="space-y-1">
                {fields.map((f) => {
                  const active = selectedKey ? selectedKey === f.key : false;
                  const href = `https://www.odelink.shop/s/${encodeURIComponent(subdomain || '')}/policies?p=${encodeURIComponent(f.key)}`;
                  return (
                    <a
                      key={f.key}
                      href={href}
                      className={
                        `block px-3 py-2 rounded-lg text-sm font-medium transition `
                        + (active
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 hover:bg-slate-100')
                      }
                    >
                      {f.title}
                    </a>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="space-y-6">
          {!fields.length ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-slate-600">Bu site için politika metni bulunamadı.</p>
            </div>
          ) : (
            fields.map((f) => (
              <section id={`policy-${f.key}`} key={f.key} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-lg md:text-xl font-bold text-slate-900">{f.title}</h2>
                </div>
                <div className="p-6">
                  <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">{(policies?.[f.key] || '').toString()}</div>
                </div>
              </section>
            ))
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
