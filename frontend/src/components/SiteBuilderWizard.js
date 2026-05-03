import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Globe, Store, Zap, Download, Chrome, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthSession from '../hooks/useAuthSession';

// 💡 GOOGLE WEB STORE LINKINI BURADAN DEGISTIREBILIRSIN KRAL
const EXTENSION_URL = 'https://chrome.google.com/webstore/detail/odelink-connector/placeholder-id';

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

      <main className="max-w-2xl mx-auto px-6 pt-32 pb-20 relative text-center">
        <div className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-3xl font-serif leading-tight">Elite Aktarım</h2>
            <p className="text-[#C5A059] uppercase tracking-[0.4em] text-[9px] font-black">Hızlı Ve Güvenli Mağaza Kurulumu</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111] border border-[#C5A059]/20 p-6 rounded-3xl relative shadow-2xl text-left"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 bg-[#C5A059] rounded-xl flex items-center justify-center shadow-lg">
                <Chrome className="w-8 h-8 text-black" />
              </div>
              
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-serif text-[#C5A059]">Odelink Connector</h3>
                <p className="text-[10px] text-[#F2EBE1]/50 leading-relaxed max-w-sm mx-auto">
                  Shopier engellerini bypass eden tek teknoloji. Manuel kurulum ile anında başlayın.
                </p>
              </div>

              {/* DOWNLOAD BUTTON */}
              <a 
                href="/odelink-connector-PRO.zip" 
                download 
                className="w-full py-4 bg-[#C5A059] text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-2 no-underline"
              >
                <Download size={14} /> GÜVENLİ PAKETİ İNDİR (.ZIP)
              </a>
              
              {/* MANUAL STEPS GUIDE */}
              <div className="w-full border-t border-white/5 pt-6 space-y-4">
                <div className="text-[9px] font-black text-[#C5A059] uppercase tracking-[0.3em] mb-2">3 Adımda Hızlı Kurulum</div>
                
                {[
                  { step: '1', text: 'İndirdiğiniz dosyayı klasöre çıkartın.' },
                  { step: '2', text: 'Chrome\'da chrome://extensions sayfasını açın.' },
                  { step: '3', text: '"Geliştirici Modu"nu açıp klasörü içine sürükleyin.' }
                ].map((s, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-5 h-5 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded flex items-center justify-center text-[10px] font-bold text-[#C5A059] shrink-0">{s.step}</div>
                    <p className="text-[10px] text-white/40 leading-tight">{s.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/10 uppercase tracking-widest"><ShieldCheck size={12} className="text-[#C5A059]" /> Ücretsiz</div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/10 uppercase tracking-widest"><Zap size={12} className="text-[#C5A059]" /> Sınırsız</div>
              </div>
            </div>
          </motion.div>

          <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl">
             <p className="text-[10px] text-white/20 leading-relaxed italic">
               Eklenti kurulduktan sonra Shopier mağazanızda "Odelink'e Aktar" butonu belirecektir.
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
