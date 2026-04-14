import React, { useState } from 'react';

const reviews = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    business: 'Teknoloji Mağazası',
    rating: 5,
    date: '10 Nisan 2026',
    text: 'Shopier mağazam için vitrin sitesi arıyordum. Ödelink ile 10 dakikada profesyonel bir site kurdum. Satışlarım %40 arttı! Müşterilerim artık ürünlerimi Google\'da bulabiliyor. Kesinlikle tavsiye ederim.',
    avatar: '👨‍💼'
  },
  {
    id: 2,
    name: 'Zeynep Kaya',
    business: 'El Yapımı Takı',
    rating: 5,
    date: '8 Nisan 2026',
    text: 'Teknik bilgim yoktu ama Ödelink sayesinde çok güzel bir site oluşturdum. Sürükle-bırak editör çok kullanışlı. Shopier entegrasyonu mükemmel çalışıyor. Destek ekibi de çok ilgili.',
    avatar: '👩‍🎨'
  },
  {
    id: 3,
    name: 'Mehmet Demir',
    business: 'Spor Giyim',
    rating: 5,
    date: '5 Nisan 2026',
    text: 'Önceden web tasarım ajansına 20.000 TL ödüyordum. Ödelink ile ayda sadece 399 TL ödüyorum ve daha iyi bir site sahibiyim. SEO optimizasyonu harika, Google\'da ilk sayfadayım.',
    avatar: '🏃‍♂️'
  },
  {
    id: 4,
    name: 'Ayşe Şahin',
    business: 'Organik Kozmetik',
    rating: 5,
    date: '3 Nisan 2026',
    text: 'Mobil uyumluluk mükemmel! Müşterilerimin çoğu telefondan alışveriş yapıyor. Site çok hızlı yükleniyor. Ürün senkronizasyonu otomatik, hiç uğraşmıyorum. Çok memnunum.',
    avatar: '💄'
  },
  {
    id: 5,
    name: 'Can Öztürk',
    business: 'Kitap Satışı',
    rating: 5,
    date: '1 Nisan 2026',
    text: 'Ödelink ile e-ticaret işimi bir üst seviyeye taşıdım. Özel alan adımı bağladım, SSL sertifikası otomatik geldi. Analitik raporlar çok detaylı. Hangi ürünlerin daha çok satıldığını görebiliyorum.',
    avatar: '📚'
  },
  {
    id: 6,
    name: 'Elif Yıldız',
    business: 'Bebek Ürünleri',
    rating: 5,
    date: '28 Mart 2026',
    text: 'Instagram\'da mağazamı tanıtıyordum ama profesyonel bir sitem yoktu. Ödelink ile hem vitrin sitem hem de link toplama sayfam oldu. Tek linkle tüm ürünlerimi paylaşabiliyorum. Harika!',
    avatar: '👶'
  },
  {
    id: 7,
    name: 'Burak Arslan',
    business: 'Elektronik Aksesuar',
    rating: 5,
    date: '25 Mart 2026',
    text: 'Komisyon almıyorlar, bu çok önemli! Sadece aylık abonelik ödüyorum. Satışlarımdan hiçbir kesinti yok. Ayrıca 7 gün ücretsiz deneme sayesinde risk almadan test edebildim.',
    avatar: '🔌'
  },
  {
    id: 8,
    name: 'Selin Aydın',
    business: 'Ev Tekstili',
    rating: 5,
    date: '22 Mart 2026',
    text: 'Tasarım özgürlüğü çok geniş. Logom, renklerim, yazı tiplerim - her şeyi özelleştirebildim. Markanıza uygun benzersiz bir site oluşturabiliyorsunuz. Pro plan\'daki özel CSS desteği harika.',
    avatar: '🏠'
  },
  {
    id: 9,
    name: 'Emre Çelik',
    business: 'Gıda Ürünleri',
    rating: 5,
    date: '20 Mart 2026',
    text: 'Müşteri desteği gerçekten 7/24 çalışıyor. Gece 2\'de soru sordum, 10 dakikada yanıt aldım. Kurulum aşamasında çok yardımcı oldular. Video eğitimler de çok faydalı.',
    avatar: '🍯'
  },
  {
    id: 10,
    name: 'Deniz Kara',
    business: 'Hobi Ürünleri',
    rating: 5,
    date: '18 Mart 2026',
    text: 'Yıllık plan aldım, %20 indirim kazandım. Hem tasarruf ettim hem de öncelikli destek hizmeti aldım. Ödelink ile e-ticaret yapmak çok kolay. Herkese tavsiye ediyorum!',
    avatar: '🎨'
  }
];

const stats = [
  { label: 'Aktif Kullanıcı', value: '2,500+', icon: '👥' },
  { label: 'Ortalama Puan', value: '4.9/5', icon: '⭐' },
  { label: 'Memnuniyet', value: '%98', icon: '😊' },
  { label: 'Toplam Satış', value: '₺12M+', icon: '💰' }
];

const ReviewsPage = () => {
  const [filter, setFilter] = useState('all');

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filter));

  return (
    <div className="min-h-screen gradient-bg pt-20 sm:pt-32 pb-16 px-4">
      <div className="container mx-auto" style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Müşteri Yorumları
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Shopier vitrin sitesi kullanan e-ticaret mağazalarının gerçek deneyimleri
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="card text-center" style={{ borderRadius: 12 }}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Tümü ({reviews.length})
          </button>
          <button
            onClick={() => setFilter('5')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              filter === '5'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            ⭐ 5 Yıldız
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="card hover:shadow-xl transition-all duration-300"
              style={{ borderRadius: 16 }}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{review.avatar}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {review.name}
                  </h3>
                  <p className="text-sm text-gray-600">{review.business}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400">⭐</span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed">
                {review.text}
              </p>

              {/* Verified Badge */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                  ✓ Doğrulanmış Müşteri
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="card inline-block" style={{ borderRadius: 16 }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Siz de başarı hikayenizi yazın
            </h2>
            <p className="text-gray-700 mb-6">
              7 gün ücretsiz deneyin, farkı görün
            </p>
            <a
              href="/auth"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Hemen Başla
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
            <div className="text-white font-semibold">
              🔒 SSL Güvenli
            </div>
            <div className="text-white font-semibold">
              ⚡ Hızlı Kurulum
            </div>
            <div className="text-white font-semibold">
              💳 Komisyonsuz
            </div>
            <div className="text-white font-semibold">
              📱 Mobil Uyumlu
            </div>
            <div className="text-white font-semibold">
              🇹🇷 Türkçe Destek
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
