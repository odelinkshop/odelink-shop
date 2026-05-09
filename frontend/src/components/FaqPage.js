import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageCircle, ArrowRight, Search, Zap, Shield, CreditCard, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const faqs = [
  {
    category: 'Genel',
    icon: Zap,
    questions: [
      {
        q: 'Ödelink tam olarak nedir?',
        a: 'Ödelink, Shopier satıcılarının mağazalarını profesyonel bir e-ticaret vitrinine dönüştürmelerini sağlayan bir SaaS (Yazılım Hizmeti) platformudur. Ürünlerinizi Shopier\'den otomatik çeker ve markanıza özel profesyonel bir tasarım sunar.'
      },
      {
        q: 'Shopier mağazamla nasıl senkronize olur?',
        a: 'Sadece Shopier mağaza linkinizi (örn: magazam.shopier.com) girmeniz yeterlidir. Ödelink, Shopier mağazanızdaki ürünleri, fiyatları ve açıklamaları anında tarayarak vitrin sitenizde listeler. API anahtarı veya şifre gerekmez.'
      },
      {
        q: 'Satışlarımdan komisyon alıyor musunuz?',
        a: 'Hayır. Ödelink sıfır komisyon modeliyle çalışır. Satışlarınız yine Shopier üzerinden gerçekleşir ve Shopier kendi komisyonunu alır; Ödelink ise sadece aylık veya yıllık sabit abonelik ücreti talep eder.'
      }
    ]
  },
  {
    category: 'Fiyatlandırma',
    icon: CreditCard,
    questions: [
      {
        q: 'Abonelik ücretleri ne kadar?',
        a: 'İki ana planımız bulunmaktadır: Standart Plan aylık 299 TL (3 vitrin sitesi), Profesyonel Plan ise yıllık paket avantajıyla sadece 399 TL (10 vitrin sitesi + Özel Alan Adı). Profesyonel plan yıllık ödemede %80\'den fazla tasarruf sağlar.'
      },
      {
        q: 'Profesyonel planın yıllık olması bir zorunluluk mu?',
        a: 'Evet, Profesyonel plan en yüksek avantajı sunabilmek için yıllık paket olarak sunulmaktadır. Bu sayede 10 farklı site yönetimi ve özel alan adı gibi premium özelliklere çok uygun maliyetle sahip olursunuz.'
      },
      {
        q: 'Ödeme yöntemleri nelerdir?',
        a: 'Abonelik ödemelerinizi tüm banka ve kredi kartlarınızla güvenli bir şekilde yapabilirsiniz. Ödemelerimiz şifrelenmiş altyapı üzerinden korunmaktadır.'
      }
    ]
  },
  {
    category: 'Teknik Özellikler',
    icon: Shield,
    questions: [
      {
        q: 'Özel alan adı (domain) bağlayabilir miyim?',
        a: 'Evet, Profesyonel plan sahipleri kendi özel alan adlarını (örn: www.markaniz.com) vitrin sitelerine bağlayabilirler. Standart planda ise markaniz.odelink.shop şeklinde alt alan adı sunulur.'
      },
      {
        q: 'Sitem mobil uyumlu mu?',
        a: 'Kesinlikle. Tüm vitrin sitelerimiz ve yönetim panelimiz %100 mobil uyumlu (responsive) tasarlanmıştır. Müşterileriniz telefonlarından hızlı ve pürüzsüz bir alışveriş deneyimi yaşarlar.'
      },
      {
        q: 'SEO çalışmaları nasıl yapılıyor?',
        a: 'Ödelink, ürünlerinizi Google\'da öne çıkarmak için otomatik meta tag üretimi, sitemap oluşturma ve hızlı yükleme optimizasyonları yapar. Google botları sitenizi kolayca tarayabilir.'
      }
    ]
  },
  {
    category: 'Destek',
    icon: Headphones,
    questions: [
      {
        q: 'Bir sorun yaşarsam kime ulaşabilirim?',
        a: '7/24 e-posta desteği sunuyoruz. Ayrıca Profesyonel plan kullanıcılarımız VIP destek hattımız üzerinden öncelikli yardım alabilirler. Ortalama yanıt süremiz 2 saattir.'
      },
      {
        q: 'Kurulumda yardımcı oluyor musunuz?',
        a: 'Evet, "Kurulum Kılavuzu" sayfamızdaki adımları takip ederek 3 dakikada kendiniz kurabilirsiniz. Zorlanırsanız destek ekibimiz her zaman yanınızdadır.'
      }
    ]
  }
];

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState('Genel-0');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const toggleQuestion = (id) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-24 px-4 relative overflow-hidden">
      {/* Optimized background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[80px] rounded-full will-change-transform" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-red-500/5 blur-[80px] rounded-full will-change-transform" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
          >
            <HelpCircle size={14} /> ŞEFFAF BİLGİ MERKEZİ
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 uppercase italic">AKLINIZA TAKILAN <span className="text-blue-500 not-italic">HER ŞEY</span></h1>
          
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Bir konu arayın (örn: Komisyon, Domain...)"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-8 outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all font-medium text-lg placeholder:text-gray-600 shadow-2xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Sidebar / Categories */}
          <div className="lg:col-span-4 space-y-4">
            {faqs.map((cat, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="w-full flex items-center gap-4 p-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.06] transition-all group will-change-transform"
                onClick={() => {
                  const element = document.getElementById(`category-${cat.category}`);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-blue-500 transition-colors">
                  <cat.icon size={20} />
                </div>
                <span className="text-sm font-bold tracking-widest uppercase text-gray-400 group-hover:text-white">{cat.category}</span>
              </motion.button>
            ))}

            <div className="p-8 bg-blue-600 rounded-[2rem] mt-8 relative overflow-hidden group cursor-pointer" onClick={() => navigate('/contact')}>
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
                <MessageCircle size={100} />
              </div>
              <h3 className="text-xl font-black mb-2 relative z-10 italic">Cevap bulamadınız mı?</h3>
              <p className="text-sm font-medium opacity-80 mb-6 relative z-10">Müşteri temsilcilerimizle anında iletişime geçin.</p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest relative z-10">
                CANLI DESTEK AL <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* FAQ List */}
          <div className="lg:col-span-8 space-y-12">
            {faqs.map((cat, catIdx) => (
              <div key={catIdx} id={`category-${cat.category}`} className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{cat.category}</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {cat.questions.map((item, qIdx) => {
                  const id = `${cat.category}-${qIdx}`;
                  const isOpen = openIndex === id;
                  
                  if (searchTerm && !item.q.toLowerCase().includes(searchTerm.toLowerCase()) && !item.a.toLowerCase().includes(searchTerm.toLowerCase())) return null;

                  return (
                    <motion.div 
                      key={id}
                      className={`overflow-hidden rounded-3xl border transition-all ${isOpen ? 'bg-white/[0.07] border-blue-500/30' : 'bg-white/5 border-white/10'}`}
                    >
                      <button 
                        onClick={() => toggleQuestion(id)}
                        className="w-full flex items-center justify-between p-7 text-left group"
                      >
                        <span className={`text-lg font-bold tracking-tight transition-colors ${isOpen ? 'text-blue-400' : 'text-white group-hover:text-blue-400'}`}>
                          {item.q}
                        </span>
                        <ChevronDown className={`text-gray-500 transition-transform duration-500 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} size={20} />
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                          >
                            <div className="px-7 pb-8 pt-0 text-gray-400 font-medium leading-relaxed border-t border-white/5 mt-0">
                              <div className="pt-6">
                                {item.a}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
