import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Link as LinkIcon, Palette, BarChart3, ChevronRight, PlayCircle, Book, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const guides = [
  {
    id: 'getting-started',
    title: 'Hızlı Başlangıç',
    icon: Rocket,
    color: '#3B82F6',
    steps: [
      {
        title: 'Gmail ile Tek Tıkla Kayıt',
        content: 'Ödelink\'e üye olmak için karmaşık formlarla uğraşmanıza gerek yok. "Giriş Yap" butonuna tıklayarak Google (Gmail) hesabınızla saniyeler içinde güvenli bir şekilde kaydolun.'
      },
      {
        title: 'Shopier Mağazanızı Bağlayın',
        content: 'Paneldeki "Mağaza Bağla" alanına Shopier kullanıcı adınızı veya tam mağaza linkinizi (magazam.shopier.com) yapıştırın. Sistemimiz otomatik olarak ürünlerinizi tarayacaktır.'
      },
      {
        title: 'Vitrin Tasarımı ve Tema Seçimi',
        content: 'Noir Fashion gibi modern temalarımız arasından seçim yapın. Marka logonuzu yükleyin ve işletmenize en uygun renk paletini belirleyerek tasarımınızı kişiselleştirin.'
      },
      {
        title: 'Anında Yayına Alın',
        content: 'Tasarımınız bittiğinde "Yayınla" butonuna tıklayın. Siteniz saniyeler içinde markaniz.odelink.shop (veya Pro planda kendi domaininiz) üzerinden tüm dünyaya açılsın.'
      }
    ]
  },
  {
    id: 'shopier-integration',
    title: 'Ürün Senkronizasyonu',
    icon: LinkIcon,
    color: '#8B5CF6',
    steps: [
      {
        title: 'Otomatik Ürün Çekme',
        content: 'Shopier mağazanıza yeni bir ürün eklediğinizde veya bir fiyatı değiştirdiğinizde, Ödelink bu değişikliği algılar ve vitrin sitenizde otomatik olarak günceller.'
      },
      {
        title: 'Stok ve Fiyat Yönetimi',
        content: 'Ödelink, Shopier altyapısını referans alır. Stoklarınız bittiğinde ürün sitenizde otomatik olarak "Tükendi" ibaresiyle güncellenir, müşterilerinizi yanıltmazsınız.'
      },
      {
        title: 'Satın Alma Yönlendirmesi',
        content: 'Müşterileriniz ürünlerinizi Ödelink üzerinden inceler. "Satın Al" butonuna tıkladıklarında, doğrudan Shopier\'in güvenli ödeme sayfasına yönlendirilirler.'
      }
    ]
  },
  {
    id: 'design-customization',
    title: 'Marka Kişiselleştirme',
    icon: Palette,
    color: '#EC4899',
    steps: [
      {
        title: 'Kurumsal Renk Paletleri',
        content: 'Sektörünüze uygun hazır renk paletlerinden birini seçin veya kendi özel renklerinizi oluşturun. Tüm düğmeler, başlıklar ve detaylar bu renklere bürünür.'
      },
      {
        title: 'Logo ve Favicon Yönetimi',
        content: 'Marka logonuzu yüksek çözünürlüklü olarak yükleyin. Ödelink, logonuzu hem header hem de footer alanında en ideal boyutta otomatik olarak optimize eder.'
      },
      {
        title: 'Blok Düzenleyici (Sürükle-Bırak)',
        content: 'Hero alanı, ürün listeleri, SSS ve iletişim bloklarının yerlerini panel üzerinden sürükleyerek değiştirebilirsiniz. Sitenizin akışını siz belirlersiniz.'
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Veri ve Analitik',
    icon: BarChart3,
    color: '#10B981',
    steps: [
      {
        title: 'Ziyaretçi İstatistikleri',
        content: 'Panelinizden sitenizin kaç kişi tarafından ziyaret edildiğini, hangi günlerin daha yoğun olduğunu ve ortalama oturum sürelerini takip edin.'
      },
      {
        title: 'En Çok İlgi Gören Ürünler',
        content: 'Hangi ürünlerinizin daha fazla "tıklandığını" görün. Bu sayede pazarlama stratejinizi en popüler ürünlerinize odaklayabilirsiniz.'
      },
      {
        title: 'Profesyonel Plan Raporları',
        content: 'Profesyonel plan kullanıcıları, aylık performans raporlarını detaylı grafiklerle görebilir ve e-ticaret süreçlerini veriye dayalı yönetebilirler.'
      }
    ]
  }
];

const GuidePage = () => {
  const [selectedGuide, setSelectedGuide] = useState(guides[0]);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white py-24 px-4 relative overflow-hidden">
      {/* Optimized background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-5%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[80px] rounded-full opacity-50 will-change-transform" />
        <div className="absolute bottom-[-5%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[80px] rounded-full opacity-50 will-change-transform" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
          >
            <Book size={14} /> ADIM ADIM BAŞARI
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 uppercase italic">ÖDELINK <span className="text-blue-500 not-italic">NASIL KULLANILIR?</span></h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Karmaşık teknik terimler yok. Ödelink ile profesyonel bir e-ticaret sitesine sahip olmak işte bu kadar kolay.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-2 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md">
              {guides.map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                    selectedGuide.id === guide.id ? 'bg-white/10 shadow-lg' : 'hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${guide.color}15`, color: guide.color }}
                    >
                      <guide.icon size={20} />
                    </div>
                    <span className={`font-bold tracking-tight ${selectedGuide.id === guide.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                      {guide.title}
                    </span>
                  </div>
                  {selectedGuide.id === guide.id && <ChevronRight size={18} className="text-blue-500" />}
                </button>
              ))}
            </div>

            <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] mt-8 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
                <PlayCircle size={140} />
              </div>
              <h3 className="text-xl font-black mb-2 relative z-10 italic">VİDEO REHBER</h3>
              <p className="text-sm font-medium opacity-80 mb-6 relative z-10 leading-relaxed">Okumak yerine izlemeyi mi tercih edersiniz? 2 dakikada kurulum videomuzu izleyin.</p>
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all relative z-10">
                VİDEOYU BAŞLAT <PlayCircle size={16} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedGuide.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl"
              >
                <div className="flex items-center gap-6 mb-12">
                  <div 
                    className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl"
                    style={{ backgroundColor: `${selectedGuide.color}20`, color: selectedGuide.color }}
                  >
                    <selectedGuide.icon size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">{selectedGuide.title}</h2>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">GÜNCEL VERSİYON: 2.0</p>
                  </div>
                </div>

                <div className="space-y-8 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[1.15rem] top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500/50 via-white/5 to-transparent hidden md:block" />

                  {selectedGuide.steps.map((step, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative md:pl-16 group"
                    >
                      {/* Step Indicator */}
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-[#050505] border-2 border-blue-500/50 flex items-center justify-center z-10 hidden md:flex group-hover:border-blue-500 group-hover:scale-110 transition-all">
                        <span className="text-blue-500 font-black text-xs">{idx + 1}</span>
                      </div>

                      <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl group-hover:bg-white/[0.05] group-hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                          <CheckCircle2 size={18} className="text-blue-500" />
                          <h3 className="text-xl font-bold text-white tracking-tight">{step.title}</h3>
                        </div>
                        <p className="text-gray-400 font-medium leading-relaxed">
                          {step.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-16 p-8 bg-white/5 border border-white/5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h4 className="text-lg font-bold text-white mb-1 tracking-tight">Kurulumda destek ister misiniz?</h4>
                    <p className="text-gray-500 font-medium text-sm">Ekibimiz mağazanızı kurmanız için 7/24 yanınızda.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/contact')}
                    className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    BİZE MESAJ ATIN <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
