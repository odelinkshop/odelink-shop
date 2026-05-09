import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Murat Furkan Bayram | Kurumsal Vizyon & Liderlik";
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 sm:pt-40 pb-32 px-6 overflow-hidden relative">
      {/* Background Ambient Effects */}
      <div className="absolute top-0 left-0 w-full h-[1000px] bg-[radial-gradient(circle_at_50%_-20%,#C5A05920_0%,transparent_70%)] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[#E31E2405] blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-24 sm:mb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-6 py-2 rounded-full border border-[#C5A05940] text-[10px] tracking-[0.5em] uppercase mb-10 text-[#C5A059] font-black bg-[#C5A05905] backdrop-blur-sm">
              Kurumsal Liderlik Portfolyosu
            </span>
            <h1 className="text-6xl sm:text-[120px] font-black tracking-tighter leading-[0.85] mb-12 italic">
              MURAT FURKAN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] via-[#F5D089] to-[#C5A059] drop-shadow-[0_0_30px_rgba(197,160,89,0.3)]">BAYRAM</span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-2xl font-light max-w-3xl mx-auto leading-relaxed border-t border-white/5 pt-10">
              Dijital ticaretin geleceğini, 17 yaşında bir vizyoner zihniyetle, 
              <span className="text-white font-medium italic"> her satırda mükemmeliyeti hedefleyerek </span> yeniden tanımlıyoruz.
            </p>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-24">
          
          {/* Left Column - Stats & Identity */}
          <div className="lg:col-span-5 space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 bg-white/[0.02] border border-white/5 rounded-[40px] backdrop-blur-3xl relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#C5A05910] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[40px]"></div>
              <h3 className="text-xs font-black tracking-[0.3em] text-[#C5A059] uppercase mb-12 flex items-center gap-4">
                <span className="w-8 h-px bg-[#C5A059]"></span>
                Temel Kimlik Bilgileri
              </h3>
              
              <div className="space-y-8 relative z-10">
                {[
                  { label: 'Doğum Tarihi', value: '14.02.2009' },
                  { label: 'Lokasyon', value: 'Bahçeşehir, İstanbul' },
                  { label: 'Aslen', value: 'Tokat' },
                  { label: 'Unvan', value: 'Founder & CEO', highlight: true }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{item.label}</span>
                    <span className={`text-lg font-bold ${item.highlight ? 'text-[#C5A059] italic' : 'text-white'}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-16 p-8 bg-black rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H5c-1.25 0-2 .75-2 2v3c0 1.25.75 2 2 2h3c0 4-4 6-4 6m15 5c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-3c-1.25 0-2 .75-2 2v3c0 1.25.75 2 2 2h3c0 4-4 6-4 6"/></svg>
                </div>
                <p className="text-gray-300 text-base leading-relaxed italic relative z-10">
                  "Girişimcilik mevcut olanı kabullenmek değil, olması gerekeni inşa etme cesaretidir. Odelink, bu vizyonun somut bir kanıtıdır."
                </p>
                <div className="mt-6 text-[10px] font-black text-[#C5A059] uppercase tracking-[0.4em]">— M. FURKAN BAYRAM</div>
              </div>
            </motion.div>

            {/* Competency Tags */}
            <div className="grid grid-cols-2 gap-4">
              {['SaaS Architecture', 'UI/UX Mastery', 'Growth Hacking', 'E-commerce Expert'].map((tag, i) => (
                <div key={i} className="py-4 px-6 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-center uppercase tracking-widest text-gray-400">
                  {tag}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Narrative */}
          <div className="lg:col-span-7 space-y-20">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="prose prose-invert max-w-none"
            >
              <h2 className="text-4xl sm:text-6xl font-black text-white mb-10 tracking-tighter leading-none">
                DİJİTAL TİCARETİN <br />
                <span className="text-[#C5A059] italic">GENÇ LİDERİ</span>
              </h2>
              
              <p className="text-gray-400 text-xl leading-relaxed font-light mb-12">
                Murat Furkan Bayram, 14 Şubat 2009 tarihinde İstanbul'da dünyaya gelmiş, Türkiye'nin teknoloji odaklı girişimcilik ekosisteminin en genç ve vizyoner temsilcilerinden biridir. Aslen Tokatlı olan Bayram, bugün İstanbul Bahçeşehir'deki merkezinden küresel ölçekte projeler geliştirmekte ve dijital ekonominin dinamiklerini yeniden tanımlamaktadır.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 my-20">
                <div className="p-8 border-l-2 border-[#C5A059] bg-gradient-to-r from-[#C5A05905] to-transparent">
                  <h4 className="text-white font-bold mb-4 uppercase tracking-tighter text-lg">Erken Başarılar</h4>
                  <p className="text-gray-500 text-sm leading-relaxed font-light">
                    15 yaşında başladığı e-ticaret yolculuğunda, dropshipping ve dijital pazarlamada sektörel standartları altüst eden başarılar elde etti.
                  </p>
                </div>
                <div className="p-8 border-l-2 border-[#E31E24] bg-gradient-to-r from-[#E31E2405] to-transparent">
                  <h4 className="text-white font-bold mb-4 uppercase tracking-tighter text-lg">Odelink Devrimi</h4>
                  <p className="text-gray-500 text-sm leading-relaxed font-light">
                    Shopier altyapısını lüks segment vitrinlerle birleştiren Türkiye'nin en prestijli SaaS platformunu kurarak CEO koltuğuna oturdu.
                  </p>
                </div>
              </div>

              <p className="text-white text-2xl font-light leading-snug italic mb-12 border-l-4 border-[#C5A059] pl-10">
                "Başarı, yaşla değil; ortaya konan vizyonun derinliği ve sarsılmaz bir disiplinle ölçülür. Biz sadece kod yazmıyoruz, dijital imparatorluklar kuruyoruz."
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mt-24">
                <div className="text-center sm:text-left group">
                  <h4 className="text-6xl font-black text-white mb-2 tracking-tighter group-hover:text-[#C5A059] transition-colors">03+</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black">YILLIK DENEYİM</p>
                </div>
                <div className="text-center sm:text-left group">
                  <h4 className="text-6xl font-black text-white mb-2 tracking-tighter group-hover:text-[#C5A059] transition-colors">7/24</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black">İNOVASYON</p>
                </div>
                <div className="text-center sm:text-left group">
                  <h4 className="text-6xl font-black text-white mb-2 tracking-tighter group-hover:text-[#C5A059] transition-colors">ELITE</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black">STANDARTLAR</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer Vision */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-40 pt-20 border-t border-white/5 text-center"
        >
          <p className="text-gray-500 font-light text-2xl sm:text-4xl mb-12 italic max-w-4xl mx-auto leading-relaxed">
            "Yerel potansiyeli küresel pazarlara taşıyan en güçlü 
            <span className="text-white font-medium"> teknoloji köprüsü. </span>"
          </p>
          <div className="flex items-center justify-center space-x-8">
            <div className="w-20 h-px bg-gradient-to-r from-transparent to-[#C5A059]"></div>
            <span className="text-[11px] font-black tracking-[0.6em] uppercase text-[#C5A059]">M. FURKAN BAYRAM EXECUTIVE</span>
            <div className="w-20 h-px bg-gradient-to-l from-transparent to-[#C5A059]"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
