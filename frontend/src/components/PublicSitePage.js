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
  Mail
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Checkout State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('idle'); // idle, form, redirecting
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    surname: '',
    email: '',
    phone: ''
  });

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
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSiteData();
  }, [subdomain]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setCheckoutStep('redirecting');

    try {
      const res = await fetch(`${API_BASE}/api/payments/create-shopier-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          siteOwnerId: site.user_id,
          ...buyerInfo
        })
      });

      if (!res.ok) throw new Error('Ödeme başlatılamadı');
      const formData = await res.json();

      // Shopier'e yönlendirmek için gizli form oluştur ve gönder
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = formData.url;

      Object.entries(formData.fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (e) {
      alert(e.message);
      setCheckoutStep('form');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-[#C5A059] animate-spin" />
    </div>
  );

  if (error || !site) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#F2EBE1] p-8">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-serif mb-4">Mağaza Bulunamadı</h1>
        <p className="text-sm opacity-60 uppercase tracking-widest leading-relaxed">Aradığınız mağaza yayında olmayabilir veya link hatalı olabilir.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2EBE1] font-sans selection:bg-[#C5A059]/30">
      {/* Header / Brand */}
      <header className="py-12 px-8 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#C5A059]/5 blur-3xl rounded-full -top-1/2 -left-1/4 w-full h-full pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <h1 className="text-4xl sm:text-6xl font-serif tracking-tight mb-4">{site.name}</h1>
          <div className="h-px w-24 bg-[#C5A059] mb-4" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-black opacity-80">Premium Alışveriş Deneyimi</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-20">
        <div className="flex items-center gap-4 mb-16">
          <h2 className="text-2xl font-serif">Koleksiyon</h2>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {products.length === 0 ? (
          <div className="py-32 text-center opacity-40">
            <Package size={48} className="mx-auto mb-4" />
            <p className="text-xs uppercase tracking-widest font-bold">Mağazada henüz ürün bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {products.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
                onClick={() => {
                  setSelectedProduct(product);
                  setCheckoutStep('form');
                }}
              >
                <div className="aspect-[4/5] bg-white/[0.02] border border-white/5 relative overflow-hidden mb-6">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                      <ShoppingBag size={64} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-[#C5A059] text-[#0A0A0A] px-6 py-3 text-[10px] font-black uppercase tracking-widest">Hemen Satın Al</span>
                  </div>
                </div>
                <h3 className="text-xl font-serif mb-2 group-hover:text-[#C5A059] transition-colors">{product.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#F2EBE1]/80">{product.price} TL</span>
                  <div className="text-[8px] uppercase tracking-widest text-[#C5A059] font-black border border-[#C5A059]/30 px-2 py-1">Stokta Mevcut</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Features */}
      <footer className="bg-white/[0.02] border-t border-white/5 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: ShieldCheck, title: 'Güvenli Ödeme', sub: 'Shopier Güvencesiyle 256-bit SSL' },
            { icon: Truck, title: 'Hızlı Teslimat', sub: 'Tüm Türkiye\'ye Aynı Gün Kargo' },
            { icon: Clock, title: '7/24 Destek', sub: 'Satış Sonrası Kesintisiz Hizmet' }
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059] mb-4">
                <f.icon size={20} />
              </div>
              <h4 className="font-serif text-lg mb-1">{f.title}</h4>
              <p className="text-[10px] uppercase tracking-widest text-[#F2EBE1]/40 font-bold">{f.sub}</p>
            </div>
          ))}
        </div>
      </footer>

      {/* Checkout Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (checkoutStep !== 'redirecting') setSelectedProduct(null);
              }}
              className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/[0.03] border border-white/10 w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h3 className="text-xl font-serif text-[#F2EBE1]">Ödeme Detayları</h3>
                  <p className="text-[8px] uppercase tracking-[0.3em] text-[#C5A059] font-black mt-1">Güvenli Alışveriş Formu</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-white/20 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                {/* Product Summary */}
                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 mb-8">
                  <div className="w-16 h-16 bg-black flex items-center justify-center overflow-hidden border border-white/10">
                    {selectedProduct.images?.[0] ? (
                      <img src={selectedProduct.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : <ShoppingBag size={24} className="opacity-20" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest">{selectedProduct.title}</h4>
                    <span className="text-[#C5A059] font-serif text-lg">{selectedProduct.price} TL</span>
                  </div>
                </div>

                {checkoutStep === 'redirecting' ? (
                  <div className="py-12 text-center flex flex-col items-center gap-6">
                    <Loader2 className="w-12 h-12 text-[#C5A059] animate-spin" />
                    <div>
                      <h4 className="text-lg font-serif mb-2">Shopier'e Yönlendiriliyorsunuz</h4>
                      <p className="text-[10px] uppercase tracking-widest text-[#F2EBE1]/40 font-black">Lütfen Pencereyi Kapatmayın...</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                        <input required placeholder="ADINIZ" className="w-full bg-white/[0.03] border border-white/10 pl-12 pr-4 py-4 text-[10px] font-black uppercase tracking-widest focus:border-[#C5A059]/50 focus:outline-none transition-all" value={buyerInfo.name} onChange={e => setBuyerInfo({...buyerInfo, name: e.target.value})} />
                      </div>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                        <input required placeholder="SOYADINIZ" className="w-full bg-white/[0.03] border border-white/10 pl-12 pr-4 py-4 text-[10px] font-black uppercase tracking-widest focus:border-[#C5A059]/50 focus:outline-none transition-all" value={buyerInfo.surname} onChange={e => setBuyerInfo({...buyerInfo, surname: e.target.value})} />
                      </div>
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                      <input required type="email" placeholder="E-POSTA ADRESİNİZ" className="w-full bg-white/[0.03] border border-white/10 pl-12 pr-4 py-4 text-[10px] font-black uppercase tracking-widest focus:border-[#C5A059]/50 focus:outline-none transition-all" value={buyerInfo.email} onChange={e => setBuyerInfo({...buyerInfo, email: e.target.value})} />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                      <input required placeholder="TELEFON NUMARANIZ" className="w-full bg-white/[0.03] border border-white/10 pl-12 pr-4 py-4 text-[10px] font-black uppercase tracking-widest focus:border-[#C5A059]/50 focus:outline-none transition-all" value={buyerInfo.phone} onChange={e => setBuyerInfo({...buyerInfo, phone: e.target.value})} />
                    </div>

                    <button type="submit" className="w-full bg-[#C5A059] text-[#0A0A0A] py-5 mt-4 font-black uppercase tracking-widest text-[11px] hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-3">
                      ÖDEMEYE GEÇ <ArrowRight size={16} />
                    </button>
                    
                    <p className="text-[8px] text-center text-[#F2EBE1]/30 font-bold uppercase tracking-widest mt-4">
                      Kart bilgileriniz bizimle paylaşılmaz, Shopier tarafından korunur.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
