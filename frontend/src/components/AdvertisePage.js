import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Zap, Check, Mail, Phone, MessageSquare, Upload, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdvertisePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shopierUrl: '',
    brandName: '',
    instagramHandle: '',
    description: '',
    pricingTier: 'profesyonel',
    email: '',
    phone: '',
    company: ''
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Reklam vermek için giriş yapmanız gerekiyor.');
        navigate('/auth');
        return;
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append('shopierUrl', formData.shopierUrl);
      formDataToSend.append('brandName', formData.brandName);
      formDataToSend.append('instagramHandle', formData.instagramHandle);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('pricingTier', formData.pricingTier);
      
      if (logo) {
        formDataToSend.append('logo', logo);
      }
      
      const response = await fetch('/api/advertisements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      if (response.ok) {
        setSubmitted(true);
        
        // 5 saniye sonra formu sıfırla
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            shopierUrl: '',
            brandName: '',
            instagramHandle: '',
            description: '',
            pricingTier: 'profesyonel',
            email: '',
            phone: '',
            company: ''
          });
          setLogo(null);
          setLogoPreview(null);
        }, 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Bilinmeyen hata oluştu');
      }
    } catch (error) {
      console.error('Form gönderimi hatası:', error);
      setError('Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError(null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Logo dosyası 5MB\'dan küçük olmalıdır');
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Sadece PNG, JPG, JPEG, SVG dosyaları kabul edilir');
      return;
    }

    setLogo(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const stats = [
    { icon: Users, value: '218+', label: 'Aktif Kullanıcı' },
    { icon: Target, value: '1000+', label: 'Günlük Görüntülenme' },
    { icon: Zap, value: '%95', label: 'Dönüşüm Oranı' },
    { icon: TrendingUp, value: '24/7', label: 'Görünürlük' }
  ];

  const packages = [
    {
      id: 'baslangic',
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
      id: 'profesyonel',
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
      id: 'premium',
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
            <span className="text-sm font-bold text-white">SHOPIER MAĞAZA REKLAMLARI</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Mağazanızı Tanıtın
          </h1>
          
          <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto font-medium">
            Shopier mağazanızı Ödelink'te reklam vererek binlerce potansiyel müşteriye ulaşın.
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
                } relative cursor-pointer transition-all hover:scale-105 ${
                  formData.pricingTier === pkg.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setFormData({...formData, pricingTier: pkg.id})}
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
                
                <div className={`w-full text-center py-3 rounded-xl font-bold transition-all ${
                  formData.pricingTier === pkg.id
                    ? 'bg-blue-500 text-white'
                    : pkg.popular
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                  {formData.pricingTier === pkg.id ? 'Seçildi' : 'Seç'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          id="contact-form"
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 sm:p-10 border border-white/10">
            <h2 className="text-3xl font-black text-white text-center mb-8">
              Reklam Talebi Oluştur
            </h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-200">{error}</span>
              </div>
            )}
            
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Talebiniz Alındı!</h3>
                <p className="text-white/70 mb-4">Reklam talebiniz başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.</p>
                <p className="text-white/60 text-sm">Reklam durumunuzu kontrol etmek için dashboard'unuzu ziyaret edebilirsiniz.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shopier URL */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Shopier Mağaza URL'si *
                  </label>
                  <input
                    type="url"
                    name="shopierUrl"
                    value={formData.shopierUrl}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://shopier.com/magaza-adi"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Brand Name */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Marka/Mağaza Adı *
                    </label>
                    <input
                      type="text"
                      name="brandName"
                      value={formData.brandName}
                      onChange={handleChange}
                      required
                      maxLength={100}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Mağaza Adınız"
                    />
                  </div>
                  
                  {/* Instagram Handle */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Instagram Kullanıcı Adı *
                    </label>
                    <input
                      type="text"
                      name="instagramHandle"
                      value={formData.instagramHandle}
                      onChange={handleChange}
                      required
                      maxLength={50}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="magaza_adi (@ olmadan)"
                    />
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Logo (Opsiyonel)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white cursor-pointer hover:bg-white/20 transition-all"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Logo Seç</span>
                    </label>
                    {logoPreview && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/20">
                        <img src={logoPreview} alt="Logo önizleme" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-white/60 mt-2">PNG, JPG, JPEG, SVG - Maksimum 5MB</p>
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Mağaza Açıklaması *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Mağazanızı kısaca tanıtın, hangi ürünleri sattığınızı belirtin..."
                  />
                  <div className="text-xs text-white/60 mt-1 text-right">
                    {formData.description.length}/500
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-all hover:scale-[1.02] min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Gönderiliyor...' : 'Reklam Talebini Gönder'}
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