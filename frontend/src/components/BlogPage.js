import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, ArrowLeft, Tag, BookOpen, Clock, Share2 } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: 'Shopier Satışlarını Artırmanın Sırrı: Profesyonel Vitrin Yönetimi',
    date: '21 Nisan 2026',
    readTime: '6 dk okuma',
    category: 'Strateji',
    excerpt: 'Sadece bir link paylaşmak yetmez. Müşterilerinizin güvenini kazanmak ve dönüşüm oranlarını artırmak için profesyonel bir vitrin şart.',
    content: `E-ticaret dünyasında ilk izlenim her şeydir. Müşterileriniz sadece bir ürün değil, bir deneyim ve güven satın alırlar. İşte profesyonel bir vitrin sitesinin satışlarınıza etkisi:

**Neden Sadece Shopier Linki Yetmez?**
Maalesef sadece ham bir link paylaşmak, markanızın kurumsal kimliğini tam olarak yansıtmaz. Ödelink vitrin sitesi kullanarak müşterilerinize markanızın özel renklerini, logosunu ve düzenli bir katalog yapısını sunarsınız.

**Dönüşüm Oranlarını %40 Artırın**
Yapılan araştırmalar, kendi alan adı veya profesyonel bir arayüz üzerinden alışverişe yönlendirilen kullanıcıların, doğrudan ödeme linkine yönlendirilenlere göre satın alma işlemini tamamlama ihtimalinin %40 daha yüksek olduğunu gösteriyor.

**Ödelink Avantajları:**
- Marka Bilinirliği: Kendi logonuz ve renklerinizle akılda kalın.
- Hız: Modern CDN altyapımızla 1 saniyenin altında yükleme süreleri.
- Kolaylık: Tek bir yönetim panelinden 10'a kadar farklı vitrin sitesi yönetme imkanı (Profesyonel Plan).`,
    keywords: ['Shopier Satış Artırma', 'E-Ticaret Stratejisi', 'Vitrin Sitesi']
  },
  {
    id: 2,
    title: 'Google Aramalarında Görünür Olun: E-Ticaret SEO Rehberi',
    date: '19 Nisan 2026',
    readTime: '7 dk okuma',
    category: 'SEO',
    excerpt: 'Shopier mağazanızın Google\'da bulunmasını ister misiniz? Ödelink altyapısının SEO avantajlarını nasıl kullanacağınızı keşfedin.',
    content: `Çoğu Shopier satıcısının en büyük sorunu, Google aramalarında ürünlerinin çıkmamasıdır. Ödelink bu sorunu kökten çözmek için SEO odaklı bir mimariyle geliştirildi.

**SEO Dostu Mimari Nedir?**
Ödelink, oluşturduğunuz her vitrin sitesi için otomatik olarak "Meta Tag"ler, "Sitemap" ve yapılandırılmış veri şemaları (Schema Markup) oluşturur. Bu, Google botlarının sitenizi anlamasını ve dizine eklemesini kolaylaştırır.

**Anahtar Kelime Odaklı Ürün Listeleme**
Ürünleriniz Shopier'den çekilirken, vitrin sitenizde her ürün için ayrı, SEO uyumlu başlıklar ve açıklamalar otomatik olarak optimize edilir.

**SEO İpuçları:**
- Vitrin sitenizin açıklama kısmına işletmenizle ilgili anahtar kelimeleri ekleyin.
- Profesyonel planda sunulan özel alan adı (domain) özelliğini kullanarak marka otoritenizi artırın.
- Düzenli olarak blog içerikleri paylaşarak (şu an yaptığınız gibi) sitenizin güncelliğini koruyun.`,
    keywords: ['Google SEO', 'E-Ticaret SEO', 'Shopier SEO']
  },
  {
    id: 3,
    title: 'Neden Ödelink? Komisyonsuz E-Ticaretin Geleceği',
    date: '17 Nisan 2026',
    readTime: '4 dk okuma',
    category: 'Finans',
    excerpt: 'Satış başı kesilen yüksek komisyonlardan sıkıldınız mı? Ödelink\'in sabit ücretli modeliyle kâr marjınızı koruyun.',
    content: `E-ticaret platformlarının çoğu, yaptığınız her satıştan %5 ile %20 arasında komisyon keser. Bu durum, özellikle düşük marjlı ürün satan işletmeler için sürdürülebilir değildir.

**Ödelink Modeli: Sabit Ücret, Sıfır Komisyon**
Ödelink bir ödeme aracısı değil, bir teknoloji vitrinidir. Ödemelerinizi yine Shopier üzerinden alırsınız ancak Ödelink bu süreçte sizden ek bir satış komisyonu asla talep etmez.

**Maliyet Karşılaştırması:**
- Geleneksel Pazaryerleri: Satış başı %15 komisyon + İşlem ücreti.
- Ödelink Standart: Aylık sadece 299 TL (Sınırsız satış).
- Ödelink Profesyonel: Yıllık sadece 399 TL (Yıllık paket avantajıyla inanılmaz tasarruf!).

**Kârınızı Korumaya Başlayın**
Özellikle yüksek cirolu mağazalar için Ödelink kullanımı, aylık binlerce lira komisyon tasarrufu anlamına gelir. Sabit maliyetlerle e-ticaret yapmanın rahatlığını yaşayın.`,
    keywords: ['Komisyonsuz E-Ticaret', 'E-Ticaret Maliyetleri', 'Shopier Avantajları']
  },
  {
    id: 4,
    title: '3 Dakikada Profesyonel Mağaza Kurulumu: Adım Adım Rehber',
    date: '15 Nisan 2026',
    readTime: '3 dk okuma',
    category: 'Rehber',
    excerpt: 'Zamanınız değerli. Karmaşık kurulum süreçleriyle uğraşmadan, Shopier mağazanızı nasıl profesyonel bir vitrine dönüştürürsünüz?',
    content: `Teknoloji, işinizi zorlaştırmak için değil, kolaylaştırmak için vardır. Ödelink ile bir e-ticaret sitesi kurmak, sosyal medyada profil oluşturmak kadar basittir.

**Adım 1: Hızlı Kayıt**
Gmail hesabınızla saniyeler içinde giriş yapın. Şifre hatırlama derdi olmadan güvenli bir başlangıç yapın.

**Adım 2: Shopier Linkinizi Bağlayın**
Sadece mağaza linkinizi (magazam.shopier.com) sisteme yapıştırın. Ürünleriniz, açıklamalarınız ve fiyatlarınız otomatik olarak senkronize edilecektir.

**Adım 3: Tasarımı Kişiselleştirin**
Noir Fashion gibi modern temalarımız arasından seçim yapın. Marka logonuzu yükleyin ve kurumsal renklerinizi belirleyin.

**Adım 4: Yayına Alın**
İşleminiz bitti! Artık profesyonel vitrininiz yayında. Linkinizi Instagram biyografinizde, reklamlarınızda ve müşterilerinizle paylaşmaya hazırsınız.`,
    keywords: ['E-Ticaret Kurulum', 'Hızlı Mağaza', 'Shopier Rehberi']
  }
];

