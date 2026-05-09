import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useCapabilities from '../hooks/useCapabilities';
import { getAuthToken } from '../utils/authStorage';
import { getApiBase } from '../utils/apiBase';

const SHOPIER_STORE_URL = 'https://www.shopier.com/odelinkshop';
const API_BASE = getApiBase();

const TIER_ORDER = {
  standart: 0,
  profesyonel: 1
};

function normalizeTier(tierRaw) {
  const t = (tierRaw || '').toString().trim().toLowerCase();
  if (t === 'standart' || t === 'standard') return 'standart';
  if (t === 'profesyonel' || t === 'professional' || t === 'pro' || t === 'premium') return 'profesyonel';
  return '';
}

function normalizeCycle(cycleRaw) {
  const c = (cycleRaw || '').toString().trim().toLowerCase();
  if (c === 'yearly' || c === 'annual' || c === 'yillik') return 'yearly';
  return 'monthly';
}

export default function PlanDetailsPage() {
  const { tier: tierParam, cycle: cycleParam } = useParams();
  const navigate = useNavigate();

  const [catalog, setCatalog] = useState(null);

  const { capabilities, loading: capsLoading, hasToken } = useCapabilities();
  const currentTier = useMemo(() => normalizeTier(capabilities?.tier), [capabilities]);
  const currentCycle = useMemo(() => (capabilities?.billingCycle || '').toString().trim().toLowerCase(), [capabilities]);

  const goPricing = () => {
    navigate('/');
    try {
      setTimeout(() => {
        try {
          window.location.hash = '#pricing';
        } catch (e) {
          void e;
        }
      }, 0);
    } catch (e) {
      void e;
    }
  };

  const tier = normalizeTier(tierParam);
  const cycle = normalizeCycle(cycleParam);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/subscriptions/plans`, { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && res.ok) {
          setCatalog(data?.catalog || null);
        }
      } catch (e) {
        if (!cancelled) setCatalog(null);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const includesCopy = useMemo(() => {
    if (tier === 'standart') return '';
    if (tier === 'profesyonel') return 'Standart paketin tüm özellikleri dahildir.';
    return '';
  }, [tier]);

  const tierStatus = useMemo(() => {
    const curRank = currentTier ? (TIER_ORDER[currentTier] ?? -1) : -1;
    const planRank = tier ? (TIER_ORDER[tier] ?? -1) : -1;
    if (!hasToken) return { label: 'Giriş yapınca durum görünür', tone: 'bg-gray-50 text-gray-700 border-gray-200' };
    if (capsLoading) return { label: 'Kontrol ediliyor…', tone: 'bg-gray-50 text-gray-700 border-gray-200' };
    if (curRank >= 0 && planRank >= 0 && curRank >= planRank) {
      return { label: 'Bu plan sende açık (paketin kapsıyor)', tone: 'bg-green-50 text-green-700 border-green-200' };
    }
    if (curRank >= 0 && planRank >= 0 && curRank < planRank) {
      return { label: 'Bu planı yükseltince açılır', tone: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (!currentTier) return { label: 'Aktif abonelik görünmüyor', tone: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Durum belirlenemedi', tone: 'bg-gray-50 text-gray-700 border-gray-200' };
  }, [capsLoading, currentTier, hasToken, tier]);

  const plan = useMemo(() => {
    const tiers = catalog?.tiers || {};
    const def = tier ? tiers?.[tier] : null;
    if (!def) return null;

    const cycleDef = def?.billingCycles?.[cycle] || null;
    const caps = def?.capabilities || {};
    const groups = Array.isArray(def?.featureGroups) ? def.featureGroups : [];
    const highlights = groups.flatMap((g) => Array.isArray(g?.items) ? g.items : []).filter(Boolean);

    return {
      tier,
      cycle,
      title: def?.label || (tier === 'profesyonel' ? 'Profesyonel' : 'Standart'),
      billingLabel: cycle === 'yearly' ? 'Yıllık' : 'Aylık',
      priceLabel: (cycleDef?.priceLabel || '').toString(),
      price: cycleDef?.price,
      maxSites: Number(caps?.maxSites || 0),
      monthlyReportDownload: Boolean(caps?.monthlyReportDownload),
      vipSupport: Boolean(caps?.vipSupport),
      analytics: 'Temel analitik (ziyaret / tıklama)',
      support: (caps?.vipSupport || caps?.supportLevel === 'priority') ? 'VIP/Öncelikli destek' : 'E-posta destek',
      highlights
    };
  }, [catalog, tier, cycle]);

  if (!plan) {
    return (
      <div className="min-h-screen gradient-bg pt-24 sm:pt-32 pb-16 sm:pb-20 px-4">
        <div className="container mx-auto" style={{ maxWidth: 980 }}>
          <div className="card" style={{ borderRadius: 16 }}>
            <h1 className="text-2xl font-bold text-gray-900">Plan bulunamadı</h1>
            <p className="text-gray-700 mt-2">Seçtiğin plan adresi hatalı olabilir.</p>
            <div className="flex gap-3 mt-6">
              <button type="button" className="btn-primary" onClick={goPricing}>Fiyatlandırmaya Dön</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Ana Sayfa</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pt-24 sm:pt-32 pb-16 sm:pb-20 px-4">
      <div className="container mx-auto" style={{ maxWidth: 980 }}>
        <div className="card" style={{ borderRadius: 16 }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{plan.title} Plan</h1>
              <p className="text-gray-600 mt-1">Ödeme döngüsü: {plan.billingLabel}</p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${tierStatus.tone}`}>
                  {tierStatus.label}
                </span>
                {includesCopy ? (
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700">
                    {includesCopy}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  const token = getAuthToken();
                  if (!token) {
                    navigate('/auth');
                    return;
                  }
                  try {
                    localStorage.setItem('odelink_intended_plan', plan.title.toUpperCase());
                    localStorage.setItem('odelink_intended_cycle', plan.cycle);
                  } catch (e) {
                    void e;
                  }
                  window.location.href = SHOPIER_STORE_URL;
                }}
              >
                Paketi Seç
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white rounded-xl p-5 border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
              <div className="text-sm text-gray-600">Site Limiti</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{plan.maxSites}</div>
              <div className="text-sm text-gray-600 mt-1">aktif site</div>
            </div>
            <div className="bg-white rounded-xl p-5 border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
              <div className="text-sm text-gray-600">Aylık Rapor</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{plan.monthlyReportDownload ? 'Var' : 'Yok'}</div>
              <div className="text-sm text-gray-600 mt-1">indirme</div>
            </div>
            <div className="bg-white rounded-xl p-5 border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
              <div className="text-sm text-gray-600">VIP Destek</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{plan.vipSupport ? 'Var' : 'Yok'}</div>
              <div className="text-sm text-gray-600 mt-1">öncelikli</div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900">Bu pakette neler var?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-xl p-5 border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <div className="font-semibold text-gray-900">Öne çıkanlar</div>
                <div className="text-gray-700 text-sm mt-2">
                  {plan.highlights.map((x, i) => (
                    <div key={i} className="mt-1">- {x}</div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <div className="font-semibold text-gray-900">Analitik</div>
                <div className="text-gray-700 text-sm mt-2">{plan.analytics}</div>
                <div className="font-semibold text-gray-900 mt-4">Destek</div>
                <div className="text-gray-700 text-sm mt-2">{plan.support}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

