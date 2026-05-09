import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, CheckCircle, Users, TrendingUp, Heart, ShoppingBag, ArrowRight, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const reviews = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    business: 'Retro Teknoloji Mağazası',
    rating: 5,
    date: '10 Nisan 2026',
    text: 'Ödelink Profesyonel planın yıllık sadece 399 TL olması şaka gibi! 10 farklı Shopier mağazam için vitrin sitesi kurdum. Özellikle Google aramalarında ürünlerimin çıkmaya başlaması satışlarımı %40 artırdı. Teşekkürler Ödelink ekibi.',
    avatar: '👨‍💼',
    color: '#3B82F6'
  },
  {
    id: 2,
    name: 'Zeynep Kaya',
    business: 'Atölye Zeynep (Takı & Tasarım)',
    rating: 5,
    date: '8 Nisan 2026',
    text: 'Sadece Instagram biyografimde link paylaşmaktan çok daha fazlası. Müşterilerim artık markamı çok daha profesyonel algılıyor. Komisyonsuz model sayesinde kârım cebimde kalıyor. Kurulum gerçekten de 3 dakika sürdü.',
    avatar: '👩‍🎨',
    color: '#8B5CF6'
  },
  {
    id: 3,
    name: 'Mehmet Demir',
    business: 'Demir Spor Giyim',
    rating: 5,
    date: '5 Nisan 2026',
    text: 'Önceden Shopify veya Wix gibi platformlara binlerce lira ödüyordum. Ödelink hem çok daha ekonomik hem de Shopier ile tam entegre. Stok güncellemelerinin otomatik olması hayatımı kurtardı.',
    avatar: '🏃‍♂️',
    color: '#EF4444'
  },
  {
    id: 4,
    name: 'Ayşe Şahin',
    business: 'Saf Doğa Kozmetik',
    rating: 5,
    date: '3 Nisan 2026',
    text: 'Mobil uyumluluk benim için her şeydi çünkü müşterilerimin %90\'ı mobilden geliyor. Noir Fashion teması telefonlarda harika görünüyor. VIP destek ekibi kurulumda her soruma anında yanıt verdi.',
    avatar: '💄',
    color: '#EC4899'
  },
  {
    id: 5,
    name: 'Can Öztürk',
    business: 'Öztürk Kitabevi',
    rating: 5,
    date: '1 Nisan 2026',
    text: 'Özel alan adı (domain) bağlama özelliği sayesinde sitem tam bir kurumsal kimliğe büründü. Aylık raporlar sayesinde hangi ürünlerimin daha çok tıklandığını takip edebiliyorum. Harika bir analitik paneli var.',
    avatar: '📚',
    color: '#10B981'
  },
  {
    id: 6,
    name: 'Elif Yıldız',
    business: 'Yıldız Bebek Butik',
    rating: 5,
    date: '28 Mart 2026',
    text: 'Ödelink ile tanıştıktan sonra mağaza yönetimim çok kolaylaştı. Ürünlerimi kategorize etmek ve müşterilere şık bir vitrin sunmak satışlarımı doğrudan etkiledi. Komisyonsuz olması ise en büyük artısı.',
    avatar: '👶',
    color: '#F59E0B'
  }
];

const stats = [
  { label: 'Aktif Vitrin', value: '2,500+', icon: Users, color: 'blue' },
  { label: 'Müşteri Puanı', value: '4.9/5', icon: Star, color: 'yellow' },
  { label: 'Yıllık Tasarruf', value: '₺45K+', icon: TrendingUp, color: 'green' },
  { label: 'Mutlu Satıcı', value: '%98', icon: Heart, color: 'red' }
];

const ReviewsPage = () => {
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filter));

  return (
    <div className="min-h-screen bg-[#050505] text-white py-24 px-4 relative overflow-hidden">
      {/* Optimized ambient backgrounds */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[80px] rounded-full will-change-transform" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/5 blur-[80px] rounded-full will-change-transform" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
          >
            <Star size={14} fill="currentColor" /> GERÇEK BAŞARI HİKAYELERİ
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 uppercase italic">BİNLERCE MAĞAZANIN <span className="text-blue-500 not-italic">GÜVENİ</span></h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Shopier satıcıları Ödelink ile nasıl fark yarattı? Gerçek kullanıcılardan gelen tarafsız yorumları inceleyin.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 backdrop-blur-md relative group overflow-hidden will-change-transform"
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon size={100} />
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center mb-6`}>
                <stat.icon size={24} className={`text-${stat.color}-500`} />
              </div>
              <div className="text-3xl font-black mb-1 tracking-tighter">{stat.value}</div>
              <div className="text-gray-500 font-bold text-xs uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-16">
          {['all', '5'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20'
                  : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {f === 'all' ? `TÜM YORUMLAR (${reviews.length})` : '⭐ SADECE 5 YILDIZ'}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((review, idx) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl relative group hover:bg-white/[0.08] transition-all"
              >
                <Quote className="absolute top-8 right-8 text-white/5 group-hover:text-blue-500/10 transition-colors" size={60} />
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-2xl">
                    {review.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg tracking-tight leading-none mb-1">{review.name}</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{review.business}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-500 fill-current" />
                  ))}
                </div>

                <p className="text-gray-300 font-medium leading-relaxed mb-8 relative z-10 italic">
                  "{review.text}"
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">DOĞRULANMIŞ SATICI</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 tracking-widest">{review.date}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-12 md:p-20 bg-gradient-to-br from-blue-600 to-blue-900 rounded-[3rem] text-center relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
              <ShoppingBag size={300} />
            </div>
            <div className="absolute bottom-0 left-0 p-20 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform">
              <MessageSquare size={300} />
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter italic uppercase">SİZİN HİKAYENİZ <span className="text-blue-200 not-italic">NE ZAMAN BAŞLIYOR?</span></h2>
          <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 opacity-90">
            Ödelink Profesyonel ile markanızı bugün büyütün. Yıllık paket avantajıyla komisyonsuz e-ticaretin tadını çıkarın.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <button 
              onClick={() => navigate('/auth')}
              className="px-10 py-5 bg-white text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all shadow-2xl"
            >
              Hemen Kaydol <ArrowRight size={16} className="inline ml-2" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewsPage;
