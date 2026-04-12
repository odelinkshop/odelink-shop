import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Crown, Diamond } from 'lucide-react';
import useCapabilities from '../hooks/useCapabilities';
import { getAuthToken } from '../utils/authStorage';
import { getApiBase } from '../utils/apiBase';

const SHOPIER_STANDART_URL = 'https://www.shopier.com/odelinkshop/45402190';
const SHOPIER_PROFESYONEL_URL = 'https://www.shopier.com/odelinkshop/45402237';
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

function formatRemaining(ms) {
  const value = Number(ms);
  if (!Number.isFinite(value) || value <= 0) return '';

  const totalMinutes = Math.floor(value / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - (days * 60 * 24)) / 60);
  const minutes = totalMinutes - (days * 60 * 24) - (hours * 60);

  if (days > 0) return `${days} gün ${hours} saat`;
  if (hours > 0) return `${hours} saat ${minutes} dk`;
  return `${minutes} dk`;
}

const PremiumPricing = () => {
  const disableDesktopMotion = false;
  const [isAnnual, setIsAnnual] = useState(false);
  const [busyPlan, setBusyPlan] = useState(null);
  const [expandedPlans, setExpandedPlans] = useState({});
  const [catalog, setCatalog] = useState(null);

  const { capabilities, loading: capsLoading, hasToken } = useCapabilities();
  const currentTier = useMemo(() => normalizeTier(capabilities?.tier), [capabilities]);
  const currentCycle = useMemo(() => (capabilities?.billingCycle || '').toString().trim().toLowerCase(), [capabilities]);

  const trial = capabilities?.trial || null;
  const trialActive = Boolean(trial?.active) || (capabilities?.planCode || '') === 'trial';
  const trialExpired = Boolean(trial?.expired) || Boolean(capabilities?.trialExpired);
  const trialEndsAt = useMemo(() => {
    const raw = trial?.endsAt || trial?.trialEndsAt || null;
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }, [trial]);
  const trialRemainingLabel = useMemo(() => {
    const msRaw = trial?.remainingMs ?? trial?.remaining_ms ?? null;
    const ms = Number(msRaw);
    if (Number.isFinite(ms) && ms > 0) return formatRemaining(ms);
    if (trialEndsAt) {
      const diff = trialEndsAt.getTime() - Date.now();
      if (diff > 0) return formatRemaining(diff);
    }
    return '';
  }, [trial, trialEndsAt]);

  const scrollToPlans = () => {
    const el = document.getElementById('plans-grid');
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const fallback = document.getElementById('pricing');
    if (fallback && typeof fallback.scrollIntoView === 'function') {
      fallback.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const recommendedName = isAnnual ? 'PROFESYONEL' : 'STANDART';

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

  const plans = useMemo(() => {
    const tiers = catalog?.tiers || {};
    const standart = tiers?.standart;
    const profesyonel = tiers?.profesyonel;
    return [
      {
        tier: 'standart',
        name: 'STANDART',
        description: 'Aylık paket',
        monthlyPrice: standart?.billingCycles?.monthly?.price ?? 299.0,
        annualPrice: null,
        icon: Crown,
        color: 'from-gray-900 to-gray-900'
      },
      {
        tier: 'profesyonel',
        name: 'PROFESYONEL',
        description: 'Yıllık paket',
        monthlyPrice: null,
        annualPrice: profesyonel?.billingCycles?.yearly?.price ?? 399.0,
        icon: Diamond,
        color: 'from-gray-900 to-gray-900'
      }
    ];
  }, [catalog]);

  const visiblePlans = useMemo(() => (
    plans
      .map((p) => {
        const price = isAnnual ? p.annualPrice : p.monthlyPrice;
        const unavailable = price === null || price === undefined;
        const highlight = !unavailable && p.name === recommendedName;
        return {
          ...p,
          price,
          unavailable,
          highlight,
          badge: highlight ? 'ÖNERİLEN' : ''
        };
      })
      .filter((p) => !p.unavailable)
  ), [plans, isAnnual, recommendedName]);

  const showTrialCard = Boolean(!hasToken || capsLoading);
  const renderedCardCount = (visiblePlans?.length || 0) + (showTrialCard ? 1 : 0);

  const planFeatures = useMemo(() => {
    const tiers = catalog?.tiers || {};
    const out = { STANDART: [], PROFESYONEL: [] };
    const s = tiers?.standart;
    const p = tiers?.profesyonel;
    const flatten = (def) => {
      const groups = Array.isArray(def?.featureGroups) ? def.featureGroups : [];
      const items = groups.flatMap((g) => Array.isArray(g?.items) ? g.items : []);
      return items.filter(Boolean);
    };
    out.STANDART = flatten(s);
    out.PROFESYONEL = flatten(p);
    // fallback for first render
    if (!out.STANDART.length) out.STANDART = [
      '3 vitrin sitesi',
      '3 dk kurulum',
      'Mağaza paneli + ayarlar',
      'Politikalar (KVKK/iade/kargo/gizlilik)',
      'Hızlı açılış (önbellek + CDN)',
      'E-posta destek'
    ];
    if (!out.PROFESYONEL.length) out.PROFESYONEL = [
      '10 vitrin sitesi',
      'Kurumsal + kararlı altyapı',
      'Aylık rapor indirme',
      'VIP/Öncelikli destek'
    ];
    return out;
  }, [catalog]);

  const toggleExpanded = (planName) => {
    setExpandedPlans((prev) => ({
      ...(prev || {}),
      [planName]: !prev?.[planName]
    }));
  };

  const pickPlan = async (planName) => {
    const token = getAuthToken();
    if (!token) {
      window.location.href = '/auth';
      return;
    }

    const confirmed = window.confirm('Ödeme için Shopier sayfasına yönlendirileceksin. ÖNEMLİ: Shopier’de “Sipariş Notu” alanına kayıt olduğun e‑postayı yaz. Devam edilsin mi?');
    if (!confirmed) {
      return;
    }

    setBusyPlan(planName);
    try {
      const url = planName === 'PROFESYONEL' ? SHOPIER_PROFESYONEL_URL : SHOPIER_STANDART_URL;
      
      try {
        localStorage.setItem('odelink_intended_plan', planName);
        localStorage.setItem('odelink_intended_cycle', isAnnual ? 'yearly' : 'monthly');
      } catch (e) {
        void e;
      }

      window.location.href = url;
    } catch (e) {
      window.location.href = planName === 'PROFESYONEL' ? SHOPIER_PROFESYONEL_URL : SHOPIER_STANDART_URL;
    } finally {
      setBusyPlan(null);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden cv-desktop" id="pricing">
      <div className="container mx-auto px-4 relative z-10">
        {disableDesktopMotion ? (
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-black/90 text-white px-5 py-2.5 rounded-full mb-8 shadow-lg border border-white/10">
              <Crown className="w-6 h-6 mr-3" />
              <span className="text-sm font-black tracking-wide">Fiyatlandırma</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Planınızı seç
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto text-base md:text-lg font-medium">
              İhtiyacınıza göre paketi seç, dakikalar içinde yayına çık.
            </p>
            
            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
              <span className={`text-base sm:text-xl font-bold whitespace-nowrap ${!isAnnual ? 'text-white' : 'text-white/60'}`}>
                AYLIK
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-11 w-20 sm:h-12 sm:w-24 items-center rounded-full transition-all duration-300 shrink-0 ${
                  isAnnual ? 'bg-red-500' : 'bg-white/25'
                }`}
              >
                <span
                  className={`inline-block h-9 w-9 sm:h-10 sm:w-10 transform rounded-full bg-white transition-all duration-300 ${
                    isAnnual ? 'translate-x-10 sm:translate-x-12' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-base sm:text-xl font-bold whitespace-nowrap ${isAnnual ? 'text-white' : 'text-white/60'}`}>YILLIK</span>
              <span className="text-xs sm:text-sm bg-gray-900 text-white px-3 py-1 rounded-full font-black whitespace-nowrap">
                {isAnnual ? 'YILLIK ÖZEL' : 'YILLIKTA PROFESYONEL ₺399'}
              </span>
            </div>
          </div>
        ) : (
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center bg-black/90 text-white px-5 py-2.5 rounded-full mb-8 shadow-lg border border-white/10">
              <Crown className="w-6 h-6 mr-3" />
              <span className="text-sm font-black tracking-wide">Fiyatlandırma</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Planınızı seç
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto text-base md:text-lg font-medium">
              İhtiyacınıza göre paketi seç, dakikalar içinde yayına çık.
            </p>
            
            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
              <span className={`text-base sm:text-xl font-bold whitespace-nowrap ${!isAnnual ? 'text-white' : 'text-white/60'}`}>
                AYLIK
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-11 w-20 sm:h-12 sm:w-24 items-center rounded-full transition-all duration-300 shrink-0 ${
                  isAnnual ? 'bg-red-500' : 'bg-white/25'
                }`}
              >
                <span
                  className={`inline-block h-9 w-9 sm:h-10 sm:w-10 transform rounded-full bg-white transition-all duration-300 ${
                    isAnnual ? 'translate-x-10 sm:translate-x-12' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-base sm:text-xl font-bold whitespace-nowrap ${isAnnual ? 'text-white' : 'text-white/60'}`}>YILLIK</span>
              <span className="text-xs sm:text-sm bg-gray-900 text-white px-3 py-1 rounded-full font-black whitespace-nowrap">
                {isAnnual ? 'YILLIK ÖZEL' : 'YILLIKTA PROFESYONEL ₺399'}
              </span>
            </div>
          </motion.div>
        )}
        
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="mb-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900">
                <div className="text-sm font-bold">Shopier ödeme notu</div>
                <div className="text-sm">Ödeme yaparken Shopier’de “Sipariş Notu” alanına kayıt olduğun e‑postayı yaz. (Manuel onay için gerekli)</div>
              </div>
            </div>

            {hasToken && !capsLoading ? (
              <div className="mb-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white/90">
                  <div className="text-sm font-bold">Plan seçimi</div>
                  <div className="text-sm text-white/70">Aşağıdan paket seçebilirsin. Ödeme sonrası planın admin onayıyla aktif edilir.</div>
                </div>
              </div>
            ) : null}

            <div
              id="plans-grid"
              className={`grid gap-8 w-full max-w-6xl mx-auto justify-center ${
                renderedCardCount === 1
                  ? 'grid-cols-1'
                  : renderedCardCount === 2
                    ? 'grid-cols-1 md:grid-cols-2 max-w-3xl'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              } justify-items-center`}
            >
              {showTrialCard && (
                <motion.div
                  key="trial-card"
                  className="relative"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0 }}
                >
                  <div className="relative bg-white/85 backdrop-blur-md rounded-3xl p-6 shadow-lg border-2 border-gray-200 flex flex-col h-full max-w-[320px]">
                    <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-white" />
                    </div>

                    <div className="text-center flex-1 flex flex-col">
                      <h3 className="text-2xl font-black text-gray-900 mb-1">3 GÜN DENEME</h3>
                      <p className="text-gray-600 mb-4 text-sm font-medium leading-tight">Profesyonel özelliklerin tamamı 3 gün boyunca sende.</p>

                      <div className="mb-3 flex items-center justify-center gap-2 flex-row flex-wrap min-h-[28px]">
                        <span className="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold bg-gray-50 text-gray-700 border-gray-200">
                          Giriş yapınca başlar
                        </span>
                      </div>

                      <div className="mt-auto">
                        <div className="text-4xl font-black text-gray-900 mb-1">₺0</div>
                        <div className="text-gray-600 text-sm font-bold mb-4">3 gün</div>

                        <button
                          type="button"
                          onClick={() => { window.location.href = '/auth'; }}
                          className="btn-primary w-full py-3 text-sm"
                        >
                          Kayıt Ol / Giriş Yap
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {visiblePlans.map((plan, index) => (
                (() => {
                  const planTier = normalizeTier(plan?.name);
                  const curRank = currentTier ? (TIER_ORDER[currentTier] ?? -1) : -1;
                  const planRank = planTier ? (TIER_ORDER[planTier] ?? -1) : -1;
                  const isIncludedByTier = curRank >= 0 && planRank >= 0 && curRank >= planRank;
                  const isActive = Boolean(hasToken && !capsLoading && isIncludedByTier);
                  const willUnlock = Boolean(hasToken && !capsLoading && curRank >= 0 && planRank >= 0 && curRank < planRank);

                  const isCycleMismatch = Boolean(
                    hasToken &&
                    !capsLoading &&
                    currentCycle &&
                    ((isAnnual && currentCycle !== 'yearly') || (!isAnnual && currentCycle !== 'monthly'))
                  );

                  const statusLabel = isActive
                    ? 'Sende açık'
                    : willUnlock
                      ? 'Yükseltince açılır'
                      : isCycleMismatch
                        ? 'Paketin var (fatura dönemi farklı)'
                        : capsLoading && hasToken
                        ? 'Kontrol ediliyor…'
                        : hasToken
                          ? 'Plan seçince açılır'
                          : 'Giriş yapınca görünür';

                  const statusTone = isActive
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : willUnlock
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : isCycleMismatch
                        ? 'bg-gray-50 text-gray-700 border-gray-200'
                        : capsLoading && hasToken
                        ? 'bg-gray-50 text-gray-700 border-gray-200'
                        : hasToken
                          ? 'bg-gray-50 text-gray-700 border-gray-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200';

                  const includesCopy = '';
                  const chipLayoutClass = 'flex-row flex-wrap';
                  const showIncludesPlanSecince = false;

                  return (
                    <motion.div
                      key={index}
                      className={`relative ${plan.highlight ? 'scale-105' : ''}`}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      {plan.badge && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                          <div className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl flex items-center">
                            <Star className="w-4 h-4 mr-2" />
                            {plan.badge}
                          </div>
                        </div>
                      )}

                      <div
                        className={`relative bg-white/85 backdrop-blur-md rounded-3xl p-8 shadow-lg border-2 ${plan.highlight ? 'border-gray-900 ring-4 ring-red-500/30 shadow-red-500/20' : 'border-gray-200'} ${plan.name === 'PROFESYONEL' ? 'border-red-500/60 ring-2 ring-red-500/25' : ''} flex flex-col h-full`}
                      >
                        <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <plan.icon className="w-10 h-10 text-white" />
                        </div>

                        <div className="text-center flex-1 flex flex-col">
                          <h3 className="text-3xl font-black text-gray-900 mb-2">{plan.name}</h3>
                          <p className="text-gray-600 mb-6 font-medium">{plan.description}</p>

                          <div className={`mb-3 flex items-center justify-center gap-2 ${chipLayoutClass} min-h-[34px]`}>
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${statusTone}`}>
                              {statusLabel}
                            </span>
                            {includesCopy ? (
                              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700 text-center">
                                {includesCopy}
                              </span>
                            ) : null}
                          </div>

                          {showIncludesPlanSecince ? (
                            <div className="-mt-1 mb-2 text-center text-xs font-semibold text-gray-600">
                              Plan seçince açılır
                            </div>
                          ) : null}

                          <div className={`text-sm text-gray-700 mb-4 min-h-[92px] ${expandedPlans?.[plan.name] ? 'max-h-[220px] overflow-auto pr-1' : ''}`}>
                            {(planFeatures?.[plan.name] || []).slice(0, expandedPlans?.[plan.name] ? 12 : 4).map((x, i) => (
                              <div key={i} className="mt-1">- {x}</div>
                            ))}
                          </div>

                          <button
                            type="button"
                            className="text-xs font-bold text-gray-700 underline underline-offset-4"
                            onClick={() => toggleExpanded(plan.name)}
                          >
                            {expandedPlans?.[plan.name] ? 'Daha az göster' : 'Tüm özellikleri gör'}
                          </button>

                          <div className="mt-auto mb-4 flex items-baseline justify-center gap-2 whitespace-nowrap min-h-[64px]">
                            <span className="text-5xl font-black text-gray-900 leading-none">₺{Number(plan.price || 0).toFixed(2)}</span>
                            <span className="text-gray-600 text-lg leading-none">{isAnnual ? '/yıl' : '/ay'}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={busyPlan === plan.name}
                          onClick={() => pickPlan(plan.name)}
                          className={`${plan.highlight ? 'btn-primary' : 'btn-secondary'} w-full text-base ${busyPlan === plan.name ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {busyPlan === plan.name ? 'İşleniyor…' : 'Paketi Seç'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })()
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumPricing;

