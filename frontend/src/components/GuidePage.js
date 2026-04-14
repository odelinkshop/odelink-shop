import React, { useState } from 'react';

const guides = [
  {
    id: 'getting-started',
    title: 'Başlangıç Rehberi',
    icon: '🚀',
    steps: [
      {
        title: '1. Hesap Oluşturma',
        content: 'Ödelink\'e üye olmak için Gmail hesabınızla giriş yapın. Güvenliğiniz için sadece Gmail adresleri kabul edilmektedir. Kayıt işlemi 30 saniyeden kısa sürer.'
      },
      {
        title: '2. Shopier Linkinizi Girin',
        content: 'Shopier mağaza linkinizi (örn: magazam.shopier.com) girin. Sistem otomatik olarak ürünlerinizi çekecektir. API bilgisi gerekmez, sadece mağaza linkiniz yeterli.'
      },
      {
        title: '3. Site Tasarımı',
        content: 'Logonuzu yükleyin, renk paletinizi seçin (mavi, mor, yeşil, amber). Blokları sürükle-bırak ile düzenleyin. Değişikliklerinizi anında önizleyebilirsiniz.'
      },
      {
        title: '4. Yayınlama',
        content: '"Yayınla" butonuna tıklayın. Siteniz anında yayına alınır. Alt alan adınız otomatik oluşturulur (ornek.odelink.shop).'
      }
    ]
  },
  {
    id: 'shopier-integration',
    title: 'Shopier Entegrasyonu',
    icon: '🔗',
    steps: [
      {
        title: 'Mağaza Linki ile Bağlantı',
        content: 'Shopier mağaza linkinizi (magazam.shopier.com) girin. Sistem otomatik olarak ürünlerinizi çeker. API bilgisi gerekmez.'
      },
      {
        title: 'Ürün Gösterimi',
        content: 'Ürünleriniz otomatik olarak vitrin sitenizde görünür. Müşteriler ürüne tıkladığında Shopier\'e yönlendirilir ve satın alma işlemini orada tamamlar.'
      },
      {
        title: 'Güvenli Bağlantı',
        content: 'Tüm veriler şifrelenerek saklanır. Sadece ürün bilgilerinizi göstermek için kullanılır. Satış işlemleri Shopier üzerinden gerçekleşir.'
      }
    ]
  },
  {
    id: 'design-customization',
    title: 'Tasarım Özelleştirme',
    icon: '🎨',
    steps: [
      {
        title: 'Renk Paleti',
        content: 'Markanıza uygun renk paletini seçin: Mavi, Mor, Yeşil veya Amber. Renk değişiklikleri tüm sitede otomatik uygulanır.'
      },
      {
        title: 'Logo Yükleme',
        content: 'Logonuzu yükleyin (PNG, JPG, SVG desteklenir). Logo boyutlandırma otomatiktir. Maksimum dosya boyutu: 2MB.'
      },
      {
        title: 'Blok Düzenleme',
        content: 'Hero, ürünler, koleksiyonlar, özellikler, SSS, iletişim gibi blokları sürükle-bırak ile yeniden sıralayın. İstediğiniz blokları ekleyin veya kaldırın.'
      },
      {
        title: 'İçerik Düzenleme',
        content: 'Her bloğun içeriğini düzenleyebilirsiniz. Başlıklar, açıklamalar, buton metinleri tamamen özelleştirilebilir.'
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
        content: 'Günlük, haftalık, aylık ziyaretçi sayıları. Benzersiz ziyaretçi ve sayfa görüntüleme istatistikleri.'
      },
      {
        title: 'Ürün Performansı',
        content: 'En çok görüntülenen ürünler. Hangi ürünlerin daha fazla ilgi gördüğünü takip edin.'
      },
      {
        title: 'Trafik Kaynakları',
        content: 'Ziyaretçilerinizin nereden geldiğini görün. Sosyal medya, direkt trafik, arama motorları.'
      },
      {
        title: 'Aylık Raporlar (Profesyonel Plan)',
        content: 'Profesyonel planda aylık raporları JSON formatında indirebilirsiniz. Detaylı analiz için raporları arşivleyebilirsiniz.'
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