const BlogPage = () => {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <div className="min-h-screen bg-[#050505] text-white py-24 px-4 relative overflow-hidden">
      {/* Optimized background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[80px] rounded-full will-change-transform" />
        <div className="absolute bottom-[-5%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[80px] rounded-full will-change-transform" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <AnimatePresence mode="wait">
          {!selectedPost ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-20">
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 uppercase">BİLGİ <span className="text-blue-500">MERKEZİ</span></h1>
                <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                  Ödelink ile e-ticarette uzmanlaşın. Satış artırma, SEO ve marka yönetimi üzerine %100 gerçek stratejiler.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {blogPosts.map((post, idx) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedPost(post)}
                    className="group bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.06] hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden will-change-transform"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="px-4 py-1.5 bg-blue-600/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-600/20">
                          {post.category}
                        </span>
                        <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                          <Clock size={12} /> {post.readTime}
                        </div>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-blue-400 transition-colors tracking-tight">
                        {post.title}
                      </h2>
                      
                      <p className="text-gray-400 font-medium leading-relaxed mb-8 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                          <Calendar size={12} /> {post.date}
                        </div>
                        <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                          TAMAMINI OKU <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 uppercase tracking-widest text-[10px] font-bold"
              >
                <ArrowLeft size={14} /> GERİ DÖN
              </button>

              <div className="mb-12">
                <div className="flex items-center gap-6 mb-8">
                  <span className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {selectedPost.category}
                  </span>
                  <div className="flex items-center gap-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Calendar size={14} /> {selectedPost.date}</span>
                    <span className="flex items-center gap-2"><Clock size={14} /> {selectedPost.readTime}</span>
                  </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[1.1]">
                  {selectedPost.title}
                </h1>

                <div className="flex flex-wrap gap-3 mb-12">
                  {selectedPost.keywords.map((kw, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400">
                      <Tag size={12} /> {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="prose prose-invert prose-blue max-w-none">
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-gray-300 leading-[1.8] text-lg font-medium space-y-8">
                  {selectedPost.content.split('\n\n').map((para, i) => {
                    if (para.startsWith('**')) {
                      return <h2 key={i} className="text-2xl md:text-3xl font-bold text-white pt-4">{para.replace(/\*\*/g, '')}</h2>
                    }
                    if (para.includes('- ')) {
                      return (
                        <ul key={i} className="space-y-4 list-none pl-0">
                          {para.split('\n').map((li, j) => (
                            <li key={j} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 shrink-0" />
                              <span>{li.replace('- ', '')}</span>
                            </li>
                          ))}
                        </ul>
                      )
                    }
                    if (/^\d+\./.test(para)) {
                      return (
                        <div key={i} className="space-y-6">
                          {para.split('\n').map((li, j) => (
                            <div key={j} className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                              <span className="block text-blue-500 font-black text-xs uppercase mb-2">ADIM {li.split('.')[0]}</span>
                              <span className="text-white font-bold">{li.split('.').slice(1).join('.').trim()}</span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    return <p key={i}>{para}</p>
                  })}
                </div>
              </div>

              <div className="mt-16 pt-16 border-t border-white/10 flex items-center justify-between">
                <div className="text-sm text-gray-500 font-bold uppercase tracking-widest text-[10px]">ÖDELINK OFFICIAL BLOG</div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest">
                  <Share2 size={16} /> PAYLAŞ
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BlogPage;
