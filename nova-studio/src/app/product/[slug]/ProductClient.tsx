"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import { useStoreData } from "@/store/useStoreData";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Truck, 
  ShieldCheck, 
  RefreshCw,
  Plus,
  Minus,
  Star,
  Maximize2
} from "lucide-react";
import { useCart } from "@/store/useCart";
import { cn } from "@/lib/utils";

const formatPrice = (price: string | number): string => {
  if (price === undefined || price === null || price === "") return "0,00";
  let cleanPrice = String(price).replace(/[₺TL$€£]/g, '').trim();
  
  // Eğer giriş '1.990' gibi bir formatta ise (binlik ayracı nokta olan TR formatı)
  // Ve eğer biz bunu doğrudan parseFloat yaparsak 1.99 olur. 
  // O yüzden noktaları silip, virgülü noktaya çeviriyoruz.
  if (cleanPrice.includes('.') && cleanPrice.includes(',')) {
    cleanPrice = cleanPrice.replace(/\./g, '').replace(',', '.');
  } else if (cleanPrice.includes(',')) {
    cleanPrice = cleanPrice.replace(',', '.');
  } else if (cleanPrice.includes('.') && cleanPrice.split('.').pop()?.length === 3) {
    // Eğer sadece nokta varsa ve sonu 3 haneliyse (Örn: 1.990)
    cleanPrice = cleanPrice.replace(/\./g, '');
  }
  
  const n = parseFloat(cleanPrice);
  if (isNaN(n)) return String(price);
  
  return new Intl.NumberFormat('tr-TR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(n);
};

const slugify = (text: string) => {
  return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[ğĞ]/g, 'g').replace(/[üÜ]/g, 'u').replace(/[şŞ]/g, 's').replace(/[ıİ]/g, 'i').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
};

const safeImage = (src: string | undefined): string => {
  if (!src || src.trim() === "" || src.includes('placeholder')) return "";
  let formattedSrc = src;
  if (formattedSrc.startsWith('//')) {
    formattedSrc = `https:${formattedSrc}`;
  }
  
  // Shopier CDN'inden en büyük boyutu (pictures_large) zorluyoruz ve kaliteyi %100 yapıyoruz
  if (formattedSrc.includes('cdn.shopier.app')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
    let hdSrc = formattedSrc
      .replace('/pictures_mid/', '/pictures_large/')
      .replace('/pictures_small/', '/pictures_large/');
    
    // Kalite parametresini zorla ekle
    if (hdSrc.includes('?')) {
      hdSrc = hdSrc.split('?')[0] + '?quality=100';
    } else {
      hdSrc += '?quality=100';
    }
    
    return `${apiBase}/sites/proxy-image?url=${encodeURIComponent(hdSrc)}`;
  }
  
  // Diğer kaynaklar (Google vb.) doğrudan döndürülür
  return formattedSrc;
};

