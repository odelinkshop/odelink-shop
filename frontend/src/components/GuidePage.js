import React, { useState } from 'react';

const guides = [
  {
    id: 'getting-started',
    title: 'Başlangıç Rehberi',
    icon: '🚀',
    steps: [
      {
        title: '1. Hesap Oluşturma',
        content: 'Ödelink\'e üye olmak için Gmail hesabınızla giriş yapabilir veya e-posta ile kayıt olabilirsiniz. Güvenliğiniz için sadece Gmail adresleri kabul edilmektedir. Kayıt işlemi 30 saniyeden kısa sürer.'
      },
      {
        title: '2. Shopier API Bilgilerini Alma',
        content: 'Shopier hesabınıza giriş yapın. Ayarlar > API bölümünden API Key ve API Secret bilgilerinizi kopyalayın. Bu bilgiler ürünlerinizin otomatik senkronizasyonu için gereklidir.'
      },
      {
        title: '3. Shopier Entegrasyonu',
        content: 'Ödelink panelinde "Shopier Bağla" butonuna tıklayın. API Key ve API Secret bilgilerinizi yapıştırın. "Bağlan" butonuna basın. Ürünleriniz otomatik olarak yüklenecektir.'
      },
      {
        title: '4. Site Tasarımı',
        content: 'Hazır temalarımızdan birini seçin veya sıfırdan tasarlayın. Logo, renk paleti, yazı tipleri ve düzeni özelleştirin. Değişikliklerinizi anında önizleyebilirsiniz.'
      },
      {
        title: '5. Yayınlama',
        content: '"Yayınla" butonuna tıklayın. Siteniz anında yayına alınır. Ücretsiz alt alan adı (ornek.odelink.shop) veya kendi alan adınızı kullanabilirsiniz.'
      }
    ]
  },
  {
    id: 'shopier-integration',
    title: 'Shopier Entegrasyonu',
    icon: '🔗',
    steps: [
      {
        title: 'API Bilgilerini Bulma',
        content: 'Shopier panelinde sağ üst köşedeki profil ikonuna tıklayın. "Ayarlar" menüsüne girin. Sol menüden "API" sekmesini seçin. "API Key" ve "API Secret" bilgilerinizi göreceksiniz.'
      },
      {
        title: 'Güvenli Bağlantı',
        content: 'API bilgileriniz şifrelenerek saklanır. Hiçbir zaman üçüncü kişilerle paylaşılmaz. Sadece ürün bilgilerinizi çekmek için kullanılır. Satış işlemleri Shopier üzerinden gerçekleşir.'
      },
      {
        title: 'Otomatik Senkronizasyon',
        content: 'Ürün bilgileri her 15 dakikada bir otomatik güncellenir. Stok, fiyat, açıklama değişiklikleri anında yansır. Manuel senkronizasyon da yapabilirsiniz.'
      },
      {
        title: 'Ürün Yönetimi',
        content: 'Hangi ürünlerin gösterileceğini seçebilirsiniz. Ürün sıralamasını değiştirebilirsiniz. Kategorilere göre filtreleme yapabilirsiniz.'
      }
    ]
  },
  {
    id: 'design-customization',
    title: 'Tasarım Özelleştirme',
    icon: '🎨',
    steps: [
      {
        title: 'Tema Seçimi',
        content: 'Modern, Minimal, Klasik ve Renkli temalarımız bulunmaktadır. Her tema mobil uyumlu ve SEO optimize edilmiştir. Temalar arasında tek tıkla geçiş yapabilirsiniz.'
      },
      {
        title: 'Renk Paleti',
        content: 'Markanıza uygun renk paletini seçin. Ana renk, vurgu rengi ve arka plan renklerini özelleştirin. Renk değişiklikleri tüm sitede otomatik uygulanır.'
      },
      {
        title: 'Logo ve Favicon',
        content: 'Logonuzu yükleyin (PNG, JPG, SVG desteklenir). Favicon otomatik oluşturulur. Logo boyutlandırma otomatiktir.'
      },
      {
        title: 'Yazı Tipleri',
        content: 'Google Fonts kütüphanesinden 1000+ yazı tipi seçebilirsiniz. Başlık ve metin için farklı fontlar kullanabilirsiniz. Türkçe karakter desteği garantilidir.'
      },
      {
        title: 'Düzen Ayarları',
        content: 'Ürün kartı düzeni (grid/list), sayfa genişliği, boşluklar ve daha fazlasını ayarlayın. Mobil ve masaüstü için ayrı ayarlar yapabilirsiniz.'
      }
    ]
  },
  {
    id: 'seo-optimization',
    title: 'SEO Optimizasyonu',
    icon: '📈',
    steps: [
      {
        title: 'Meta Bilgileri',
        content: 'Site başlığı, açıklama ve anahtar kelimeler girin. Her sayfa için özel meta taglar ekleyin. Karakter limitlerine uygun yazın (başlık 60, açıklama 160 karakter).'
      },
      {
        title: 'URL Yapısı',
        content: 'SEO dostu URL\'ler otomatik oluşturulur. Türkçe karakterler otomatik İngilizce\'ye çevrilir. Kısa ve anlamlı URL\'ler kullanın.'
      },
      {
        title: 'Sitemap ve Robots.txt',
        content: 'Sitemap otomatik oluşturulur ve güncellenir. Robots.txt dosyası optimize edilmiştir. Google Search Console\'a sitemap\'inizi ekleyin.'
      },
      {
        title: 'Hız Optimizasyonu',
        content: 'Görseller otomatik optimize edilir. CDN kullanılır. Lazy loading aktiftir. Ortalama yükleme süresi 1-2 saniyedir.'
      },
      {
        title: 'Mobil Uyumluluk',
        content: 'Tüm sayfalar mobil öncelikli tasarlanmıştır. Google Mobile-Friendly Test\'ten tam puan alır. Touch-friendly butonlar ve menüler.'
      }
    ]
  },
  {
    id: 'domain-setup',
    title: 'Alan Adı Kurulumu',
    icon: '🌐',
    steps: [
      {
        title: 'Alan Adı Satın Alma',
        content: 'Türkiye\'de: Natro, Turhost, İsimtescil gibi firmalardan .com.tr veya .com alan adı alabilirsiniz. Yıllık maliyet 50-200 TL arasındadır.'
      },
      {
        title: 'DNS Ayarları',
        content: 'Alan adı sağlayıcınızın panelinde DNS ayarlarına gidin. A kaydı ekleyin, IP adresimizi girin. CNAME kaydı ekleyin, www için yönlendirme yapın.'
      },
      {
        title: 'SSL Sertifikası',
        content: 'SSL sertifikası otomatik ve ücretsiz sağlanır. Let\'s Encrypt kullanılır. Sertifika otomatik yenilenir. HTTPS zorunludur.'
      },
      {
        title: 'Yönlendirme Testi',
        content: 'Alan adı yönlendirmesi 24-48 saat içinde aktif olur. www ve www olmayan versiyonlar otomatik yönlendirilir. Test için ping ve nslookup kullanabilirsiniz.'
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analitik ve Raporlama',
    icon: '📊',
    steps: [
      {
        title: 'Ziyaretçi Takibi',
        content: 'Günlük, haftalık, aylık ziyaretçi sayıları. Benzersiz ziyaretçi ve sayfa görüntüleme. Ortalama oturum süresi ve hemen çıkma oranı.'
      },
      {
        title: 'Ürün Performansı',
        content: 'En çok görüntülenen ürünler. Tıklama oranları (CTR). Sepete ekleme ve satın alma dönüşümleri.'
      },
      {
        title: 'Trafik Kaynakları',
        content: 'Organik arama, sosyal medya, direkt trafik. Hangi anahtar kelimelerle bulunuyorsunuz. Yönlendiren siteler (referral).'
      },
      {
        title: 'Google Analytics Entegrasyonu',
        content: 'Google Analytics ID\'nizi ekleyin. Gelişmiş raporlama için GA4 kullanın. E-ticaret takibi aktif edilir.'
      }
    ]
  }
];

const GuidePage = () => {
  const [selectedGuide, setSelectedGuide] = useState(guides[0]);

  return (
    <div className="min-h-screen gradient-bg pt-20 sm:pt-32 pb-16 px-4">
      <div className="container mx-auto" style={{ maxWidth: 1400 }}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Kullanım Kılavuzu
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Shopier vitrin sitesi kurulumu, e-ticaret mağaza yönetimi ve SEO optimizasyonu için adım adım rehber
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24" style={{ borderRadius: 16 }}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Rehberler</h2>
              <div className="space-y-2">
                {guides.map((guide) => (
                  <button
                    key={guide.id}
                    onClick={() => setSelectedGuide(guide)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedGuide.id === guide.id
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{guide.icon}</span>
                    {guide.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="card" style={{ borderRadius: 16 }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{selectedGuide.icon}</span>
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedGuide.title}
                </h2>
              </div>

              <div className="space-y-6">
                {selectedGuide.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="border-l-4 border-blue-500 pl-6 py-2"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {step.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Tutorial CTA */}
            <div className="card mt-6" style={{ borderRadius: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-3">
                  📹 Video Eğitimler
                </h3>
                <p className="mb-4 opacity-90">
                  Görsel öğrenmeyi mi tercih ediyorsunuz? Video eğitimlerimizle adım adım öğrenin.
                </p>
                <button className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                  Video Eğitimleri İzle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="card inline-block" style={{ borderRadius: 16 }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Yardıma mı ihtiyacınız var?
            </h2>
            <p className="text-gray-700 mb-6">
              Destek ekibimiz size yardımcı olmak için 7/24 hazır
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/contact"
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Destek Al
              </a>
              <a
                href="/faq"
                className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                SSS
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
