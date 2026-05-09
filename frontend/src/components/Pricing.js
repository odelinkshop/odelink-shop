import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Star, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Search, 
  Smartphone,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useNavigate();

  const comparisonFeatures = [
    { name: 'Aktif Vitrin Sitesi', standart: '1 Adet', profesyonel: '10 Adet' },
    { name: 'Shopier Entegrasyonu', standart: true, profesyonel: true },
    { name: 'Noir Fashion Teması', standart: true, profesyonel: true },
    { name: 'Gelecek Tüm Temalar', standart: false, profesyonel: true },
    { name: 'Özel Alan Adı (Domain)', standart: false, profesyonel: true },
    { name: 'Gelişmiş SEO Ayarları', standart: false, profesyonel: true },
    { name: 'Detaylı Ziyaretçi Analitiği', standart: 'Temel', profesyonel: 'Gelişmiş' },
    { name: '7/24 Öncelikli Destek', standart: false, profesyonel: true },
    { name: 'Sınırsız Ürün Listeleme', standart: true, profesyonel: true },
  ];

  return (
    <section id="pricing" className="py-24 bg-[#050505] text-white relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
            <Zap size={14} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Piyasanın En Uygun Fiyatları</span>
          </div>
          
          <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter mb-6 uppercase">
            Planını <span className="text-blue-500">Seç</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 font-medium">
            İhtiyacınıza en uygun paketi seçin, Shopier mağazanızı dakikalar içinde profesyonel bir vitrine dönüştürün.
          </p>
          
          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-6">
            <span className={`text-sm font-bold uppercase tracking-widest ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>AYLIK</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-20 h-10 bg-white/5 border border-white/10 rounded-full p-1 transition-all duration-300 hover:border-blue-500/50"
            >
              <div className={`w-8 h-8 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 ${isAnnual ? 'translate-x-10' : 'translate-x-0'}`} />
            </button>
            <div className="flex flex-col items-start">
              <span className={`text-sm font-bold uppercase tracking-widest ${isAnnual ? 'text-white' : 'text-gray-500'}`}>YILLIK</span>
              <span className="text-[10px] text-green-500 font-black tracking-widest">%85+ TASARRUF</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
          {/* Standart Plan */}
          <motion.div
            className="group relative bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 backdrop-blur-md hover:bg-white/[0.04] transition-all duration-500 overflow-hidden"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative z-10">
              <div className="mb-8">
                <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2">Standart</h3>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Temel İhtiyaçlar İçin</p>
              </div>
              
              <div className="mb-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black italic tracking-tighter">₺299</span>
                  <span className="text-gray-500 font-bold uppercase tracking-widest">/AY</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Kısa süreli deneme için ideal.</p>
              </div>

              <ul className="space-y-4 mb-10">
                {[
                  '1 Adet Vitrin Sitesi',
                  'Shopier Entegrasyonu',
                  'Noir Fashion Teması',
                  'Mobil Uyumlu Tasarım',
                  'Temel Analitik'
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-400">
                    <Check size={16} className="text-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => navigate('/auth')}
                className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all active:scale-95"
              >
                Hemen Başla
              </button>
            </div>
          </motion.div>

          {/* Profesyonel Plan */}
          <motion.div
            className="group relative bg-blue-500/5 border-2 border-blue-500/30 rounded-[3rem] p-10 backdrop-blur-md hover:bg-blue-500/10 transition-all duration-500 overflow-hidden"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Recommended Badge */}
            <div className="absolute top-6 right-8 px-4 py-1.5 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              Önerilen Paket
            </div>

            <div className="relative z-10">
              <div className="mb-8">
                <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2 text-blue-500">Profesyonel</h3>
                <p className="text-blue-500/60 text-sm font-bold uppercase tracking-widest">Sınırsız Büyüme</p>
              </div>
              
              <div className="mb-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black italic tracking-tighter">₺399</span>
                  <span className="text-blue-500/50 font-bold uppercase tracking-widest">/YIL</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-black rounded uppercase tracking-widest underline decoration-2">AYLIK SADECE ₺33!</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                {[
                  '10 Adet Vitrin Sitesi',
                  'Özel Alan Adı (Domain)',
                  'Tüm Mevcut & Gelecek Temalar',
                  'Gelişmiş SEO Ayarları',
                  '7/24 VIP Destek',
                  'Gelişmiş Analitik Araçları'
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-white">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-white" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => navigate('/auth')}
                className="w-full py-5 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-blue-500/50 hover:scale-[1.02] transition-all active:scale-95"
              >
                PRO OL VE KAZAN
              </button>
            </div>
          </motion.div>
        </div>

        {/* Comparison Table */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-black italic uppercase tracking-tight">Kapsamlı Karşılaştırma</h3>
            <p className="text-gray-500 text-sm mt-2 font-bold uppercase tracking-widest">Neden Profesyonel Seçmelisiniz?</p>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">ÖZELLİK</th>
                  <th className="p-6 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">STANDART</th>
                  <th className="p-6 text-center text-[10px] font-black text-blue-500 uppercase tracking-widest">PROFESYONEL</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((f, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="p-6 text-sm font-bold text-gray-300">{f.name}</td>
                    <td className="p-6 text-center">
                      {typeof f.standart === 'boolean' ? (
                        f.standart ? <Check size={18} className="text-blue-500 mx-auto" /> : <div className="w-4 h-[2px] bg-white/10 mx-auto" />
                      ) : (
                        <span className="text-xs font-black text-gray-500">{f.standart}</span>
                      )}
                    </td>
                    <td className="p-6 text-center">
                      {typeof f.profesyonel === 'boolean' ? (
                        f.profesyonel ? <Check size={18} className="text-blue-500 mx-auto" /> : <div className="w-4 h-[2px] bg-white/10 mx-auto" />
                      ) : (
                        <span className="text-xs font-black text-blue-500">{f.profesyonel}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ Preview */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: ShieldCheck, title: 'Güvenli Ödeme', desc: 'Shopier altyapısı ile PCI-DSS uyumlu %100 güvenli ödeme.' },
            { icon: Zap, title: 'Anında Aktivasyon', desc: 'Ödeme sonrası paketiniz saniyeler içinde hesabınıza tanımlanır.' },
            { icon: Headphones, title: 'Uzman Destek', desc: 'Kurulum veya tasarımda yardıma mı ihtiyacınız var? Buradayız.' }
          ].map((item, idx) => (
            <div key={idx} className="text-center p-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500">
                <item.icon size={24} />
              </div>
              <h4 className="font-black italic uppercase tracking-tight mb-2">{item.title}</h4>
              <p className="text-gray-500 text-xs leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
