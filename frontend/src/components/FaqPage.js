import React, { useState } from 'react';

const faqs = [
  {
    category: 'Genel',
    questions: [
      {
        q: 'Ödelink nedir?',
        a: 'Ödelink, Shopier mağazanız için profesyonel vitrin sitesi oluşturmanızı sağlayan bir SaaS platformudur. Ürünlerinizi sergileyebilir, linklerinizi tek sayfada toplayabilir ve e-ticaret sitenizi Google\'da daha görünür hale getirebilirsiniz.'
      },
      {
        q: 'Shopier entegrasyonu nasıl çalışır?',
        a: 'Shopier mağaza linkinizi (örn: magazam.shopier.com) girdiğinizde, ürünleriniz otomatik olarak vitrin sitenizde görünür. API bilgisi gerekmez. Müşterileriniz ürünleri sitenizde görüntüler, satın almak için Shopier\'e yönlendirilir.'
      },
      {
        q: 'Teknik bilgiye ihtiyacım var mı?',
        a: 'Hayır! Ödelink kullanıcı dostu arayüzü sayesinde hiçbir teknik bilgiye ihtiyaç duymadan dakikalar içinde profesyonel bir vitrin sitesi oluşturabilirsiniz. Sürükle-bırak editörümüz ile tasarımınızı kolayca özelleştirebilirsiniz.'
      },
      {
        q: 'Komisyon alıyor musunuz?',
        a: 'Hayır! Ödelink komisyon almaz. Sadece aylık abonelik ücreti ödersiniz. Satışlarınızdan hiçbir kesinti yapılmaz. Tüm gelir size aittir.'
      }
    ]
  },
  {
    category: 'Fiyatlandırma',
    questions: [
      {
        q: 'Hangi ödeme planları var?',
        a: 'Standart (299 TL/ay) ve Profesyonel (399 TL/yıl) planlarımız bulunmaktadır. Standart planda 3 site, Profesyonel planda 10 site oluşturabilirsiniz. Komisyon alınmaz.'
      },
      {
        q: 'Ücretsiz deneme var mı?',
        a: 'Hayır, şu anda ücretsiz deneme sunmuyoruz. Ancak aylık 299 TL ile başlayabilir, istediğiniz zaman iptal edebilirsiniz. İlk ay sonunda otomatik yenileme yapılmaz.'
      },
      {
        q: 'İptal politikanız nedir?',
        a: 'İstediğiniz zaman aboneliğinizi iptal edebilirsiniz. İptal sonrası mevcut dönem sonuna kadar hizmetlerimizden yararlanmaya devam edersiniz. Otomatik yenileme yapılmaz. İade politikası için destek ekibimizle iletişime geçin.'
      },
      {
        q: 'Yıllık ödeme avantajı nedir?',
        a: 'Yıllık ödeme seçeneğinde %20 indirim kazanırsınız. Örneğin Basic plan aylık 199 TL yerine yıllık 1.910 TL olur (2.388 TL yerine). Ayrıca yıllık planlarda öncelikli destek hizmeti sunuyoruz.'
      }
    ]
  },
  {
    category: 'Özellikler',
    questions: [
      {
        q: 'SEO uyumlu mu?',
        a: 'Evet! Ödelink tamamen SEO optimize edilmiştir. Sitemap, meta taglar, yapılandırılmış veri (Schema.org), hızlı yükleme, mobil uyumluluk gibi tüm SEO gereksinimleri karşılanmıştır. Google\'da üst sıralara çıkmanız için gerekli altyapı hazırdır.'
      },
      {
        q: 'Mobil uyumlu mu?',
        a: 'Kesinlikle! Tüm temalarımız mobil öncelikli (mobile-first) yaklaşımla tasarlanmıştır. Siteniz telefon, tablet ve bilgisayarda mükemmel görünür. Müşterilerinizin %70\'i mobil cihazdan alışveriş yaptığı için bu çok önemlidir.'
      },
      {
        q: 'Özel alan adı kullanabilir miyim?',
        a: 'Şu anda özel alan adı özelliği sunmuyoruz. Tüm siteler alt alan adı (ornek.odelink.shop) ile yayınlanır. Gelecekte bu özellik eklenebilir.'
      },
      {
        q: 'Kaç ürün ekleyebilirim?',
        a: 'Shopier mağazanızdaki tüm ürünler otomatik olarak vitrin sitenizde görünür. Ürün sayısı limiti yoktur. Standart planda 3 site, Profesyonel planda 10 site oluşturabilirsiniz.'
      },
      {
        q: 'Tasarımı özelleştirebilir miyim?',
        a: 'Evet! Renk paleti, logo, yazı tipleri, düzen ve daha fazlasını özelleştirebilirsiniz. Pro planda özel CSS/HTML desteği de sunuyoruz. Markanıza uygun benzersiz bir tasarım oluşturabilirsiniz.'
      }
    ]
  },
  {
    category: 'Teknik',
    questions: [
      {
        q: 'Site hızı nasıl?',
        a: 'Ödelink, modern web teknolojileri (React, CDN, görsel optimizasyonu) kullanarak çok hızlı yükleme süreleri sağlar. Ortalama yükleme süresi 1-2 saniyedir. Hızlı siteler hem kullanıcı deneyimini hem de SEO\'yu iyileştirir.'
      },
      {
        q: 'Güvenlik nasıl sağlanıyor?',
        a: 'Tüm siteler ücretsiz SSL sertifikası ile güvenli HTTPS protokolü üzerinden çalışır. Verileriniz şifrelenir. Düzenli güvenlik güncellemeleri yapılır. PCI-DSS uyumlu altyapı kullanılır.'
      },
      {
        q: 'Yedekleme yapılıyor mu?',
        a: 'Evet! Verileriniz günlük olarak otomatik yedeklenir. 30 gün geriye dönük yedek saklanır. Herhangi bir sorun durumunda verilerinizi geri yükleyebiliriz.'
      },
      {
        q: 'Hangi tarayıcıları destekliyorsunuz?',
        a: 'Chrome, Firefox, Safari, Edge ve diğer modern tarayıcıların son 2 versiyonunu destekliyoruz. Mobil tarayıcılar (iOS Safari, Chrome Mobile) tam desteklenir.'
      }
    ]
  },
  {
    category: 'Destek',
    questions: [
      {
        q: 'Destek nasıl alırım?',
        a: 'E-posta, canlı chat ve destek formu üzerinden 7/24 destek alabilirsiniz. Pro plan müşterilerimize öncelikli destek ve telefon desteği sunuyoruz. Ortalama yanıt süremiz 2 saattir.'
      },
      {
        q: 'Kurulum desteği var mı?',
        a: 'Evet! İlk kurulum aşamasında size rehberlik ediyoruz. Shopier entegrasyonu, alan adı bağlama, tasarım özelleştirme gibi konularda adım adım yardımcı oluyoruz.'
      },
      {
        q: 'Eğitim materyalleri var mı?',
        a: 'Evet! Video eğitimler, kullanım kılavuzları ve SSS bölümümüz bulunmaktadır. Ayrıca blog\'umuzda e-ticaret ipuçları ve SEO rehberleri paylaşıyoruz.'
      }
    ]
  }
];

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Genel');

  const toggleQuestion = (categoryIdx, questionIdx) => {
    const key = `${categoryIdx}-${questionIdx}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  const categories = faqs.map(f => f.category);
  const currentFaq = faqs.find(f => f.category === selectedCategory);

  return (
    <div className="min-h-screen gradient-bg pt-20 sm:pt-32 pb-16 px-4">
      <div className="container mx-auto" style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Sıkça Sorulan Sorular
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Shopier vitrin sitesi, e-ticaret mağaza kurulumu ve Ödelink hakkında merak ettikleriniz
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto">
          {currentFaq && currentFaq.questions.map((item, qIdx) => {
            const categoryIdx = faqs.findIndex(f => f.category === selectedCategory);
            const key = `${categoryIdx}-${qIdx}`;
            const isOpen = openIndex === key;

            return (
              <div
                key={qIdx}
                className="card mb-4"
                style={{ borderRadius: 12 }}
              >
                <button
                  onClick={() => toggleQuestion(categoryIdx, qIdx)}
                  className="w-full text-left flex items-start justify-between gap-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {item.q}
                  </h3>
                  <span className={`text-2xl text-blue-600 transition-transform ${isOpen ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="card inline-block" style={{ borderRadius: 16 }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Sorunuz yanıtlanmadı mı?
            </h2>
            <p className="text-gray-700 mb-6">
              Destek ekibimiz size yardımcı olmak için hazır
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              İletişime Geçin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
