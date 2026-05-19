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
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('nova_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Product Detail State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);



  useEffect(() => {
    localStorage.setItem('nova_cart', JSON.stringify(cart));
  }, [cart]);

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

  const handleShopierDirectCheckout = async (product) => {
    if (!product || !product.shopier_url) {
      alert('Bu ürün için ödeme linki tanımlanmamış.');
      return;
    }

    try {
      const urlStr = product.shopier_url.trim();
      const apiUrl = `${API_BASE}/api/payments/shopier-checkout-data?url=${encodeURIComponent(urlStr)}&size=${encodeURIComponent(product.selectedSize || '')}`;
      
      const response = await fetch(apiUrl);
      const resData = await response.json();

      if (resData.success && resData.shopName && resData.productId) {
        console.log('🚀 Redirecting directly to Shopier Shipping form:', resData);
        
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `https://www.shopier.com/s/shipping/${resData.shopName}`;
        
        const inputId = document.createElement('input');
        inputId.type = 'hidden';
        inputId.name = 'product_id';
        inputId.value = resData.productId;
        form.appendChild(inputId);

        if (resData.variationId) {
          const inputSize = document.createElement('input');
          inputSize.type = 'hidden';
          inputSize.name = 'size';
          inputSize.value = resData.variationId;
          form.appendChild(inputSize);

          const inputVarName = document.createElement('input');
          inputVarName.type = 'hidden';
          inputVarName.name = 'first_variation_name';
          inputVarName.value = resData.variationName || 'Beden ';
          form.appendChild(inputVarName);

          const inputVarId = document.createElement('input');
          inputVarId.type = 'hidden';
          inputVarId.name = 'first_variation_id';
          inputVarId.value = '0';
          form.appendChild(inputVarId);
        }

        const inputQty = document.createElement('input');
        inputQty.type = 'hidden';
        inputQty.name = 'quantity';
        inputQty.value = String(product.quantity || 1);
        form.appendChild(inputQty);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        return;
      }
    } catch (err) {
      console.error('Error in Shopier direct checkout fetch:', err);
    }

    // Fallback: direct redirect
    window.location.href = product.shopier_url;
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    handleShopierDirectCheckout(cart[0]);
  };

  const filteredProducts = activeCategory === 'Tümü' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center space-y-6">
      <div className="w-16 h-16 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">Nova Yükleniyor</span>
    </div>
  );

  if (error || !site) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#F2EBE1] p-8">
      <div className="text-center max-w-md space-y-8">
        <h1 className="text-8xl font-serif mb-6 tracking-tighter opacity-10">404</h1>
        <p className="text-[11px] opacity-40 uppercase tracking-[0.4em] leading-relaxed font-black">
          Aradığınız mağaza sistemimizde bulunamadı.
        </p>
        <button onClick={() => window.location.reload()} className="px-10 py-5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Sistemi Yenile</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2EBE1] font-sans selection:bg-white selection:text-black overflow-x-hidden">
      {/* Dynamic Navigation */}
      <nav className="sticky top-0 z-[80] bg-[#0A0A0A]/90 backdrop-blur-3xl border-b border-white/5 py-6 px-6 sm:px-12">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight cursor-pointer uppercase" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            {site.name}
          </h1>
          
          <div className="hidden lg:flex items-center gap-12">
            {categories.slice(0, 6).map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeCategory === cat ? 'text-white border-b border-white pb-1' : 'text-white/30 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-white hover:text-black transition-all group"
            >
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#0A0A0A] text-[9px] font-black w-6 h-6 flex items-center justify-center border-2 border-[#0A0A0A] shadow-xl group-hover:bg-black group-hover:text-white group-hover:border-white transition-all">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-40 sm:py-60 px-8 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/50 to-[#0A0A0A]" />
        
        <div className="relative z-10 space-y-10 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-6 text-white"
          >
            <div className="h-px w-12 bg-white/20" />
            <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white/60">Nova Collections 2026</span>
            <div className="h-px w-12 bg-white/20" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl sm:text-8xl md:text-9xl font-serif tracking-tight leading-[0.9] italic"
          >
            {site.name}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[11px] sm:text-[13px] uppercase tracking-[0.4em] text-white/30 max-w-2xl mx-auto leading-loose font-bold"
          >
            Nova SaaS platformu üzerinden oluşturulan kurumsal mağaza seçkisi.
          </motion.p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 sm:px-12 py-32">
        {/* Category Navigation - Centered and Premium */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-32 border-b border-white/5 pb-16">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all rounded-sm ${activeCategory === cat ? 'bg-white text-black shadow-2xl' : 'bg-white/5 border border-white/10 text-white/40 hover:border-white/30 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-60 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-sm group">
            <div className="w-24 h-24 border border-white/5 flex items-center justify-center mx-auto mb-10 group-hover:border-white/20 transition-all">
               <Package size={64} className="text-white/10 group-hover:text-white/30 transition-all" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.5em] font-black text-white/20">Koleksiyon Hazırlanıyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {filteredProducts.map((product, i) => {
              const validImages = (product.images || []).filter(img => typeof img === 'string' && img.trim() !== '');
              return (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative"
                >
                  <div 
                    className="aspect-[4/5] bg-white/[0.02] border border-white/5 relative overflow-hidden mb-10 cursor-pointer rounded-sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setActiveImageIndex(0);
                    }}
                  >
                    {validImages[0] ? (
                      <img src={validImages[0]} alt={product.title} className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-5"><ShoppingBag size={100} /></div>
                    )}
                    
                    {/* Luxury Badges */}
                    <div className="absolute top-8 left-8 flex flex-col gap-3">
                       {product.stock_count < 5 && product.stock_count > 0 && (
                          <div className="bg-red-600 text-white text-[9px] font-black px-4 py-2 uppercase tracking-widest shadow-2xl">SON ÜRÜNLER</div>
                       )}
                       {product.discount_price && (
                          <div className="bg-white text-black text-[9px] font-black px-4 py-2 uppercase tracking-widest shadow-2xl">ÖZEL İNDİRİM</div>
                       )}
                    </div>

                    <div className="absolute inset-0 bg-[#0A0A0A]/60 opacity-0 group-hover:opacity-100 transition-all duration-700 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
                      <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           addToCart(product);
                         }}
                         className="bg-white text-[#0A0A0A] w-64 py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#F2EBE1] transition-all transform translate-y-8 group-hover:translate-y-0 duration-700 shadow-2xl"
                      >
                        Sepete Ekle
                      </button>
                      <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleShopierDirectCheckout(product);
                         }}
                         className="bg-transparent border border-white text-white w-64 py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all transform translate-y-8 group-hover:translate-y-0 duration-700 delay-75 shadow-2xl"
                      >
                        Hemen Al
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 px-2">
                    <div className="flex items-start justify-between gap-6">
                      <h3 
                        className="text-3xl font-serif tracking-tight group-hover:text-white transition-colors cursor-pointer leading-tight"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {product.title}
                      </h3>
                      <div className="text-right shrink-0">
                         {product.discount_price ? (
                           <div className="flex flex-col gap-1">
                              <span className="text-[11px] text-white/20 line-through font-bold tracking-tighter">{product.price} TL</span>
                              <span className="text-2xl font-serif text-white">{product.discount_price} TL</span>
                           </div>
                         ) : (
                           <span className="text-2xl font-serif text-white/50">{product.price} TL</span>
                         )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">{product.category || 'NOVA SEÇKİ'}</span>
                      <button onClick={() => setSelectedProduct(product)} className="text-[10px] font-black text-white/40 hover:text-white transition-all uppercase tracking-widest flex items-center gap-3">
                         DETAY <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Trust Features Grid */}
      <section className="bg-white/[0.01] border-y border-white/5 py-40">
        <div className="max-w-[1600px] mx-auto px-12 grid grid-cols-1 md:grid-cols-3 gap-32">
          {[
            { icon: ShieldCheck, title: 'Güvenli Altyapı', sub: 'Nova Şifreleme Standartları' },
            { icon: Truck, title: 'Özel Lojistik', sub: '24 Saat İçinde Kargolama' },
            { icon: Clock, title: '7/24 Öncelikli Destek', sub: 'Kişisel Danışman Hizmeti' }
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-8 group">
              <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:bg-white group-hover:text-[#0A0A0A] group-hover:border-white transition-all duration-700 shadow-2xl">
                <f.icon size={32} strokeWidth={1.5} />
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-serif tracking-tight italic">{f.title}</h4>
                <p className="text-[11px] uppercase tracking-[0.4em] text-white/20 font-black">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Global Footer */}
      <footer className="py-32 px-8 text-center">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex items-center justify-center gap-8 opacity-10">
             <div className="h-px w-20 bg-white" />
             <h1 className="text-4xl font-serif uppercase tracking-[0.5em]">{site.name}</h1>
             <div className="h-px w-20 bg-white" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">&copy; 2026 {site.name} &bull; Powered by Nova Strategic Infrastructure</p>
        </div>
      </footer>

      {/* Aristocratic Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:max-w-xl bg-[#0D0D0D] z-[160] shadow-2xl border-l border-white/5 flex flex-col"
            >
              <div className="p-10 sm:p-14 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div>
                  <h3 className="text-4xl font-serif italic">Sepetim</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="w-10 h-px bg-white/20" />
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">{cart.length} Ürün Listelendi</p>
                  </div>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="w-14 h-14 bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all rounded-sm">
                  <X size={28} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-10 sm:p-14 space-y-12 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-10">
                    <ShoppingBag size={80} strokeWidth={1} />
                    <p className="text-[12px] font-black uppercase tracking-[0.5em]">Sepetiniz Boş</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-10 group relative">
                      <div className="w-32 h-40 bg-white/5 flex-shrink-0 overflow-hidden border border-white/5 rounded-sm">
                         <img src={item.images?.[0]} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="" />
                      </div>
                      <div className="flex-grow flex flex-col justify-between py-2">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-bold uppercase tracking-widest text-white leading-tight">{item.title}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-white/10 hover:text-red-500 transition-all"><X size={20} /></button>
                          </div>
                          <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">{item.category || 'SEÇKİ'}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                           <div className="flex items-center border border-white/10 rounded-sm">
                              <button onClick={() => updateQuantity(item.id, -1)} className="p-3 hover:bg-white/5 text-white/30"><Minus size={14} /></button>
                              <span className="px-6 text-[12px] font-black font-mono">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="p-3 hover:bg-white/5 text-white/30"><Plus size={14} /></button>
                           </div>
                           <span className="text-xl font-serif text-white font-bold">{(parseFloat(item.discount_price || item.price) * item.quantity).toFixed(2)} TL</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-10 sm:p-14 bg-white/[0.02] border-t border-white/5 space-y-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Toplam Tutar</span>
                    <p className="text-[9px] text-emerald-500/50 font-black uppercase tracking-widest">KDV DAHİL / NOVA SECURE</p>
                  </div>
                  <span className="text-4xl font-serif text-white tracking-tighter">{cartTotal.toFixed(2)} TL</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full bg-white text-[#0A0A0A] py-8 font-black uppercase tracking-[0.5em] text-[12px] hover:bg-[#F2EBE1] transition-all disabled:opacity-20 flex items-center justify-center gap-6 rounded-sm shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                >
                  Siparişi Tamamla <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Section */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-8 lg:p-12">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-[#0A0A0A]/98 backdrop-blur-3xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-[#0F0F0F] sm:border border-white/10 w-full h-full sm:h-auto sm:max-w-7xl relative z-10 flex flex-col lg:flex-row sm:max-h-[85vh] overflow-hidden shadow-2xl"
            >
              {/* Product Images */}
              <div className="lg:w-[550px] bg-black/50 border-b lg:border-b-0 lg:border-r border-white/5 p-8 sm:p-12 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
                <div className="aspect-[3/4] bg-white/[0.02] border border-white/5 relative overflow-hidden rounded-sm mb-8 shadow-2xl">
                  <img src={selectedProduct.images?.[activeImageIndex]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {selectedProduct.images?.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`aspect-square border-2 transition-all rounded-sm overflow-hidden ${activeImageIndex === idx ? 'border-white' : 'border-white/5 opacity-40 hover:opacity-100 hover:border-white/20'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Data */}
              <div className="flex-1 p-10 sm:p-20 flex flex-col overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-start mb-16">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.5em]">{selectedProduct.category || 'NOVA SEÇKİ'}</span>
                      <div className="w-8 h-px bg-white/20" />
                      {selectedProduct.sku && <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">SKU: {selectedProduct.sku}</span>}
                    </div>
                    <h3 className="text-5xl sm:text-7xl font-serif tracking-tighter italic leading-none">{selectedProduct.title}</h3>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="w-16 h-16 bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all rounded-sm">
                    <X size={32} />
                  </button>
                </div>

                <div className="mb-16">
                  {selectedProduct.discount_price ? (
                    <div className="flex items-center gap-8">
                       <span className="text-5xl font-serif text-white">{selectedProduct.discount_price} TL</span>
                       <div className="flex flex-col">
                          <span className="text-xl text-white/20 line-through font-bold tracking-tighter">{selectedProduct.price} TL</span>
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">ÖZEL KAMPANYA</span>
                       </div>
                    </div>
                  ) : (
                    <span className="text-5xl font-serif text-white/40">{selectedProduct.price} TL</span>
                  )}
                </div>

                <div className="space-y-12 flex-grow">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Analiz & Detay</h4>
                       <div className="flex-grow h-px bg-white/5" />
                    </div>
                    <p className="text-base sm:text-lg text-white/40 leading-relaxed font-medium italic">
                      {selectedProduct.description || 'Bu kurumsal ürün için detaylı bir analiz henüz sisteme işlenmemiştir.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-12 py-12 border-y border-white/5">
                     <div className="space-y-3">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Nova Lojistik</span>
                        <p className="text-[12px] font-black text-white/80 uppercase tracking-widest flex items-center gap-3"><Truck size={14} className="text-white/20" /> 24 SAATTE KARGO</p>
                     </div>
                     <div className="space-y-3">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Güvenli Altyapı</span>
                        <p className="text-[12px] font-black text-white/80 uppercase tracking-widest flex items-center gap-3"><ShieldCheck size={14} className="text-white/20" /> SSL PROTECTED</p>
                     </div>
                  </div>
                </div>

                <div className="mt-20 flex flex-col sm:flex-row gap-6">
                  <button 
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 bg-white/5 border border-white/10 text-white py-8 font-black uppercase tracking-[0.4em] text-[12px] hover:bg-white hover:text-black transition-all rounded-sm flex items-center justify-center gap-4"
                  >
                    <Plus size={20} /> Sepete Ekle
                  </button>
                  <button 
                    onClick={() => {
                      handleShopierDirectCheckout(selectedProduct);
                    }}
                    className="flex-[2] bg-white text-[#0A0A0A] py-8 font-black uppercase tracking-[0.4em] text-[13px] hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-6 rounded-sm shadow-[0_30px_70px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                  >
                    Şimdi Satın Al <ArrowRight size={22} strokeWidth={2.5} />
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

