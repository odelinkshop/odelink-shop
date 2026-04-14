import React, { useState } from 'react';

const blogPosts = [
  {
    id: 1,
    title: 'Shopier Vitrin Sitesi Nedir? Nasıl Kurulur?',
    date: '14 Nisan 2026',
    excerpt: 'Shopier mağazanız için profesyonel vitrin sitesi oluşturmanın tüm püf noktalarını öğrenin.',
    content: `Shopier ile e-ticaret yaparken, ürünlerinizi daha geniş kitlelere ulaştırmak için vitrin sitesine ihtiyacınız var. Ödelink ile 3 dakikada profesyonel bir vitrin sitesi oluşturabilirsiniz.

**Vitrin Sitesi Neden Önemli?**
- Google'da daha iyi sıralama
- Müşteri güvenini artırma
- Profesyonel görünüm
- Sosyal medyada tek link paylaşımı

**Nasıl Başlanır?**
1. Ödelink'e üye olun (Gmail ile hızlı kayıt)
2. Shopier linkinizi girin
3. Logonuzu yükleyin, renklerinizi seçin
4. Yayınlayın!`,
    keywords: ['shopier vitrin sitesi', 'e-ticaret', 'online mağaza']
  },
  {
    id: 2,
    title: 'E-Ticaret SEO: Google\'da Üst Sıralara Çıkmanın 10 Yolu',
    date: '13 Nisan 2026',
    excerpt: 'E-ticaret sitenizi Google aramalarında öne çıkarmak için uygulamanız gereken SEO stratejilerini detaylı şekilde anlattık.',
    content: `E-ticaret başarısının anahtarı görünürlüktür. İşte Google'da üst sıralara çıkmanın kanıtlanmış yolları:

**1. Ürün Sayfalarını Optimize Edin**
Her ürün için benzersiz, anahtar kelime zengin açıklamalar yazın.

**2. Hızlı Yükleme Süresi**
Ödelink gibi optimize edilmiş platformlar kullanın.

**3. Mobil Uyumlu Tasarım**
Müşterilerin %70'i mobil cihazdan alışveriş yapıyor.

**4. Kaliteli Ürün Görselleri**
Yüksek çözünürlüklü, optimize edilmiş görseller kullanın.

**5. Müşteri Yorumları**
Sosyal kanıt SEO için çok önemli.`,
    keywords: ['e-ticaret seo', 'google sıralama', 'online mağaza']
  },
  {
    id: 3,
    title: 'Shopier Mağaza Sitesi Kurmanın Maliyeti',
    date: '12 Nisan 2026',
    excerpt: 'Shopier için vitrin sitesi kurmanın maliyetlerini karşılaştırdık. Ödelink ile uygun fiyatlı çözümler.',
    content: `E-ticaret sitenizi kurarken maliyet önemli bir faktör. İşte farklı seçeneklerin karşılaştırması:

**Geleneksel Web Tasarım Ajansları**
- Kurulum: 15.000 - 50.000 TL
- Aylık bakım: 2.000 - 5.000 TL

**Freelance Geliştiriciler**
- Kurulum: 5.000 - 15.000 TL
- Sürekli destek garantisi yok

**Ödelink ile Shopier Entegrasyonu**
- Kurulum: 3 dakika
- Aylık: 299 TL (Standart) veya 399 TL/yıl (Profesyonel)
- Komisyon yok
- Destek dahil`,
    keywords: ['shopier mağaza maliyeti', 'vitrin sitesi fiyat', 'e-ticaret kurulum']
  },
  {
    id: 4,
    title: 'Online Mağaza Kurma Rehberi 2026',
    date: '11 Nisan 2026',
    excerpt: 'Sıfırdan online mağaza kurmak isteyenler için kapsamlı rehber.',
    content: `2026'da online mağaza kurmak hiç bu kadar kolay olmamıştı. İşte adım adım rehber:

**1. Platform Seçimi**
Shopier gibi yerli platformlar tercih edin.

**2. Vitrin Sitesi Oluşturma**
Ödelink ile profesyonel vitrin sitesi kurun.

**3. Ürün Yükleme**
- Kaliteli fotoğraflar
- Detaylı açıklamalar
- Doğru fiyatlandırma

**4. Ödeme Sistemleri**
Shopier entegrasyonu ile tüm ödeme yöntemleri otomatik.

**5. Pazarlama Stratejisi**
- Sosyal medya reklamları
- Google Ads
- E-posta pazarlama`,
    keywords: ['online mağaza kurma', 'e-ticaret başlangıç', 'shopier kullanımı']
  }
];

const BlogPage = () => {
  const [selectedPost, setSelectedPost] = React.useState(null);

  if (selectedPost) {
    return (
      <div className="min-h-screen gradient-bg pt-20 sm:pt-32 pb-16 px-4">
        <div className="container mx-auto" style={{ maxWidth: 900 }}>
          <button
            onClick={() => setSelectedPost(null)}
            className="mb-6 text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2"
          >
            ← Tüm Yazılar
          </button>
          <article className="card" style={{ borderRadius: 16 }}>
            <div className="mb-4">
              <span className="text-sm text-gray-400">{selectedPost.date}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {selectedPost.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedPost.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <div className="prose prose-lg max-w-none text-gray-300">
              {selectedPost.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <h3 key={idx} className="text-xl font-bold text-white mt-6 mb-3">
                      {paragraph.replace(/\*\*/g, '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  const items = paragraph.split('\n');
                  return (
                    <ul key={idx} className="list-disc pl-6 space-y-2 text-gray-300">
                      {items.map((item, i) => (
                        <li key={i}>{item.replace(/^- /, '')}</li>
                      ))}
                    </ul>
                  );
                }
                if (/^\d+\./.test(paragraph)) {
                  const items = paragraph.split('\n');
                  return (
                    <ol key={idx} className="list-decimal pl-6 space-y-2 text-gray-300">
                      {items.map((item, i) => (
                        <li key={i}>{item.replace(/^\d+\.\s*/, '')}</li>
                      ))}
                    </ol>
                  );
                }
                return (
                  <p key={idx} className="text-gray-300 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pt-20 sm:pt-32 pb-16 px-4">
      <div className="container mx-auto" style={{ maxWidth: 1200 }}>
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            E-Ticaret Blog
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Shopier vitrin sitesi, e-ticaret SEO ve online mağaza yönetimi hakkında güncel içerikler
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              style={{ borderRadius: 16 }}
              onClick={() => setSelectedPost(post)}
            >
              <div className="mb-3">
                <span className="text-sm text-gray-400">{post.date}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 hover:text-blue-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.keywords.slice(0, 3).map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              <div className="text-blue-400 font-medium flex items-center gap-2">
                Devamını Oku →
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
