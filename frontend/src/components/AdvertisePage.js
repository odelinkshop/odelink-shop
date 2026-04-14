import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Zap, Check, Mail, Phone, MessageSquare } from 'lucide-react';

const AdvertisePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    budget: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form gönderimi - backend'e gönderebilirsiniz
    console.log('Reklam talebi:', formData);
    setSubmitted(true);
    
    // 3 saniye sonra formu sıfırla
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        budget: ''
      });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const stats = [
    { icon: Users, value: '218+', label: 'Aktif Kullanıcı' },
    { icon: Target, value: '1000+', label: 'Günlük Görüntülenme' },
    { icon: Zap, value: '%95', label: 'Dönüşüm Oranı' },
    { icon: TrendingUp, value: '24/7', label: 'Görünürlük' }
  ];

  const packages = [
    {
      name: 'Başlangıç',
      price: '₺500',
      period: '/ay',
      features: [
        'Ana sayfada banner',
        '30 gün görünürlük',
        'Temel analitik',
        'E-posta desteği'
      ]
    },
    {
      name: 'Profesyonel',
      price: '₺1.200',
      period: '/ay',
      features: [
        'Ana sayfa + tüm sayfalar',
        '30 gün görünürlük',
        'Detaylı analitik',
        'Öncelikli destek',
        'A/B test desteği'
      ],
      popular: true
    },
    {
      name: 'Premium',
      price: '₺2.500',
      period: '/ay',
      features: [
        'Tüm sayfalarda öne çıkan alan',
        '30 gün görünürlük',
        'Gelişmiş analitik + raporlama',
        '7/24 destek',
        'A/B test + optimizasyon',
        'Özel tasarım desteği'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 pt-20 sm:pt-24 pb-16 sm:pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
            <TrendingUp className="w-5 h-5 text-white" />
            <span className="text-sm font-bold text-white">REKLAM VERİN</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Binlerce Kullanıcıya Ulaşın
          </h1>
          
          <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto font-medium">
            Ödelink'te reklam vererek markanızı, ürününüzü veya hizmetinizi hedef kitlenize tanıtın.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10"
            >
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-white/70 font-semibold">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Packages */}
        <motion.div
          className="mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-12">
            Reklam Paketleri
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`bg-white/5 backdrop-blur-md rounded-2xl p-8 border ${
                  pkg.popular ? 'border-red-500 ring-2 ring-red-500/30' : 'border-white/10'
                } relative`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                      ÖNERİLEN
                    </div>
                  </div>
                )}
                
                <h3 className="text-2xl font-black text-white mb-2">{pkg.name}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-black text-white">{pkg.price}</span>
                  <span className="text-white/60">{pkg.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-white/80">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <a
                  href="#contact-form"
                  className={`block w-full text-center py-3 rounded-xl font-bold transition-all ${
                    pkg.popular
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Hemen Başla
                </a>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          id="contact-form"
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 sm:p-10 border border-white/10">
            <h2 className="text-3xl font-black text-white text-center mb-8">
              Reklam Talebi Oluştur
            </h2>
            
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Talebiniz Alındı!</h3>
                <p className="text-white/70">En kısa sürede sizinle iletişime geçeceğiz.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      E-posta *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="ornek@mail.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="0555 555 55 55"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Şirket/Marka
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Şirket Adı"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Bütçe
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seçiniz</option>
                    <option value="500-1000">₺500 - ₺1.000</option>
                    <option value="1000-2500">₺1.000 - ₺2.500</option>
                    <option value="2500+">₺2.500+</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Mesajınız *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Reklam detaylarınızı, hedef kitlenizi ve beklentilerinizi yazın..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-all hover:scale-[1.02] min-h-[48px]"
                >
                  Talep Gönder
                </button>
              </form>
            )}
          </div>
          
          {/* Contact Info */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="mailto:odelinkdestek@gmail.com"
              className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
            >
              <Mail className="w-5 h-5 text-white" />
              <div>
                <div className="text-xs text-white/60">E-posta</div>
                <div className="text-sm font-semibold text-white">odelinkdestek@gmail.com</div>
              </div>
            </a>
            
            <a
              href="https://wa.me/639751982712"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
            >
              <Phone className="w-5 h-5 text-white" />
              <div>
                <div className="text-xs text-white/60">WhatsApp</div>
                <div className="text-sm font-semibold text-white">+63 975 198 2712</div>
              </div>
            </a>
            
            <a
              href="/contact"
              className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
            >
              <MessageSquare className="w-5 h-5 text-white" />
              <div>
                <div className="text-xs text-white/60">İletişim</div>
                <div className="text-sm font-semibold text-white">İletişim Formu</div>
              </div>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvertisePage;
