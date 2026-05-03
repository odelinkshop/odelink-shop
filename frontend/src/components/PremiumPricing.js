import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Star, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Headphones, 
  Crown, 
  Diamond,
  ChevronRight,
  Printer,
  Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useCapabilities from '../hooks/useCapabilities';
import { getAuthToken } from '../utils/authStorage';
import { getApiBase } from '../utils/apiBase';

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

const PremiumPricing = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(true);
  const [busyPlan, setBusyPlan] = useState(null);
  const [catalog, setCatalog] = useState(null);

  const { capabilities, loading: capsLoading, hasToken } = useCapabilities();
  const currentTier = useMemo(() => normalizeTier(capabilities?.tier), [capabilities]);
  const currentCycle = useMemo(() => (capabilities?.billingCycle || '').toString().trim().toLowerCase(), [capabilities]);

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

  const comparisonFeatures = [
    { name: 'Aktif Vitrin Sitesi', standart: '1 Adet', profesyonel: '10 Adet' },
    { name: 'Shopier Ürün Senkronu', standart: true, profesyonel: true },
    { name: 'Ücretsiz SSL Sertifikası', standart: true, profesyonel: true },
    { name: '%0 Nova Komisyonu', standart: true, profesyonel: true },
    { name: 'Noir Fashion Teması', standart: true, profesyonel: true },
    { name: 'Gelecek Tüm Temalar', standart: false, profesyonel: true },
    { name: 'Özel Alan Adı (Domain)', standart: false, profesyonel: true },
    { name: 'Reklamsız Deneyim', standart: false, profesyonel: true },
    { name: 'Gelişmiş SEO Yönetimi', standart: false, profesyonel: true },
    { name: 'Ziyaretçi Analitiği', standart: 'Temel', profesyonel: 'Gelişmiş' },
    { name: 'Tasarım & CSS Editörü', standart: false, profesyonel: true },
    { name: 'VIP & Canlı Destek', standart: false, profesyonel: true },
  ];

  // SHOPIER PLAN LINKS - Gerçek linklerin tanımlandı!
  const SHOPIER_LINKS = {
    STANDART: 'https://www.shopier.com/Odelink/46527674', 
    PROFESYONEL: 'https://www.shopier.com/Odelink/46527715'
  };

  const pickPlan = (planName) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }

    const confirmed = window.confirm(`${planName} paket ödeme sayfasına (Shopier) yönlendirileceksiniz.\n\nÖNEMLİ: Hesabınızın otomatik eşleşmesi için Shopier üzerinde satın alım yaparken Odelink'e kayıt olduğunuz (${capabilities?.email || 'mevcut'}) e-posta adresini kullanmanız gerekmektedir.\n\nDevam edilsin mi?`);
    if (!confirmed) return;

    // Doğrudan Shopier linkine yönlendir
    const targetUrl = SHOPIER_LINKS[planName];
    
    if (targetUrl && targetUrl.includes('shopier.com')) {
      window.location.href = targetUrl;
    } else {
      alert('Ödeme linki henüz yapılandırılmadı. Lütfen yönetici ile iletişime geçin.');
    }
  };


  return (
    <section id="pricing" className="py-24 bg-[#050505] text-white relative overflow-hidden will-change-transform">
      {/* Optimized background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[80px] rounded-full will-change-transform" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-red-500/5 blur-[80px] rounded-full will-change-transform" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
            <Zap size={14} className="text-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Piyasanın En Uygun Fiyatları</span>
          </div>
          
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tighter mb-6 uppercase leading-none">
            Planını <span className="text-blue-500">Seç</span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            İhtiyacınıza en uygun paketi seçin, Shopier mağazanızı dakikalar içinde profesyonel bir vitrine dönüştürün.
          </p>
          
          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors ${!isAnnual ? 'text-white' : 'text-gray-600'}`}>AYLIK</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-16 sm:w-20 h-8 sm:h-10 bg-white/5 border border-white/10 rounded-full p-1 transition-all duration-300 hover:border-blue-500/50 group"
            >
              <div className={`w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 ${isAnnual ? 'translate-x-8 sm:translate-x-10' : 'translate-x-0'}`} />
            </button>
            <div className="flex flex-col items-start">
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors ${isAnnual ? 'text-white' : 'text-gray-600'}`}>YILLIK</span>
              <span className="text-[8px] sm:text-[9px] text-green-500 font-black tracking-widest mt-0.5">%85+ TASARRUF</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-20 sm:mb-24">
          {/* Standart Plan */}
          <motion.div
            className={`group relative bg-white/[0.02] border border-white/10 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 backdrop-blur-md hover:bg-white/[0.04] transition-all duration-500 overflow-hidden ${isAnnual ? 'opacity-40 grayscale hover:grayscale-0' : ''}`}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative z-10">
              <div className="mb-6 sm:mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight mb-1">Standart</h3>
                  <p className="text-gray-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Temel İhtiyaçlar</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-500">
                  <Crown size={20} />
                </div>
              </div>
              
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center gap-3 mb-1">
                   <span className="text-gray-600 text-lg line-through font-bold">₺599</span>
                   <span className="text-green-500 text-[10px] font-black uppercase border border-green-500/20 px-2 py-0.5 rounded-full">%50 İNDİRİM</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-6xl font-black italic tracking-tighter">₺299</span>
                  <span className="text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-widest">/AY</span>
                </div>
              </div>

              <ul className="space-y-2.5 sm:space-y-3 mb-8 sm:mb-10">
                {[
                  '1 Adet Vitrin Sitesi',
                  'Shopier Ürün Senkronizasyonu',
                  'Noir Fashion Modern Tema',
                  'Mobil & Tablet Uyumlu',
                  'Temel Analitik Raporu',
                  'Ücretsiz SSL Sertifikası',
                  'Sınırsız Ürün Listeleme',
                  '%0 Nova Satış Komisyonu'
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[10px] sm:text-xs font-bold text-gray-400">
                    <Check size={12} className="text-blue-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => pickPlan('STANDART')}
                disabled={busyPlan === 'STANDART' || isAnnual}
                className="w-full py-4 sm:py-5 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-white/10 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {busyPlan === 'STANDART' ? 'İşleniyor…' : isAnnual ? 'Sadece Aylık Seçilebilir' : 'Hemen Başla'}
              </button>
            </div>
          </motion.div>

          {/* Profesyonel Plan */}
          <motion.div
            className="group relative bg-blue-500/5 border-2 border-blue-500/30 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 backdrop-blur-md hover:bg-blue-500/10 transition-all duration-500 overflow-hidden"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Recommended Badge */}
            <div className="absolute top-4 sm:top-6 right-6 sm:right-8 px-3 sm:px-4 py-1.5 bg-blue-500 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] z-20">
              Önerilen Paket
            </div>

            <div className="relative z-10">
              <div className="mb-6 sm:mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight mb-1 text-blue-500">Profesyonel</h3>
                  <p className="text-blue-500/60 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Sınırsız Büyüme</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                  <Diamond size={20} />
                </div>
              </div>
              
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center gap-3 mb-1">
                   <span className="text-blue-500/40 text-lg line-through font-bold">₺1199</span>
                   <span className="text-green-500 text-[10px] font-black uppercase border border-green-500/20 px-2 py-0.5 rounded-full">%65+ İNDİRİM</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-6xl font-black italic tracking-tighter text-white">₺399</span>
                  <span className="text-blue-500/50 text-[10px] sm:text-xs font-black uppercase tracking-widest">/YIL</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 sm:px-3 py-1 bg-green-500/10 text-green-500 text-[8px] sm:text-[10px] font-black rounded-full uppercase tracking-widest border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    KAMPANYALI YILLIK FİYAT
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 sm:space-y-3 mb-8 sm:mb-10">
                {[
                  '10 Adet Aktif Vitrin Sitesi',
                  'Özel Alan Adı (Domain) Bağlama',
                  'Tüm Mevcut & Gelecek Temalar',
                  'Reklamsız Deneyim (Branding Yok)',
                  'Gelişmiş Tasarım & CSS Desteği',
                  '7/24 VIP & Öncelikli Canlı Destek',
                  'Gelişmiş Ziyaretçi Analitiği',
                  'Yüksek Trafik & Kararlı Altyapı'
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[10px] sm:text-xs font-bold text-white/90">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                      <Check size={8} className="text-white" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => pickPlan('PROFESYONEL')}
                disabled={busyPlan === 'PROFESYONEL' || !isAnnual}
                className="w-full py-4 sm:py-5 bg-blue-500 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-blue-500/50 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {busyPlan === 'PROFESYONEL' ? 'İşleniyor…' : !isAnnual ? 'Sadece Yıllık Seçilebilir' : 'PRO OL VE KAZANMAYA BAŞLA'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Status Indicators for Logged-in Users */}
        {hasToken && !capsLoading && capabilities?.tier && (
          <motion.div 
            className="max-w-xl mx-auto mb-16 p-5 sm:p-6 bg-white/[0.02] border border-white/10 rounded-2xl sm:rounded-3xl text-center backdrop-blur-md"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <div className="flex items-center justify-center gap-3 mb-2 text-green-500">
              <ShieldCheck size={18} />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Mevcut Planınız: {normalizeTier(capabilities?.tier).toUpperCase()}</span>
            </div>
            <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              Siz zaten profesyonel dünyanın bir parçasısınız. Keyfini çıkarın!
            </p>
          </motion.div>
        )}

        {/* Comparison Table */}
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-3xl font-black italic uppercase tracking-tight leading-none mb-4">Kapsamlı Karşılaştırma</h3>
            <p className="text-gray-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Neden Profesyonel Seçmelisiniz?</p>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="p-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">ÖZELLİK</th>
                    <th className="p-6 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">STANDART</th>
                    <th className="p-6 text-center text-[10px] font-black text-blue-500 uppercase tracking-widest">PROFESYONEL</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((f, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6 text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{f.name}</td>
                      <td className="p-6 text-center">
                        {typeof f.standart === 'boolean' ? (
                          f.standart ? <Check size={18} className="text-blue-500 mx-auto" /> : <div className="w-4 h-[2px] bg-white/10 mx-auto" />
                        ) : (
                          <span className="text-[10px] font-black text-gray-500 uppercase">{f.standart}</span>
                        )}
                      </td>
                      <td className="p-6 text-center">
                        {typeof f.profesyonel === 'boolean' ? (
                          f.profesyonel ? <Check size={18} className="text-blue-500 mx-auto shadow-[0_0_10px_rgba(59,130,246,0.3)]" /> : <div className="w-4 h-[2px] bg-white/10 mx-auto" />
                        ) : (
                          <span className="text-[10px] font-black text-blue-500 uppercase">{f.profesyonel}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Comparison List - REFACTORED FOR BETTER UX */}
            <div className="md:hidden divide-y divide-white/5">
               {comparisonFeatures.map((f, idx) => (
                  <div key={idx} className="p-5 flex items-center justify-between gap-4">
                     <div className="flex-1">
                        <div className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-1">{f.name}</div>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-1.5">
                              <span className="text-[7px] font-black text-gray-600 uppercase">STD:</span>
                              {typeof f.standart === 'boolean' ? (
                                 f.standart ? <Check size={10} className="text-gray-500" /> : <span className="text-[8px] text-gray-700">—</span>
                              ) : (
                                 <span className="text-[8px] font-black text-gray-500 uppercase">{f.standart}</span>
                              )}
                           </div>
                        </div>
                     </div>
                     <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2 text-center min-w-[100px]">
                        <p className="text-[7px] font-black text-blue-500 uppercase mb-1">PRO BEREKETİ</p>
                        {typeof f.profesyonel === 'boolean' ? (
                           f.profesyonel ? <Check size={14} className="text-blue-500 mx-auto" /> : <div className="w-3 h-[2px] bg-white/10 mx-auto" />
                        ) : (
                           <span className="text-[9px] font-black text-blue-400 uppercase">{f.profesyonel}</span>
                        )}
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </motion.div>

        {/* Trust Badges - OPTIMIZED FOR MOBILE */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
          {[
            { icon: ShieldCheck, title: 'Güvenli Ödeme', desc: 'Dodo Payments altyapısı ile PCI-DSS uyumlu %100 güvenli ödeme.' },
            { icon: Zap, title: 'Anında Aktivasyon', desc: 'Ödeme sonrası paketiniz saniyeler içinde hesabınıza tanımlanır.' },
            { icon: Headphones, title: 'Uzman Destek', desc: 'Kurulum veya tasarımda yardıma mı ihtiyacınız var? Buradayız.' }
          ].map((item, idx) => (
            <motion.div 
              key={idx} 
              className="flex md:flex-col items-center gap-4 md:gap-0 text-left md:text-center p-5 sm:p-8 bg-white/[0.01] border border-white/5 rounded-2xl sm:rounded-[2rem] hover:bg-white/[0.03] transition-all group"
              whileHover={{ y: -5 }}
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/5 rounded-lg sm:rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shrink-0 md:mx-auto md:mb-6">
                <item.icon size={20} />
              </div>
              <div>
                <h4 className="font-black italic uppercase tracking-tight mb-1 md:mb-3 text-[11px] sm:text-sm">{item.title}</h4>
                <p className="text-gray-500 text-[9px] leading-snug sm:leading-relaxed font-medium uppercase tracking-wider">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumPricing;
