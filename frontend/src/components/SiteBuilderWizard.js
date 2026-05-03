import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Globe, Loader2, Rocket, Store, Sparkles, ShieldCheck, Zap, Download, Chrome, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthSession from '../hooks/useAuthSession';
import { getAuthHeaders } from '../utils/authStorage';
import { getApiBase } from '../utils/apiBase';
import { apiFetch } from '../utils/api';

const API_BASE = getApiBase();

export default function SiteBuilderWizard() {
  const navigate = useNavigate();
  const { token, ready } = useAuthSession();

  const [step, setStep] = useState(1);
  const [shopierLink, setShopierLink] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [createdSite, setCreatedSite] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (!token) navigate('/auth');
  }, [navigate, ready, token]);

  const siteUrl = useMemo(() => {
    const sd = (createdSite?.subdomain || '').toString().trim();
    return sd ? `https://${encodeURIComponent(sd)}.odelink.shop` : '';
  }, [createdSite]);

  // SİTEYİ OLUŞTUR (Monster Engine V2 ile)
  const handleQuickSync = async () => {
    if (!shopierLink) return;
    setCreating(true);
    setError('');

    try {
      const slug = shopierLink.replace(/\/+$/, '').split('/').pop();
      const res = await apiFetch(`${API_BASE}/api/sites`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          name: slug,
          shopierUrl: shopierLink.includes('http') ? shopierLink : `https://www.shopier.com/${slug}`,
          settings: { shopier_user: slug }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Başarısız oldu.');

      setCreatedSite(data.site);
      setStep(3);
    } catch (e) {
      setError('⚠️ Shopier engeline takıldık! Ama üzülme, Odelink Connector eklentisiyle bu engeli hemen aşabilirsin.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2EBE1] font-sans selection:bg-[#C5A059]/30 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#C5A059]/10 blur-[120px] rounded-full" />
      </div>

      <header className="fixed top-0 inset-x-0 z-50 bg-black/40 backdrop-blur-md border-b border-[#C5A059]/10">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#C5A059] flex items-center justify-center shadow-2xl shadow-[#C5A059]/20 rounded-lg">
               <Store className="w-5 h-5 text-[#0A0A0A]" />
             </div>
             <h1 className="text-xl font-black tracking-tighter text-[#F2EBE1]">ODELINK <span className="text-[#C5A059] font-serif font-normal italic">Studio</span></h1>
          </div>
          <button onClick={() => navigate('/panel')} className="text-[10px] uppercase tracking-widest font-bold text-[#F2EBE1]/40 hover:text-[#C5A059] transition-all">PANELE DÖN</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 pt-40 pb-20 relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-serif leading-tight">Nasıl Başlamak İstersin?</h2>
                <p className="text-[#C5A059] uppercase tracking-[0.4em] text-[10px] font-bold">Mağazanı Dakikalar İçinde Kur</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* VIP OPTION: EXTENSION */}
                <div className="group bg-gradient-to-br from-[#C5A059]/20 to-[#0A0A0A] border border-[#C5A059]/30 p-10 rounded-3xl relative overflow-hidden transition-all hover:border-[#C5A059] hover:shadow-[0_20px_50px_rgba(197,160,89,0.1)]">
                  <div className="absolute top-4 right-6 text-[10px] font-black text-[#C5A059] tracking-widest bg-[#C5A059]/10 px-3 py-1 rounded-full animate-pulse">ÖNERİLEN</div>
                  <Chrome className="w-12 h-12 text-[#C5A059] mb-8" />
                  <h3 className="text-2xl font-serif mb-4">Odelink Connector</h3>
                  <p className="text-sm text-[#F2EBE1]/50 leading-relaxed mb-8">
                    Uzantıyı kurun, Shopier mağazanıza girin ve tek tıkla ürünlerinizi %100 hızla aktarın. En güvenli ve engelsiz yol budur.
                  </p>
                  <button onClick={() => window.open('/extension-guide', '_blank')} className="w-full py-4 bg-[#C5A059] text-black font-black uppercase text-[11px] tracking-widest rounded-xl hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-2">
                    <Download size={16} /> UZANTIYI EDİNİN
                  </button>
                </div>

                {/* QUICK SYNC: MANUAL LINK */}
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-3xl transition-all hover:border-white/10">
                  <Zap className="w-12 h-12 text-white/40 mb-8" />
                  <h3 className="text-2xl font-serif mb-4">Hızlı Senkronizasyon</h3>
                  <p className="text-sm text-[#F2EBE1]/50 leading-relaxed mb-8">
                    Mağaza linkinizi buraya yapıştırın, biz ürünlerinizi otomatik olarak çekmeye çalışalım.
                  </p>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="shopier.com/magazan"
                      value={shopierLink}
                      onChange={(e) => setShopierLink(e.target.value)}
                      className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm focus:border-[#C5A059] transition-all outline-none"
                    />
                    <button 
                      onClick={handleQuickSync}
                      disabled={!shopierLink || creating}
                      className="w-full py-4 border border-white/10 text-white font-black uppercase text-[11px] tracking-widest rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-20"
                    >
                      {creating ? <Loader2 className="animate-spin" size={16} /> : 'BAŞLAT'}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
                  <ShieldCheck className="text-red-500 shrink-0" size={24} />
                  <div>
                    <p className="text-sm font-bold text-red-200">{error}</p>
                    <button onClick={() => window.open('/extension-guide', '_blank')} className="mt-2 text-[10px] uppercase font-black tracking-widest text-[#C5A059] underline">Eklentiyi Kur ve Engeli Aş</button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-12">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-full flex items-center justify-center mx-auto relative z-10">
                  <CheckCircle2 size={64} className="text-[#C5A059]" />
                </div>
                <div className="absolute inset-0 bg-[#C5A059]/20 blur-3xl animate-pulse rounded-full" />
              </div>

              <div className="space-y-4">
                <h2 className="text-6xl font-serif">Mağazanız Canlıda!</h2>
                <p className="text-[#C5A059] uppercase tracking-[0.5em] text-[12px] font-bold">Odelink Gücüyle Tanışın</p>
              </div>

              <div className="max-w-md mx-auto bg-white/[0.02] border border-white/5 p-12 rounded-[40px] space-y-10">
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-black">Dijital Kimliğiniz</div>
                  <div className="text-2xl font-serif text-[#F2EBE1]">{siteUrl}</div>
                </div>

                <div className="flex flex-col gap-4">
                  <a href={siteUrl} target="_blank" rel="noreferrer" className="w-full py-6 bg-[#C5A059] text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-3">
                    VİTRİNİ GÖR <ExternalLink size={18} />
                  </a>
                  <button onClick={() => navigate('/panel')} className="w-full py-6 border border-white/10 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-white/5 transition-all">
                    KONTROL PANELİNE GİT
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Benefits Footer */}
      <footer className="max-w-4xl mx-auto px-8 pb-20 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-12">
        <div className="flex items-start gap-4">
          <Zap className="text-[#C5A059] shrink-0" size={20} />
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest mb-1">Hızlı Senkron</div>
            <p className="text-[10px] text-white/30 leading-relaxed">Ürünleriniz saniyeler içinde Odelink bulutuna aktarılır.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <ShieldCheck className="text-[#C5A059] shrink-0" size={20} />
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest mb-1">Tam Güvenlik</div>
            <p className="text-[10px] text-white/30 leading-relaxed">Tüm veriler uçtan uca şifreli ve Shopier standartlarında.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <Sparkles className="text-[#C5A059] shrink-0" size={20} />
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest mb-1">Elite Tasarım</div>
            <p className="text-[10px] text-white/30 leading-relaxed">Vitrininiz her cihazda kusursuz ve premium görünür.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
