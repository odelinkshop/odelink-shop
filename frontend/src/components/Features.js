import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Smartphone, CreditCard, BarChart3, Lock, Zap, Globe2, Users, Headphones } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Palette,
      title: 'Modern Tasarım',
      description: 'Profesyonel ve modern tasarımlarla müşterilerinizi etkileyin. Mobil uyumlu ve responsive yapı.'
    },
    {
      icon: Smartphone,
      title: 'Mobil Uyumlu',
      description: 'Tüm cihazlarda mükemmel görünen, mobil-first tasarım yaklaşımı.'
    },
    {
      icon: CreditCard,
      title: 'Shopier Entegrasyonu',
      description: 'Direkt Shopier ödeme sistemiyle güvenli alışveriş deneyimi.'
    },
    {
      icon: BarChart3,
      title: 'Analitik ve Raporlama',
      description: 'Satışlarınızı ve ziyaretçi istatistiklerinizi detaylı olarak takip edin.'
    },
    {
      icon: Lock,
      title: 'Güvenli Altyapı',
      description: 'SSL sertifikası ve güvenli altyapı ile verileriniz güvende.'
    },
    {
      icon: Zap,
      title: 'Hızlı Yükleme',
      description: 'Optimize edilmiş altyapı ile saniyeler içinde açılan web siteleri.'
    },
    {
      icon: Globe2,
      title: 'SEO Uyumlu',
      description: 'Arama motorlarında üst sıralarda yer almak için SEO optimize edilmiş yapı.'
    },
    {
      icon: Users,
      title: 'Müşteri Yönetimi',
      description: 'Müşteri verilerinizi yönetin ve pazarlama kampanyaları oluşturun.'
    },
    {
      icon: Headphones,
      title: '7/24 Destek',
      description: 'Teknik destek ekibimiz her zaman yanınızda!'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
            Neden Ödelink?
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Shopier mağazanız için ihtiyacınız olan tüm özellikler tek bir platformda
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="card hover:scale-105 transition-transform duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-secondary-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
