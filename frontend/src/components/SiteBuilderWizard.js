import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Globe, Store, Zap, Download, Chrome, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthSession from '../hooks/useAuthSession';

export default function SiteBuilderWizard() {
  const navigate = useNavigate();
  const { token, ready } = useAuthSession();
  const [createdSite, setCreatedSite] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (!token) navigate('/auth');
  }, [navigate, ready, token]);

  const siteUrl = useMemo(() => {
    const sd = (createdSite?.subdomain || '').toString().trim();
    return sd ? `https://${encodeURIComponent(sd)}.odelink.shop` : '';
  }, [createdSite]);

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
        <div className="text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-6xl font-serif leading-tight">Elite Aktarım Başlatılıyor</h2>
            <p className="text-[#C5A059] uppercase tracking-[0.6em] text-[12px] font-black">En Güvenli Ve En Hızlı Yol</p>
          </div>

          {/* SINGLE VIP OPTION: EXTENSION */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-gradient-to-br from-[#111] to-[#050505] border border-[#C5A059]/30 p-12 rounded-[40px] relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
          >
            <div className="absolute top-8 right-10 text-[10px] font-black text-[#C5A059] tracking-[0.3em] bg-[#C5A059]/10 px-4 py-2 rounded-full border border-[#C5A059]/20">TEK ÇÖZÜM</div>
            
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="w-20 h-20 bg-[#C5A059] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(197,160,89,0.3)]">
                <Chrome className="w-10 h-10 text-black" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-serif text-[#C5A059]">Odelink Connector</h3>
                <p className="text-base text-[#F2EBE1]/60 leading-relaxed max-w-md mx-auto">
                  Shopier engellerini %100 bypass eden tek teknoloji. Eklentiyi kurun ve mağazanızı anında senkronize edin.
                </p>
              </div>

              <div className="w-full pt-4 space-y-4">
                <button 
                  onClick={() => navigate('/extension-guide')} 
                  className="w-full py-6 bg-[#C5A059] text-black font-black uppercase text-[12px] tracking-[0.3em] rounded-2xl hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(0,0,0,0.3)]"
                >
                  <Download size={18} /> EKLENTİYİ KUR VE BAŞLA
                </button>
                <div className="flex justify-center gap-6 pt-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest"><ShieldCheck size={14} className="text-[#C5A059]" /> Bot Engeli Yok</div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest"><Zap size={14} className="text-[#C5A059]" /> Işık Hızında</div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest"><Sparkles size={14} className="text-[#C5A059]" /> Otomatik</div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="max-w-xl mx-auto p-8 border border-white/5 bg-white/[0.01] rounded-3xl">
             <p className="text-[11px] text-white/30 leading-relaxed italic">
               * Odelink Connector, tarayıcınızda çalışan güvenli bir köprüdür. Shopier panelinize erişerek ürünlerinizi Odelink vitrininize tek tıkla taşımanızı sağlar. Manuel kurulum zahmetini ortadan kaldırır.
             </p>
          </div>
        </div>
      </main>

      {/* Benefits Footer */}
      <footer className="max-w-4xl mx-auto px-8 pb-20 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-12 opacity-50">
        <div className="flex items-start gap-4">
          <Zap className="text-[#C5A059] shrink-0" size={20} />
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest mb-1">Elite Sync</div>
            <p className="text-[10px] text-white/30 leading-relaxed">Ürünleriniz saniyeler içinde Odelink bulutuna aktarılır.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <ShieldCheck className="text-[#C5A059] shrink-0" size={20} />
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest mb-1">Uçtan Uca</div>
            <p className="text-[10px] text-white/30 leading-relaxed">Tüm verileriniz Shopier standartlarında güvenle taşınır.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <Sparkles className="text-[#C5A059] shrink-0" size={20} />
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest mb-1">Mükemmel Görünüm</div>
            <p className="text-[10px] text-white/30 leading-relaxed">Vitrininiz her cihazda kusursuz ve premium görünür.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
