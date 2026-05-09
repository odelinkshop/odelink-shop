import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Chrome, Download, CheckCircle2, ArrowLeft, Play, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExtensionGuide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2EBE1] font-sans selection:bg-[#C5A059]/30">
      <header className="fixed top-0 inset-x-0 z-50 bg-black/40 backdrop-blur-md border-b border-[#C5A059]/10">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#C5A059] flex items-center justify-center rounded-lg">
               <Chrome className="w-5 h-5 text-black" />
             </div>
             <h1 className="text-xl font-black tracking-tighter">ODELINK <span className="text-[#C5A059] font-serif font-normal italic">Connector</span></h1>
          </div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#F2EBE1]/40 hover:text-[#C5A059] transition-all">
            <ArrowLeft size={14} /> GERİ DÖN
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 pt-40 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-full text-[10px] font-black text-[#C5A059] tracking-widest uppercase">Kurulum Rehberi</div>
              <h2 className="text-5xl font-serif leading-tight">Odelink Connector'ı Kurun</h2>
              <p className="text-lg text-[#F2EBE1]/50 leading-relaxed">Shopier mağazanızı saniyeler içinde Odelink vitrininize dönüştürmek için ihtiyacınız olan tek araç.</p>
            </div>

            <div className="space-y-6">
              {[
                { step: '01', title: 'Eklentiyi İndirin', desc: 'Aşağıdaki butona tıklayarak eklenti paketini bilgisayarınıza indirin.' },
                { step: '02', title: 'Geliştirici Modunu Açın', desc: 'Chrome eklentiler sayfasında (chrome://extensions) sağ üstteki geliştirici modunu aktif edin.' },
                { step: '03', title: 'Klasörü Seçin', desc: 'İndirdiğiniz klasörü sürükleyip bırakın veya "Paketlenmemiş öğe yükle" diyerek seçin.' }
              ].map((s, i) => (
                <div key={i} className="flex gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-[#C5A059]/20 transition-all">
                  <div className="text-2xl font-serif text-[#C5A059] opacity-40">{s.step}</div>
                  <div>
                    <div className="text-sm font-bold uppercase tracking-widest mb-1">{s.title}</div>
                    <p className="text-xs text-[#F2EBE1]/40 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-6 bg-[#C5A059] text-black font-black uppercase text-xs tracking-[0.4em] rounded-2xl hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(197,160,89,0.2)]">
              <Download size={20} /> EKLENTİ PAKETİNİ İNDİR (.ZIP)
            </button>
          </div>

          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-[#C5A059]/20 to-transparent rounded-[60px] border border-[#C5A059]/20 overflow-hidden group">
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all group-hover:bg-[#C5A059] group-hover:text-black">
                   <Play size={32} />
                 </div>
               </div>
               <div className="absolute bottom-10 left-10 right-10 p-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
                 <div className="flex items-center gap-4">
                    <CheckCircle2 className="text-[#C5A059]" size={20} />
                    <div className="text-[10px] font-black uppercase tracking-widest">Nasıl Kurulur? (Video İzle)</div>
                 </div>
               </div>
            </div>
            {/* Floating Badges */}
            <div className="absolute -top-6 -right-6 p-6 bg-[#0A0A0A] border border-[#C5A059]/30 rounded-3xl shadow-2xl animate-bounce">
               <Zap className="text-[#C5A059]" size={24} />
            </div>
            <div className="absolute -bottom-10 -left-10 p-8 bg-[#0A0A0A] border border-white/5 rounded-3xl shadow-2xl">
               <ShieldCheck className="text-[#C5A059] mb-2" size={24} />
               <div className="text-[9px] font-black uppercase tracking-widest opacity-40">Güvenlik Onaylı</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
