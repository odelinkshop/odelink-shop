"use client";

import InfoPage from '@/components/layout/info-page-template';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <InfoPage 
      title="Hakkımızda" 
      subtitle="ZAMANSIZ ZARAFET" 
      content={
        <div className="space-y-24">
          {/* Hero Segment */}
          <div className="relative text-center py-12">
            <h2 className="text-4xl md:text-6xl font-serif mb-12 italic">"Sadelik en üstün sofistikasyondur."</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { t: "VİZYON", d: "Sıradan olanı sanata dönüştüren minimal bir estetik anlayışı." },
                { t: "KALİTE", d: "En iyi malzemelerle işlenen, nesiller boyu sürecek bir zanaat." },
                { t: "ETİK", d: "Sürdürülebilir moda ve dürüst ticaret ilkeleri." }
              ].map((item, i) => (
                <div key={i} className="p-8 border border-white/5 bg-white/[0.02] rounded-sm">
                  <p className="text-accent text-[9px] font-black tracking-[0.4em] mb-4">{item.t}</p>
                  <p className="text-sm text-white/40 leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Narrative */}
          <div className="grid lg:grid-cols-2 gap-20 items-center border-t border-white/5 pt-24">
            <div className="space-y-8">
              <h3 className="text-3xl font-serif">Markanın Doğuşu</h3>
              <p>
                [MAĞAZA İSMİ], modern aristokrasinin sessiz lüksünü ve zamansız tasarım anlayışını dijital dünyaya taşımak amacıyla kuruldu. Bizim için her parça, sadece bir ürün değil; birer hikaye ve birer duruştur.
              </p>
              <p className="text-white/40">
                Koleksiyonlarımızda 'hızlı moda'nın gürültüsünden uzak, 'yavaş moda'nın zarafetini ve kalıcılığını benimsiyoruz. Sizi, gereksiz kalabalıktan arınmış, sadece en iyinin kaldığı o özel dünyaya davet ediyoruz.
              </p>
            </div>
            <div className="bg-white/5 aspect-[4/5] relative border border-white/10 p-1">
               <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center italic text-white/20 uppercase tracking-[0.5em] text-[10px]">
                 Görsel Placeholder
               </div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/20 blur-[80px]" />
            </div>
          </div>

          {/* Editor Note */}
          <div className="bg-accent/5 border border-accent/20 p-12 rounded-sm relative overflow-hidden text-center">
            <div className="relative z-10 space-y-6">
              <p className="text-accent text-[10px] font-black tracking-[0.6em] uppercase">ADMİN NOTU</p>
              <p className="text-xl md:text-2xl font-serif text-white/80 max-w-2xl mx-auto italic">
                "Buraya mağazanızın ruhunu yansıtan, müşterilerinizin kalbine dokunacak o özel hikayeyi yazın. Siz sadece kıyafet değil, bir yaşam tarzı satıyorsunuz."
              </p>
            </div>
          </div>
        </div>
      } 
    />
  );
}