export default function ProductClient() {
  const { slug } = useParams();
  const { products, store, isLoading } = useStoreData();
  const addItem = useCart((state) => state.addItem);
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("ozellikler");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const product = products.find(p => {
    const currentSlug = typeof slug === 'string' ? slug : '';
    const pSlug = p.slug || slugify(p.name);
    return pSlug === currentSlug || pSlug.replace(/--/g, '-') === currentSlug.replace(/--/g, '-');
  });
  
  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else if (product && product.variations && product.variations.length > 0) {
      setSelectedSize(product.variations[0].options[0]);
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favorites.includes(product.id));
    }
  }, [product]);

  const toggleFavorite = () => {
    if (!product) return;
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    let newFavorites;
    if (favorites.includes(product.id)) {
      newFavorites = favorites.filter((id: string) => id !== product.id);
      setIsFavorite(false);
    } else {
      newFavorites = [...favorites, product.id];
      setIsFavorite(true);
    }
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | ${store?.name || "Mağaza"}`;
    } else if (!isLoading) {
      document.title = "Ürün Bulunamadı | Mağaza";
    }
  }, [product, isLoading, store]);

  if (isLoading) return <div className="min-h-screen bg-white" />;
  if (!product) return <div className="min-h-screen bg-white" />;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Resimleri normalize et ve tekilleştir - BOŞLUKLARI VE HATALARI TAMİZLE
  const allImages = [...new Set((product.images || []).map(img => {
    if (!img || typeof img !== 'string' || img.trim() === "") return "";
    
    // Kesinlikle dışlanması gereken kalıplar (logo, ikon, boş piksel vb.)
    const lower = img.toLowerCase();
    if (lower.includes('blank') || lower.includes('pixel') || lower.includes('loader') || 
        lower.includes('icon') || lower.includes('logo_') || lower.includes('shopier.svg')) return "";
    
    // Temizleme işlemi
    let clean = img.split('?')[0]
      .replace('/pictures_mid/', '/pictures/')
      .replace('/pictures_small/', '/pictures/')
      .replace('/pictures_large/', '/pictures/');
    
    if (clean.startsWith('//')) clean = `https:${clean}`;
    return clean.trim();
  }))].filter(img => img !== "" && img.length > 20); // Ürün resimleri genelde uzundur

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedSize || 'OS'}`,
      productId: product.id,
      name: product.name.split('|')[0].trim(),
      price: product.price,
      quantity: quantity,
      size: selectedSize || "OS",
      image: allImages[0],
      url: product.url || "#",
      currency: product.currency,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const Accordion = ({ id, title, content }: { id: string, title: string, content: React.ReactNode }) => (
    <div className="border-b border-gray-100">
      <button 
        onClick={() => setOpenAccordion(openAccordion === id ? null : id)}
        className="w-full py-5 flex justify-between items-center group"
      >
        <span className="text-[13px] font-bold tracking-tight uppercase group-hover:text-gray-500 transition-colors">{title}</span>
        <Plus size={16} className={cn("transition-transform duration-300", openAccordion === id && "rotate-45")} />
      </button>
      <AnimatePresence>
        {openAccordion === id && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-[13px] text-gray-500 leading-relaxed">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (!mounted) return null;

  return (
    <>
      <Navbar />
      
      {/* HD Fullscreen Görsel */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-4 md:p-12"
          >
            <button 
              onClick={() => setIsFullscreen(false)}
              className="absolute top-8 right-8 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Plus className="rotate-45" size={24} />
            </button>
            <img 
              src={safeImage(allImages[selectedImage])} 
              alt="" 
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="bg-white text-black min-h-screen pt-28 pb-24 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* SOL KOLON: HD GALERİ */}
          <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
            <div className="flex-1 relative aspect-[3/4] bg-gray-50 overflow-hidden cursor-zoom-in group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={safeImage(allImages[selectedImage])}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                  onClick={() => setIsFullscreen(true)}
                />
              </AnimatePresence>
              
              {allImages.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setSelectedImage(prev => (prev === 0 ? allImages.length - 1 : prev - 1))} className="w-12 h-12 bg-white/90 shadow-sm flex items-center justify-center rounded-full hover:bg-black hover:text-white transition-all">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setSelectedImage(prev => (prev === allImages.length - 1 ? 0 : prev + 1))} className="w-12 h-12 bg-white/90 shadow-sm flex items-center justify-center rounded-full hover:bg-black hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Yan Thumbnaillar - HD */}
            {allImages.length > 1 && (
              <div className="md:w-24 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "flex-shrink-0 w-20 md:w-full aspect-[3/4] border-2 transition-all p-0.5",
                      selectedImage === idx ? "border-black" : "border-transparent"
                    )}
                  >
                    <img src={safeImage(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ KOLON: FERAH ÜRÜN PANELİ */}
          <div className="lg:col-span-5 space-y-10 lg:pr-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-orange-400 text-orange-400" />)}
                  <span className="text-[11px] text-gray-400 ml-2 font-bold tracking-widest uppercase">(2 YORUM)</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-4xl font-black italic tracking-tighter text-black">
                  {formatPrice(product.price)} ₺
                </div>
                {(product.originalPrice || product.oldPrice) && Number(product.originalPrice || product.oldPrice) > Number(product.price) && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-red-600/60 line-through decoration-black/20 font-medium">
                      {formatPrice((product.originalPrice || product.oldPrice) as any)} ₺
                    </span>
                    <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                      İNDİRİM
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="text-[12px] font-black uppercase tracking-widest text-gray-400">Renk: <span className="text-black">Varsayılan</span></div>
                <div className="flex gap-3">
                  {allImages.slice(0, 5).map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={cn(
                        "w-14 h-18 border-2 transition-all p-0.5",
                        selectedImage === idx ? "border-black" : "border-gray-100"
                      )}
                    >
                      <img src={safeImage(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {((product.sizes && product.sizes.length > 0) || (product.variations && product.variations.length > 0)) && (
                <div className="space-y-4">
                  <div className="text-[12px] font-black uppercase tracking-widest text-gray-400">Beden Seçin:</div>
                  <div className="flex flex-wrap gap-2">
                    {((product.sizes && product.sizes.length > 0) ? product.sizes : (product.variations?.[0]?.options || [])).map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "px-8 h-12 flex items-center justify-center text-[12px] font-black transition-all border",
                          selectedSize === size ? "bg-black text-white border-black" : "bg-white text-black border-gray-200 hover:border-black"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SATIN ALMA ALANI - FIX: WHITESPACE-NOWRAP VE FERAH BUTONLAR */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
              <div className="flex items-center border border-gray-200 h-16 px-6 gap-8 bg-gray-50/50">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-gray-400 hover:text-black transition-colors"><Minus size={18} /></button>
                <span className="text-base font-bold w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="text-gray-400 hover:text-black transition-colors"><Plus size={18} /></button>
              </div>
              
              <div className="flex flex-1 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className={cn(
                    "flex-1 h-16 flex items-center justify-center gap-4 text-[13px] font-black tracking-widest transition-all px-8 whitespace-nowrap",
                    isAdded ? "bg-green-600 text-white" : "bg-black text-white hover:bg-gray-800"
                  )}
                >
                  <ShoppingBag size={20} />
                  <span>{isAdded ? "EKLENDİ" : "SEPETE EKLE"}</span>
                </button>
                
                <button 
                  onClick={toggleFavorite}
                  className={cn(
                    "w-16 h-16 border-2 flex items-center justify-center transition-all active:scale-90",
                    isFavorite ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-black"
                  )}
                >
                  <Heart size={24} className={cn(isFavorite ? "fill-current text-red-500" : "text-black")} />
                </button>
              </div>
            </div>

            {/* GÜVEN İKONLARI */}
            <div className="grid grid-cols-3 gap-4 py-8 border-y border-gray-100">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center"><Truck size={24} strokeWidth={1.2} /></div>
                <div className="text-[10px] font-black tracking-tighter leading-tight uppercase">HIZLI<br/>GÖNDERİ</div>
              </div>
              <div className="flex flex-col items-center text-center gap-3 border-x border-gray-100">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center"><ShieldCheck size={24} strokeWidth={1.2} /></div>
                <div className="text-[10px] font-black tracking-tighter leading-tight uppercase">GÜVENLİ<br/>ALIŞVERİŞ</div>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center"><RefreshCw size={24} strokeWidth={1.2} /></div>
                <div className="text-[10px] font-black tracking-tighter leading-tight uppercase">İADE VE<br/>DEĞİŞİM</div>
              </div>
            </div>

            <div className="pt-2">
              <Accordion 
                id="ozellikler" 
                title="ÜRÜN ÖZELLİKLERİ" 
                content={
                  <div 
                    className="prose prose-sm max-w-none text-gray-500"
                    dangerouslySetInnerHTML={{ __html: product.description || "Ürün açıklaması bulunmuyor." }} 
                  />
                } 
              />
              <Accordion 
                id="teslimat" 
                title="GARANTİ VE TESLİMAT" 
                content="Siparişleriniz 1-3 iş günü içerisinde kargoya verilir." 
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
