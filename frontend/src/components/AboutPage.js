import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Ödelink | Institutional Technology Framework";
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#C5A059] selection:text-black">
      {/* MINIMALIST HEADER SECTION */}
      <section className="pt-40 pb-20 px-6 sm:px-12 max-w-screen-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-[1px] bg-white/20" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Technical Infrastructure</span>
          </div>
          <h1 className="text-7xl sm:text-[120px] md:text-[160px] font-bold leading-[0.85] tracking-[-0.05em]">
            ÖDELINK <br />
            <span className="text-white/20">SYSTEMS.</span>
          </h1>
        </motion.div>
      </section>

      {/* CORE IDENTITY - NO NONSENSE */}
      <section className="py-32 px-6 sm:px-12 border-t border-white/5 bg-[#050505]">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-12">
            <h2 className="text-4xl font-medium tracking-tight leading-tight">
              Shopier altyapısını <br />
              üst düzey bir vitrin katmanıyla <br />
              optimize ediyoruz.
            </h2>
          </div>
          <div className="space-y-10">
             <p className="text-xl text-white/40 leading-relaxed font-medium">
                Ödelink, e-ticaret süreçlerindeki karmaşıklığı ortadan kaldıran, tamamen performans ve estetik odaklı bir teknoloji iskeletidir. Biz bir aracı değil, satıcının dijital kimliğini global standartlara taşıyan bir mühendislik çözümüyüz.
             </p>
             <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/5">
                <div>
                   <p className="text-4xl font-bold mb-2 tracking-tighter">99.9%</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Uptime Reliability</p>
                </div>
                <div>
                   <p className="text-4xl font-bold mb-2 tracking-tighter">0ms</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Latency Overhead</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY - BRUTALIST & CLEAN */}
      <section className="py-40 px-6 sm:px-12 max-w-screen-2xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="space-y-6">
               <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest">01 / Performance</span>
               <p className="text-white/60 leading-relaxed">
                  Kod tabanımız, en hızlı sayfa yükleme sürelerini sağlamak için gereksiz tüm kütüphanelerden arındırılmış, saf JavaScript ve CSS üzerine inşa edilmiştir.
               </p>
            </div>
            <div className="space-y-6">
               <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest">02 / Scalability</span>
               <p className="text-white/60 leading-relaxed">
                  Tek bir mağazadan, binlerce ürünlük envanterlere kadar tüm ölçeklerde aynı kararlılıkla çalışan modüler bir mimari sunuyoruz.
               </p>
            </div>
            <div className="space-y-6">
               <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest">03 / Security</span>
               <p className="text-white/60 leading-relaxed">
                  Veri güvenliğini bir seçenek değil, altyapının ayrılmaz bir parçası olarak görüyor ve PCI-DSS standartlarını doğrudan entegre ediyoruz.
               </p>
            </div>
         </div>
      </section>

      {/* FOUNDING - SUBTLE & EXECUTIVE */}
      <section className="py-40 px-6 sm:px-12 bg-[#080808] border-y border-white/5">
         <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="max-w-2xl space-y-8">
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/20">Executive Leadership</h3>
               <p className="text-3xl font-medium leading-snug">
                  "Ödelink, bireysel bir vizyonun, kolektif bir teknoloji standardına dönüşme hikayesidir. Karmaşıklığı basitleştirmek için buradayız."
               </p>
               <div className="flex items-center gap-6 pt-6">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center font-serif italic text-xl">MF</div>
                  <div>
                    <p className="font-bold text-white tracking-tight">Murat Furkan Bayram</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#C5A059]">Founder / Technical Lead</p>
                  </div>
               </div>
            </div>
            <div className="text-right space-y-2 opacity-20">
               <p className="text-[10px] font-black uppercase tracking-widest">HQ / ISTANBUL</p>
               <p className="text-[10px] font-black uppercase tracking-widest">EST / 2024</p>
            </div>
         </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-60 px-6 text-center">
         <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="space-y-12"
         >
            <h2 className="text-5xl sm:text-7xl font-bold tracking-tighter">İNOVASYONA KATILIN.</h2>
            <button className="px-16 py-6 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-[#C5A059] transition-colors">
               Platformu Keşfedin
            </button>
         </motion.div>
      </section>

      <style>{`
        body { background-color: black; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: black; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #C5A059; }
      `}</style>
    </div>
  );
};

export default AboutPage;
