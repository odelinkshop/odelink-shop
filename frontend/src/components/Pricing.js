import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, ArrowRight } from 'lucide-react';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Standart',
      description: 'Aylık paket',
      price: isAnnual ? null : 299,
      yearlyPrice: null,
      monthlyPrice: 299,
      features: [
        '3 vitrin sitesi',
        'Shopier linki ile hızlı kurulum',
        'Noir Fashion tema erişimi',
        'Tema & renk ayarları',
        'Logo yükleme',
        'Temel analitik'
      ],
      color: 'from-gray-500 to-gray-700',
      popular: false
    },
    {
      name: 'Profesyonel',
      description: 'Yıllık paket',
      price: isAnnual ? 399 : null,
      yearlyPrice: 399,
      monthlyPrice: null,
      features: [
        '10 vitrin sitesi',
        'Shopier linki ile hızlı kurulum',
        'Noir Fashion tema erişimi',
        'Özel alan adı',
        'Gelişmiş analitik',
        'VIP destek'
      ],
      color: 'from-primary-500 to-primary-700',
      popular: true
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-secondary-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
            Fiyatlandırma
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto mb-8">
            İşletmenizin büyüklüğüne uygun paket seçenekleri
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-lg font-medium ${!isAnnual ? 'text-primary-600' : 'text-secondary-500'}`}>
              Aylık
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ${
                isAnnual ? 'bg-primary-600' : 'bg-secondary-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                  isAnnual ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg font-medium ${isAnnual ? 'text-primary-600' : 'text-secondary-500'}`}>
              Yıllık
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                %20 indirim
              </span>
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {plans
            .filter((plan) => (isAnnual ? plan.yearlyPrice !== null : plan.monthlyPrice !== null))
            .map((plan, index) => (
            <motion.div
              key={index}
              className={`relative ${
                plan.popular 
                  ? 'scale-105 shadow-2xl' 
                  : 'shadow-lg'
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    En Popüler
                  </div>
                </div>
              )}
              
              <div className={`card bg-gradient-to-br ${plan.color} text-white`}>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-white/80 mb-6">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-5xl font-bold">₺{plan.price}</span>
                    <span className="text-white/80 text-lg">{isAnnual ? '/yıl' : '/ay'}</span>
                  </div>
                </div>
                
                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-white text-primary-600 hover:bg-gray-100'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}>
                  Paketi Seç
                </button>
              </div>
              
              <div className="card mt-4">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-secondary-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-gradient-to-r from-primary-100 to-secondary-100 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-secondary-900 mb-4">
              Kurumsal Çözümler
            </h3>
            <p className="text-secondary-600 mb-6">
              Büyük ölçekli işletmeler için özel çözümler ve API entegrasyonları
            </p>
            <button className="btn-primary inline-flex items-center">
              İletişime Geç
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;

