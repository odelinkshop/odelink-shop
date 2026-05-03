import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Globe, Loader2, Rocket, Settings, Store, Sparkles, ShieldCheck, Zap, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthSession from '../hooks/useAuthSession';
import { getAuthHeaders } from '../utils/authStorage';
import { getApiBase } from '../utils/apiBase';
import { apiFetch } from '../utils/api';

const API_BASE = getApiBase();

const STEPS = [
  { id: 1, title: 'Mağaza Linki', subtitle: 'Shopier mağaza linkinizi yapıştırın', icon: LinkIcon },
  { id: 2, title: 'Mağaza Adı', subtitle: 'Vitrininize bir isim verin', icon: Settings },
  { id: 3, title: 'Hazır', subtitle: 'Vitrininiz yayında', icon: CheckCircle2 }
];

// Shopier mağaza linkinden kullanıcı adını (slug) çıkarır.
// Örnek: "https://www.shopier.com/glossgiyim" -> "glossgiyim"
// Örnek: "shopier.com/glossgiyim/" -> "glossgiyim"
// Örnek: "glossgiyim" -> "glossgiyim"
const extractShopSlugFromUrl = (raw) => {
  const input = (raw || '').toString().trim();
  if (!input) return '';
  try {
    const candidate = input.match(/^https?:\/\//i) ? input : `https://${input.replace(/^\/+/, '')}`;
    const u = new URL(candidate);
    const parts = u.pathname.split('/').filter(Boolean);
    return (parts[0] || '').trim();
  } catch (e) {
    // URL parse edilemezse son "/"-den sonrasını al
    return input.replace(/\/+$/, '').split('/').pop() || '';
  }
};

const isValidShopierLink = (raw) => {
  const slug = extractShopSlugFromUrl(raw);
  if (!slug) return false;
  // Slug yalnızca harf/rakam/tire/alt tire olabilir — Shopier kullanıcı adları
  return /^[a-zA-Z0-9_-]{2,60}$/.test(slug);
};

export default function SiteBuilderWizard() {
  const navigate = useNavigate();
  const { token, ready } = useAuthSession();

  const [step, setStep] = useState(1);
  const [shopierLink, setShopierLink] = useState('');
  const [storeName, setStoreName] = useState('');
  const [creating, setCreating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [createdSite, setCreatedSite] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (!token) navigate('/auth');
  }, [navigate, ready, token]);

  const siteUrl = useMemo(() => {
    const sd = (createdSite?.subdomain || '').toString().trim();
    if (!sd) return '';
    return `https://${encodeURIComponent(sd)}.odelink.shop`;
  }, [createdSite]);

  const shopSlug = useMemo(() => extractShopSlugFromUrl(shopierLink), [shopierLink]);
  const normalizedShopierUrl = useMemo(() => (shopSlug ? `https://www.shopier.com/${shopSlug}` : ''), [shopSlug]);

  const goNextFromLink = () => {
    setError('');
    if (!isValidShopierLink(shopierLink)) {
      setError('Geçerli bir Shopier mağaza linki girin. Örn: https://www.shopier.com/glossgiyim');
      return;
    }
    // Varsayılan mağaza adını slug olarak ayarla
    if (!storeName) {
      setStoreName(shopSlug);
    }
    setStep(2);
  };

  const createSite = async () => {
    setCreating(true);
    setError('');
    setWarnings([]);
    setLoadingMessage('Mağaza linkiniz doğrulanıyor...');

    let timers = [];
    try {
      if (!normalizedShopierUrl || !shopSlug) {
        throw new Error('Geçerli bir Shopier mağaza linki gereklidir.');
      }

      const storeName = shopSlug;

      // Aşamalı loading mesajları (createSite bittiğinde temizlenir)
      timers.push(setTimeout(() => setLoadingMessage('Ürünleriniz Shopier mağazanızdan çekiliyor...'), 1500));
      timers.push(setTimeout(() => setLoadingMessage('Görseller ve fiyatlar hazırlanıyor...'), 5000));
      timers.push(setTimeout(() => setLoadingMessage('Vitrininiz kuruluyor, neredeyse bitti...'), 12000));

      const payload = {
        name: storeName || shopSlug,
        shopierUrl: normalizedShopierUrl,
        settings: {
          shopier_user: shopSlug
        }
      };

      const res = await apiFetch(`${API_BASE}/api/sites`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const debugInfo = data?.debug ? ` (Kod: ${data.debug.status || '?'}, Hata: ${data.debug.error || 'N/A'})` : '';
        throw new Error(
          (data?.message || data?.error || 'Mağaza oluşturulurken bir hata oluştu.') + debugInfo
        );
      }

      // KESIN KURAL: Ürün yoksa site oluşmasın — backend 422 dönüyor, yukarıda yakalanır.
      // Yine de güvenlik için ekstra kontrol:
      const loaded = Number(data?.site?.productsLoaded || 0);
      if (loaded <= 0) {
        throw new Error('Mağazanızdan ürün çekilemedi. Lütfen Shopier mağaza linkinizin doğru ve herkese açık olduğundan emin olun.');
      }

      setCreatedSite(data?.site);
      setWarnings(Array.isArray(data?.warnings) ? data.warnings : []);
      setStep(3);

    } catch (e) {
      console.error('Create site error:', e);
      let errorMsg = e.message || 'Beklenmeyen bir hata oluştu.';
      if (typeof errorMsg === 'object') {
        errorMsg = JSON.stringify(errorMsg);
      }
      setError(errorMsg.toString());
    } finally {
      timers.forEach((t) => clearTimeout(t));
      setCreating(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2EBE1] font-sans selection:bg-[#C5A059]/30 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#C5A059]/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-[#C5A059]/5 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-black/40 backdrop-blur-md border-b border-[#C5A059]/10">
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-[#C5A059] flex items-center justify-center shadow-2xl shadow-[#C5A059]/20">
               <Store className="w-6 h-6 text-[#0A0A0A]" />
             </div>
             <div>
               <h1 className="text-2xl font-serif tracking-tight text-[#F2EBE1]">ODELINK</h1>
               <p className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-bold">Studio Builder</p>
             </div>
          </div>
          <button 
            onClick={() => navigate('/panel')}
            className="group flex items-center gap-3 text-[11px] uppercase tracking-widest font-bold text-[#F2EBE1]/60 hover:text-[#C5A059] transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            PANELE DÖN
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 pt-44 pb-32 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 items-start">
          
          <div className="space-y-12">
            {/* Step Indicators */}
            <div className="flex items-center gap-4">
              {STEPS.map((s) => (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 flex items-center justify-center border text-xs font-bold transition-all duration-500 ${
                      step === s.id ? 'bg-[#C5A059] border-[#C5A059] text-[#0A0A0A]' : 
                      step > s.id ? 'border-[#C5A059] text-[#C5A059]' : 'border-[#F2EBE1]/10 text-[#F2EBE1]/30'
                    }`}>
                      {step > s.id ? <CheckCircle2 size={16} /> : s.id}
                    </div>
                    <div className="hidden sm:block">
                      <div className={`text-[10px] uppercase tracking-widest font-bold ${step === s.id ? 'text-[#F2EBE1]' : 'text-[#F2EBE1]/30'}`}>{s.title}</div>
                    </div>
                  </div>
                  {s.id < 3 && <div className="w-12 h-[1px] bg-[#C5A059]/20" />}
                </React.Fragment>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/[0.02] border border-[#C5A059]/10 p-12 relative overflow-hidden"
              >
                {/* Step Header */}
                <div className="mb-12">
                   <h2 className="text-4xl font-serif text-[#F2EBE1] mb-2">{STEPS[step-1].title}</h2>
                   <p className="text-xs uppercase tracking-widest text-[#C5A059] font-bold opacity-60">{STEPS[step-1].subtitle}</p>
                </div>

                {error && (
                  <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-[11px] uppercase tracking-widest font-bold">
                    {error}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">Shopier Mağaza Linki</label>
                      <div className="relative group">
                        <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C5A059]/40 group-focus-within:text-[#C5A059] transition-colors" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="https://www.shopier.com/glossgiyim"
                          value={shopierLink}
                          onChange={(e) => setShopierLink(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') goNextFromLink(); }}
                          className="w-full bg-[#0A0A0A] border border-[#C5A059]/10 py-6 pl-16 pr-8 text-[#F2EBE1] placeholder:text-[#F2EBE1]/10 focus:outline-none focus:border-[#C5A059] transition-all font-serif text-lg"
                        />
                      </div>
                      {shopSlug && (
                        <div className="text-[10px] uppercase tracking-widest text-[#C5A059]/70 font-bold">
                          Tespit edilen mağaza: <span className="text-[#F2EBE1]">{shopSlug}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#C5A059]/5 border border-[#C5A059]/10 p-6 flex items-start gap-4">
                       <Zap className="text-[#C5A059] shrink-0" size={20} />
                       <p className="text-[11px] text-[#F2EBE1]/50 leading-relaxed italic">
                         Shopier mağazanızın linkini yapıştırmanız yeterli. Sonraki adımda butona basın, ürünlerinizin tamamı otomatik olarak çekilecektir. API anahtarı veya mağaza ismi gerekmez.
                       </p>
                    </div>

                    <button
                      onClick={goNextFromLink}
                      disabled={!isValidShopierLink(shopierLink)}
                      className="w-full py-6 bg-[#C5A059] text-[#0A0A0A] font-bold uppercase tracking-[0.3em] text-xs hover:bg-[#F2EBE1] transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                    >
                      DEVAM ET <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">Mağaza Adı (Vitrininiz)</label>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Örn: My Luxury Shop"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#C5A059]/10 py-6 px-8 text-[#F2EBE1] placeholder:text-[#F2EBE1]/10 focus:outline-none focus:border-[#C5A059] transition-all font-serif text-lg"
                      />
                      <p className="text-[10px] text-[#F2EBE1]/40 italic leading-relaxed">
                        Bu isim vitrininizin en üstünde görünecek olan isimdir. İstediğiniz zaman panelden değiştirebilirsiniz.
                      </p>
                    </div>

                    <div className="p-6 border border-[#C5A059]/10 bg-black/40 flex items-start gap-4">
                      <Sparkles className="text-[#C5A059] shrink-0" size={20} />
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#C5A059] mb-1">Otomatik İçerik Aktarımı</div>
                        <p className="text-[11px] text-[#F2EBE1]/60 leading-relaxed">
                          "{shopSlug}" mağazanızdaki tüm ürünler, görseller ve fiyatlar otomatik olarak aktarılacaktır.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-[1fr_2fr] gap-4">
                      <button
                        onClick={() => setStep(1)}
                        disabled={creating}
                        className="py-5 border border-[#C5A059]/20 text-[#C5A059] font-bold uppercase tracking-widest text-[10px] hover:bg-[#C5A059]/5 transition-all disabled:opacity-30"
                      >
                        GERİ
                      </button>
                      <button
                        onClick={createSite}
                        disabled={creating || !storeName.trim()}
                        className="py-5 bg-[#C5A059] text-[#0A0A0A] font-bold uppercase tracking-[0.3em] text-xs hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {creating ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
                        {creating ? 'OLUŞTURULUYOR...' : 'SİTEYİ OLUŞTUR'}
                      </button>
                    </div>

                    {creating && loadingMessage && (
                      <div className="mt-4 p-4 border border-[#C5A059]/20 bg-[#C5A059]/5 text-[11px] text-[#F2EBE1]/70 italic flex items-center gap-3">
                        <Loader2 size={14} className="animate-spin text-[#C5A059]" />
                        {loadingMessage}
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="text-center space-y-10 py-8">
                     <div className="relative inline-block">
                        <div className="w-24 h-24 bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center mx-auto relative z-10">
                          <CheckCircle2 size={48} className="text-[#C5A059]" />
                        </div>
                        <div className="absolute inset-0 bg-[#C5A059]/20 blur-2xl animate-pulse" />
                     </div>

                     <div className="space-y-3">
                        <h2 className="text-5xl font-serif text-[#F2EBE1]">Mağazanız Hazır</h2>
                        <p className="text-[10px] uppercase tracking-[0.5em] text-[#C5A059] font-bold">Yeni Bir Devir Başlıyor</p>
                        {typeof createdSite?.productsLoaded === 'number' && (
                          <p className="text-[11px] text-[#F2EBE1]/50 mt-3">
                            {createdSite.productsLoaded > 0
                              ? `${createdSite.productsLoaded} ürün yüklendi${createdSite.productSource === 'api' ? ' (API)' : createdSite.productSource === 'scrape' ? ' (mağaza linki)' : ''}.`
                              : 'Henüz ürün çekilemedi — panelden "Senkronize Et" ile tekrar deneyebilirsiniz.'}
                          </p>
                        )}
                     </div>

                     {warnings.length > 0 && (
                       <div className="max-w-md mx-auto p-4 border border-[#C5A059]/30 bg-[#C5A059]/5 text-left">
                         <div className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold mb-2">Bilgilendirme</div>
                         <ul className="space-y-1 text-[11px] text-[#F2EBE1]/60 leading-relaxed list-disc list-inside">
                           {warnings.map((w, i) => (
                             <li key={i}>{w}</li>
                           ))}
                         </ul>
                       </div>
                     )}

                     <div className="p-10 border border-[#C5A059]/10 bg-white/[0.01] space-y-8 max-w-md mx-auto">
                        <div className="space-y-2">
                          <div className="text-[9px] uppercase tracking-widest text-[#C5A059] font-black opacity-40">Dijital Adresiniz</div>
                          <div className="text-xl font-serif text-[#F2EBE1] break-all">{siteUrl}</div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <a 
                            href={siteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-5 bg-[#C5A059] text-[#0A0A0A] font-bold uppercase tracking-widest text-[10px] hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-3"
                          >
                            MAĞAZAYI GÖR <Globe size={16} />
                          </a>
                          <button
                            onClick={() => navigate('/panel')}
                            className="w-full py-5 border border-[#C5A059]/20 text-[#C5A059] font-bold uppercase tracking-widest text-[10px] hover:bg-[#C5A059]/5 transition-all"
                          >
                            PANELE DÖN
                          </button>
                        </div>
                     </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar Features */}
          <aside className="space-y-6">
            <div className="bg-[#C5A059]/5 border border-[#C5A059]/10 p-10 space-y-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A059] border-b border-[#C5A059]/10 pb-6">Aristokratik Avantajlar</h3>
              
              <div className="space-y-8">
                <div className="flex gap-5">
                   <Zap size={20} className="text-[#C5A059] shrink-0" />
                   <div>
                     <div className="text-[11px] font-bold uppercase tracking-widest mb-1">Ultra Hızlı</div>
                     <p className="text-[10px] text-[#F2EBE1]/40 leading-relaxed">Turbopack teknolojisiyle ürünleriniz saniyeler içinde yüklenir.</p>
                   </div>
                </div>
                <div className="flex gap-5">
                   <ShieldCheck size={20} className="text-[#C5A059] shrink-0" />
                   <div>
                     <div className="text-[11px] font-bold uppercase tracking-widest mb-1">Güvenli Altyapı</div>
                     <p className="text-[10px] text-[#F2EBE1]/40 leading-relaxed">Shopier güvencesiyle pürüzsüz ve güvenli ödeme deneyimi.</p>
                   </div>
                </div>
                <div className="flex gap-5">
                   <Sparkles size={20} className="text-[#C5A059] shrink-0" />
                   <div>
                     <div className="text-[11px] font-bold uppercase tracking-widest mb-1">Elite Tasarım</div>
                     <p className="text-[10px] text-[#F2EBE1]/40 leading-relaxed">Modanın kalbi Milano ve Paris'ten ilham alan görsel estetik.</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-8 text-center bg-black/40 border border-white/5 italic text-[11px] text-[#F2EBE1]/30">
              "Zarafet sadece görünür olmak değil, akılda kalmaktır."
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
