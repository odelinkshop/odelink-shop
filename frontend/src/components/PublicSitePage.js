import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Clock, 
  X, 
  Loader2, 
  CheckCircle2,
  Package,
  Phone,
  User,
  Mail,
  ChevronRight,
  Plus,
  Minus,
  ShoppingCart,
  Search,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getApiBase = () => {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:5000';
  return '';
};

const API_BASE = getApiBase();

export default function PublicSitePage() {
  const { subdomain } = useParams();
  const [site, setSite] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Tümü']);
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Product Detail State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sites/public-by-host`, {
          headers: {
            'Host': window.location.host,
            'x-forwarded-host': window.location.host
          }
        });
        if (!res.ok) throw new Error('Site bulunamadı');
        const data = await res.json();
        setSite(data.site);
        setProducts(data.products || []);
        
        // Extract unique categories
        const uniqueCats = ['Tümü', ...new Set(data.products.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCats);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSiteData();
  }, [subdomain]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.discount_price || item.price) * item.quantity), 0);

  const filteredProducts = activeCategory === 'Tümü' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-white animate-spin" />
    </div>
  );

  if (error || !site) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#F2EBE1] p-8">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-serif mb-6 tracking-tighter">404</h1>
        <p className="text-xs opacity-40 uppercase tracking-[0.4em] leading-relaxed">Aristokratik dükkan arayışınız sonuçsuz kaldı. Lütfen adresi kontrol edin.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2EBE1] font-sans selection:bg-white/30">
      {/* Dynamic Navigation */}
      <nav className="sticky top-0 z-[80] bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 py-6 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-serif tracking-tight cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            {site.name}
          </h1>
          
          <div className="hidden md:flex items-center gap-8">
            {categories.slice(0, 5).map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeCategory === cat ? 'text-white' : 'text-white/40 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-white/60 hover:text-white transition-colors"
          >
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-[#0A0A0A] text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0A0A0A]">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-32 px-8 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/50 to-[#0A0A0A]" />
        
        <div className="relative z-10 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 text-white"
          >
            <div className="h-px w-8 bg-white/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.6em]">Premium Collection</span>
            <div className="h-px w-8 bg-white/30" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl sm:text-8xl font-serif tracking-tight"
          >
            {site.name}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs uppercase tracking-[0.4em] text-white/40 max-w-xl mx-auto leading-loose"
          >
            Sizin için özenle küratörlüğü yapılmış, sınırlı sayıda üretilen kurumsal seçki.
          </motion.p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-20">
        {/* Category Subnav */}
        <div className="flex flex-wrap items-center gap-4 mb-16 border-b border-white/5 pb-8">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest border transition-all ${activeCategory === cat ? 'bg-white text-[#0A0A0A] border-white' : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-40 text-center bg-white/[0.01] border border-dashed border-white/5">
            <Package size={64} className="mx-auto mb-6 text-white/10" />
            <p className="text-[10px] uppercase tracking-[0.5em] font-black text-white/30">Koleksiyon Hazırlanıyor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {filteredProducts.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div 
                  className="aspect-[4/5] bg-white/[0.02] border border-white/5 relative overflow-hidden mb-8 cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(product);
                    setActiveImageIndex(0);
                  }}
                >
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10"><ShoppingBag size={80} /></div>
                  )}
                  
                  {/* Status Badge */}
                  {product.stock_count < 10 && product.stock_count > 0 && (
                    <div className="absolute top-6 left-6 bg-red-600 text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-widest">Son Ürünler</div>
                  )}

                  <div className="absolute inset-0 bg-[#0A0A0A]/60 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm flex items-center justify-center">
                    <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         addToCart(product);
                       }}
                       className="bg-white text-[#0A0A0A] px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
                    >
                      Sepete Ekle
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <h3 
                      className="text-2xl font-serif group-hover:text-white transition-colors cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.title}
                    </h3>
                    <div className="text-right">
                       {product.discount_price ? (
                         <div className="flex flex-col">
                            <span className="text-[10px] text-white/30 line-through font-bold">{product.price} TL</span>
                            <span className="text-lg font-black text-white">{product.discount_price} TL</span>
                         </div>
                       ) : (
                         <span className="text-lg font-black text-white/60">{product.price} TL</span>
                       )}
                    </div>
                  </div>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">{product.category || 'GENEL'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Trust Features */}
      <section className="bg-white/[0.01] border-y border-white/5 py-32 mt-20">
        <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-3 gap-20">
          {[
            { icon: ShieldCheck, title: 'Güvenli Altyapı', sub: 'Endüstri Standardı Şifreleme' },
            { icon: Truck, title: 'Hızlı Teslimat', sub: 'Öncelikli Kargo Hizmeti' },
            { icon: Clock, title: 'Elit Destek', sub: 'Size Özel Müşteri Temsilcisi' }
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-6 group">
              <div className="w-16 h-16 bg-white/[0.03] border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#0A0A0A] transition-all duration-500">
                <f.icon size={24} />
              </div>
              <div>
                <h4 className="text-xl font-serif mb-2 tracking-tight">{f.title}</h4>
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-black">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 text-center opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">&copy; 2026 {site.name} — Odelink Powered Store</p>
      </footer>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0D0D0D] z-[160] shadow-2xl border-l border-white/5 flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-serif">Sepetim</h3>
                  <p className="text-[9px] uppercase tracking-widest text-white font-black mt-1">{cart.length} Ürün</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-white/20 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                    <ShoppingBag size={48} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Sepetiniz Boş</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-6 group">
                      <div className="w-24 h-32 bg-white/5 flex-shrink-0 overflow-hidden border border-white/10">
                         <img src={item.images?.[0]} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-grow space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest">{item.title}</h4>
                            <p className="text-[9px] text-white/30 font-black uppercase mt-1">{item.category}</p>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-white/20 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                           <div className="flex items-center border border-white/10">
                              <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-white/5 text-white/40"><Minus size={12} /></button>
                              <span className="px-4 text-[10px] font-black">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-white/5 text-white/40"><Plus size={12} /></button>
                           </div>
                           <span className="text-sm font-bold text-white">{parseFloat(item.discount_price || item.price) * item.quantity} TL</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Toplam Tutar</span>
                  <span className="text-2xl font-serif text-white">{cartTotal.toFixed(2)} TL</span>
                </div>
                <button 
                  disabled={cart.length === 0}
                  className="w-full bg-white text-[#0A0A0A] py-5 font-black uppercase tracking-[0.3em] text-[11px] hover:bg-white transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                >
                  Siparişi Onayla <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 md:px-10 overflow-y-auto py-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-[#0A0A0A]/98 backdrop-blur-2xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 50 }}
              className="bg-[#111] border border-white/10 w-full max-w-6xl relative z-10 flex flex-col md:grid md:grid-cols-2 max-h-[90vh] overflow-hidden shadow-2xl"
            >
              {/* Image Gallery */}
              <div className="bg-[#0D0D0D] p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                <div className="aspect-[4/5] bg-white/[0.02] border border-white/5 overflow-hidden">
                  <img src={selectedProduct.images?.[activeImageIndex]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {selectedProduct.images?.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`aspect-square border-2 transition-all overflow-hidden ${activeImageIndex === idx ? 'border-white' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-12 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[8px] font-black text-white uppercase tracking-[0.4em]">{selectedProduct.category || 'GENEL'}</span>
                      {selectedProduct.sku && <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">SKU: {selectedProduct.sku}</span>}
                    </div>
                    <h3 className="text-4xl font-serif tracking-tight">{selectedProduct.title}</h3>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="text-white/20 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="mb-10">
                  {selectedProduct.discount_price ? (
                    <div className="flex items-center gap-4">
                       <span className="text-3xl font-serif text-white">{selectedProduct.discount_price} TL</span>
                       <span className="text-lg text-white/20 line-through font-bold">{selectedProduct.price} TL</span>
                       <span className="bg-red-600/20 text-red-500 text-[10px] font-black px-2 py-1 uppercase tracking-tighter">İndirimli Ürün</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-serif text-white/60">{selectedProduct.price} TL</span>
                  )}
                </div>

                <div className="space-y-8 flex-grow">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Ürün Açıklaması</h4>
                    <p className="text-sm text-white/40 leading-relaxed font-medium">
                      {selectedProduct.description || 'Bu ürün için detaylı bir açıklama henüz eklenmemiştir.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                     <div className="space-y-2">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Teslimat</span>
                        <p className="text-[10px] font-bold text-white/60 uppercase">2-4 İş Günü</p>
                     </div>
                     <div className="space-y-2">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">İade Koşulu</span>
                        <p className="text-[10px] font-bold text-white/60 uppercase">14 Gün İçinde</p>
                     </div>
                  </div>
                </div>

                <div className="mt-12 flex gap-4 sticky bottom-0 bg-[#111] pt-4">
                  <button 
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex-grow bg-white text-[#0A0A0A] py-6 font-black uppercase tracking-[0.3em] text-xs hover:bg-white transition-all flex items-center justify-center gap-3 shadow-2xl shadow-white/20"
                  >
                    <Plus size={18} /> Sepete Ekle
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
