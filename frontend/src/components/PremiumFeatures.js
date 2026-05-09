import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  Globe, 
  BarChart3, 
  Palette, 
  RefreshCw, 
  CheckCircle2, 
  Flame, 
  Store, 
  Rocket, 
  Cpu,
  Lock
} from 'lucide-react';

const PremiumFeatures = () => {
  const features = [
    {
      icon: RefreshCw,
      title: 'Shopier Real-Time Sync',
      description: 'Shopier mağazanızdaki tüm ürünler, stoklar ve fiyatlar anlık olarak Nova vitrininizle senkronize olur. Hiçbir manuel işleme gerek kalmaz.',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
      bullets: ['Anlık Stok Güncelleme', 'Otomatik Ürün Çekme', 'Fiyat Senkronizasyonu']
    },
    {
      icon: Cpu,
      title: 'AI-Powered SEO Engine',
      description: 'Yapay zeka destekli altyapımız, ürünleriniz için otomatik meta etiketleri, sitemap ve robots.txt dosyalarını oluşturur. Google\'da en üstte olun.',
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400',
      bullets: ['Otomatik Meta Veri', 'Hızlı İndeksleme', 'SEO Dostu URL Yapısı']
    },
    {
      icon: Globe,
      title: 'Custom Domain & SSL',
      description: 'Kendi alan adınızı (example.com) saniyeler içinde mağazanıza bağlayın. Ücretsiz 256-bit SSL sertifikasıyla müşterilerinize güven verin.',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-400',
      bullets: ['Özel Alan Adı Desteği', 'Ücretsiz SSL Sertifikası', 'Global DNS Altyapısı']
    },
    {
      icon: Palette,
      title: 'Premium Noir Themes',
      description: 'Dünya standartlarında tasarlanmış Noir ve gelecek tüm premium temalara erişim sağlayın. Markanızın kimliğini en şık şekilde yansıtın.',
      gradient: 'from-orange-500/20 to-red-500/20',
      iconColor: 'text-orange-400',
      bullets: ['Noir Fashion Teması', 'Sınırsız Renk Seçeneği', 'Özel Font Desteği']
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Ziyaretçilerinizin davranışlarını, sepet hareketlerini ve dönüşüm oranlarını detaylı paneller üzerinden anlık olarak takip edin.',
      gradient: 'from-indigo-500/20 to-blue-500/20',
      iconColor: 'text-indigo-400',
      bullets: ['Canlı Ziyaretçi Takibi', 'Satış Hunisi Analizi', 'Coğrafi Raporlama']
    },
    {
      icon: Zap,
      title: 'Global CDN Speed',
      description: 'Mağazanız dünyanın dört bir yanındaki sunuculardan saniyeler içinde yüklenir. %99 Lighthouse skoru ile kesintisiz bir deneyim sunun.',
      gradient: 'from-yellow-500/20 to-orange-500/20',
      iconColor: 'text-yellow-400',
      bullets: ['0.5sn Altı Açılış Hızı', 'Görsel Optimizasyonu', 'Edge Caching Teknolojisi']
    }
  ];

  const stats = [
    { label: 'Aktif Mağaza', value: '250+', icon: Store },
    { label: 'Mutlu Satıcı', value: '%100', icon: CheckCircle2 },
    { label: 'Aktivasyon Hızı', value: '3 Dakika', icon: Rocket },
    { label: 'Kesintisiz Hizmet', value: '%99.9', icon: ShieldCheck }
  ];

  return (
    <section className="py-32 bg-[#030303] text-white relative overflow-hidden will-change-transform" id="features">
      {/* Mesh Gradients for background depth */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
        <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full will-change-transform" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full will-change-transform" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
            <Flame size={14} className="text-orange-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Teknoloji & Altyapı</span>
          </div>
          
          <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter mb-8 uppercase leading-none">
            Profesyonel <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              E-Ticaret Gücü
            </span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            Shopier ürünlerinizi dünya standartlarında bir teknolojiyle buluşturuyoruz. 
            Hız, güvenlik ve tasarımın mükemmel uyumunu keşfedin.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              className="group relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              {/* Card Decoration */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem] blur-2xl pointer-events-none`} />
              
              <div className="relative h-full bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-md hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 flex flex-col">
                <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 ${feature.iconColor} group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon size={32} />
                </div>
                
                <h3 className="text-2xl font-black italic uppercase tracking-tight mb-4 group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8 flex-grow">
                  {feature.description}
                </p>
                
                <div className="space-y-3 pt-6 border-t border-white/5">
                  {feature.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      {bullet}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* High-Impact Stats Bar */}
        <motion.div
          className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3rem] p-12 md:p-16 overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.2)]"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 items-center text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white shadow-xl backdrop-blur-sm">
                  <stat.icon size={28} />
                </div>
                <div className="text-4xl md:text-5xl font-black italic tracking-tighter mb-2 text-white">
                  {stat.value}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Final Trust Callout */}
        <div className="mt-24 text-center">
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-4">
            <Lock size={16} /> Tüm Altyapımız 256-Bit SSL ve Global Güvenlik Standartları ile Korunmaktadır.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PremiumFeatures;
