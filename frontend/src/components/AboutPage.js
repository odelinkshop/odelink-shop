import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Target, Rocket, Award } from 'lucide-react';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Hakkımızda | Ödelink Kurumsal Vizyon";
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-40 px-6 overflow-hidden relative">
      {/* Background Ambient Effects */}
      <div className="absolute top-0 left-0 w-full h-[1000px] bg-[radial-gradient(circle_at_50%_-20%,#C5A05915_0%,transparent_70%)] pointer-events-none"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* HERO SECTION - Institutional Focus */}
        <div className="text-center mb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-12">
               <Target size={14} className="text-[#C5A059]" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C5A059]">Corporate Identity</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter leading-tight mb-12">
              E-Ticaretin Geleceğini <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] via-[#F5D089] to-[#C5A059]">Yeniden Tanımlıyoruz</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-medium">
              Ödelink, yerel satıcıların küresel pazarlarda profesyonel bir kimlikle var olmasını sağlayan, bağımsız ve yenilikçi bir teknoloji ekosistemidir.
            </p>
          </motion.div>
        </div>

        {/* CORE VALUES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40">
           {[
             { icon: Shield, title: 'Güvenlik Odaklılık', desc: 'Veri gizliliği ve işlem güvenliğini platformun merkezine koyuyoruz.' },
             { icon: Zap, title: 'Yüksek Performans', desc: 'En karmaşık mağaza altyapılarını bile saniyeler içinde ayağa kaldırıyoruz.' },
             { icon: Globe, title: 'Global Vizyon', desc: 'Türkiye’deki girişimcileri dünya standartlarında vitrinlerle buluşturuyoruz.' }
           ].map((val, i) => (
             <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-[#C5A05940] transition-all group"
             >
                <div className="w-12 h-12 bg-[#C5A05910] rounded-xl flex items-center justify-center text-[#C5A059] mb-8 group-hover:scale-110 transition-transform">
                   <val.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4">{val.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed uppercase tracking-wider font-bold">{val.desc}</p>
             </motion.div>
           ))}
        </div>

        {/* MISSION & VISION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
           <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-10"
           >
              <h2 className="text-5xl font-serif italic tracking-tight">Dijital Dönüşümde <br /> Yeni Bir Standart</h2>
              <p className="text-gray-400 text-lg leading-relaxed font-medium">
                Geleneksel e-ticaret modellerinin hantallığını reddediyoruz. Ödelink, Shopier altyapısını lüks segment tasarımlarla birleştirerek, butik işletmelere kurumsal bir dev görünümü kazandırır. Amacımız, teknolojiyi karmaşıklıktan arındırıp, saf performans ve estetiğe dönüştürmektir.
              </p>
              <div className="flex gap-6">
                 <div className="space-y-1">
                    <p className="text-3xl font-bold text-[#C5A059]">99%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Uptime Garantisi</p>
                 </div>
                 <div className="w-px h-12 bg-white/10" />
                 <div className="space-y-1">
                    <p className="text-3xl font-bold text-[#C5A059]">0%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Ek Satış Komisyonu</p>
                 </div>
              </div>
           </motion.div>

           <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative"
           >
              <div className="aspect-square bg-gradient-to-br from-[#C5A05920] to-transparent rounded-[4rem] border border-white/5 flex items-center justify-center p-20 relative overflow-hidden">
                 <div className="absolute inset-0 bg-white/[0.01] pointer-events-none" />
                 <Rocket size={120} className="text-[#C5A059] opacity-20" />
                 <div className="absolute inset-0 border-[20px] border-black m-12 rounded-[2rem]" />
              </div>
              {/* Floating Quote */}
              <div className="absolute -bottom-10 -left-10 bg-[#111] p-10 border border-white/5 rounded-3xl shadow-2xl max-w-sm">
                 <p className="text-sm italic text-gray-300 leading-relaxed mb-6">
                    "Teknoloji, sadece işlevsel olduğunda değil, aynı zamanda güven verdiğinde gerçek bir güç haline gelir."
                 </p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">Kurumsal İlke No: 01</p>
              </div>
           </motion.div>
        </div>

        {/* FOUNDER SECTION - Subtle & Professional */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 md:p-24 relative overflow-hidden">
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
              <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
                 <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#C5A059] to-black p-0.5 mb-8">
                    <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center italic font-serif text-3xl font-bold text-[#C5A059]">
                       MFB
                    </div>
                 </div>
                 <h4 className="text-2xl font-bold mb-2 tracking-tight">Murat Furkan Bayram</h4>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059]">Kurucu & Vizyoner</p>
              </div>
              <div className="md:col-span-8">
                 <p className="text-xl text-gray-400 font-medium leading-relaxed italic border-l-2 border-[#C5A059]/30 pl-10">
                    Ödelink, Murat Furkan Bayram'ın "yerel işletmelerin dijital vitrinlerini dünya standartlarına taşıma" vizyonuyla hayata geçirilmiştir. Girişimcilik ekosistemine yenilikçi bir soluk getiren Bayram, platformun teknolojik mimarisinden kullanıcı deneyimine kadar her noktada mükemmeliyeti hedefleyen kurumsal felsefeyi yönetmektedir. 
                 </p>
              </div>
           </div>
        </div>

        {/* FOOTER CALL TO ACTION */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-40 text-center space-y-10"
        >
          <div className="w-20 h-[1px] bg-[#C5A059] mx-auto opacity-30" />
          <p className="text-4xl md:text-5xl font-serif italic text-white/90 tracking-tighter">
             Geleceğin ticaretini <span className="text-[#C5A059]">birlikte</span> inşa edelim.
          </p>
          <button className="bg-[#C5A059] text-black px-12 py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform active:scale-95 shadow-[0_0_30px_rgba(197,160,89,0.3)]">
             Şimdi Başla
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
