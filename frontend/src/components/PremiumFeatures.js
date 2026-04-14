import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Diamond, Rocket, Store, Shield, Globe, BadgePercent, Flame, CheckCircle } from 'lucide-react';

const PremiumFeatures = () => {
  const disableDesktopMotion = false;

  const features = [
    {
      icon: Crown,
      title: 'Kurumsal Tasarım',
      description: 'Markanıza uygun, sade ve profesyonel vitrin sayfaları',
      color: 'from-gray-900 to-gray-900',
      features: ['Sınırsız ürün', 'Özel marka', 'VIP destek']
    },
    {
      icon: Diamond,
      title: 'Kararlı Altyapı',
      description: 'Güvenilir çalışma ve performans odaklı yapı',
      color: 'from-gray-900 to-gray-900',
      features: ['Hızlı açılış', 'Hafif sayfa yapısı', 'Önbellek + CDN']
    },
    {
      icon: Rocket,
      title: 'Hızlı Kurulum',
      description: 'Dakikalar içinde yayına alın',
      color: 'from-gray-900 to-gray-900',
      features: ['3 dk kurulum', 'Temel SEO', 'Anında yayın']
    },
    {
      icon: Flame,
      title: 'Ölçeklenebilir',
      description: 'Büyüyen katalog ve trafik için hazır',
      color: 'from-gray-900 to-gray-900',
      features: ['Büyümeye hazır', 'Ürün sayfaları', 'Trafiğe dayanıklı']
    },
    {
      icon: Globe,
      title: 'Mobil Uyum',
      description: 'Her ekranda temiz ve tutarlı görünüm',
      color: 'from-gray-900 to-gray-900',
      features: ['Her cihazda tam uyum', 'Mobil odaklı tasarım', 'Hızlı açılış']
    },
    {
      icon: Shield,
      title: 'Güvenli',
      description: 'Temel güvenlik pratikleri ve güven veren arayüz',
      color: 'from-gray-900 to-gray-900',
      features: ['SSL sertifikası', 'KVKK odaklı', '7/24 izleme']
    }
  ];

  const stats = [
    { value: '218+', label: 'Aktif mağaza', icon: Store },
    { value: 'Shopier', label: 'Uyumlu', icon: Globe },
    { value: '7/24', label: 'Online', icon: Flame },
    { value: 'Güvenli', label: 'Altyapı', icon: Shield },
    { value: '0₺', label: 'Komisyon', icon: BadgePercent },
    { value: '3 dk', label: 'Kurulum', icon: Rocket }
  ];

  return (
    <section className="py-24 relative overflow-hidden cv-desktop" id="features">
      <div className="container mx-auto px-4 relative z-10">
        {disableDesktopMotion ? (
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-black/90 text-white px-5 py-2.5 rounded-full mb-8 shadow-lg border border-white/10">
              <Crown className="w-6 h-6 mr-3" />
              <span className="text-sm font-black tracking-wide">Premium özellikler</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Özellikler
            </h2>
            <p className="text-white/70 max-w-4xl mx-auto text-base md:text-lg font-medium md:whitespace-nowrap">
              Shopier ürünlerini daha düzenli, daha hızlı ve daha güven veren bir vitrine dönüştür.
            </p>
          </div>
        ) : (
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
          <div className="inline-flex items-center bg-black/90 text-white px-5 py-2.5 rounded-full mb-8 shadow-lg border border-white/10">
            <Crown className="w-6 h-6 mr-3" />
            <span className="text-sm font-black tracking-wide">Premium özellikler</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Özellikler
          </h2>
          <p className="text-white/70 max-w-4xl mx-auto text-base md:text-lg font-medium md:whitespace-nowrap">
            Shopier ürünlerini daha düzenli, daha hızlı ve daha güven veren bir vitrine dönüştür.
          </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-16 sm:mb-20">
          {stats.map((stat, index) => (
            (disableDesktopMotion ? (
              <div
                key={index}
                className="bg-black/35 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-center border border-white/15 shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition-all duration-200 hover:shadow-[0_18px_54px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 min-h-[120px] flex flex-col justify-center"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 border border-white/10">
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-white/70 font-semibold">{stat.label}</div>
              </div>
            ) : (
              <motion.div
                key={index}
                className="bg-black/35 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-center border border-white/15 shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition-all duration-200 hover:shadow-[0_18px_54px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 min-h-[120px] flex flex-col justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 border border-white/10">
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-white/70 font-semibold">{stat.label}</div>
              </motion.div>
            ))
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            (disableDesktopMotion ? (
              <div
                key={index}
                className="bg-black/35 backdrop-blur-md rounded-2xl p-5 sm:p-8 border border-white/15 shadow-[0_16px_46px_rgba(0,0,0,0.40)] transition-all duration-200 hover:shadow-[0_20px_62px_rgba(0,0,0,0.52)] hover:-translate-y-0.5"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-white/10">
                  <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6">{feature.description}</p>
                
                <div className="space-y-2 mb-4 sm:mb-6">
                  {feature.features.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center text-xs sm:text-sm text-white/80">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-white/80 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <motion.div
                key={index}
                className="bg-black/35 backdrop-blur-md rounded-2xl p-5 sm:p-8 border border-white/15 shadow-[0_16px_46px_rgba(0,0,0,0.40)] transition-all duration-200 hover:shadow-[0_20px_62px_rgba(0,0,0,0.52)] hover:-translate-y-0.5"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-white/10">
                <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3">{feature.title}</h3>
              <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6">{feature.description}</p>
              
              <div className="space-y-2 mb-4 sm:mb-6">
                {feature.features.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center text-xs sm:text-sm text-white/80">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-white/80 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              </motion.div>
            ))
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumFeatures;
