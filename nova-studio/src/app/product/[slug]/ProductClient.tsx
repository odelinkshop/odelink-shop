"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import { useStoreData } from "@/store/useStoreData";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, ChevronLeft, ChevronRight, Star, ShieldCheck, Truck, RefreshCw, Plus, Minus, Zap } from "lucide-react";
import { useCart } from "@/store/useCart";
import { cn } from "@/lib/utils";

// Fiyat formatlama
const formatPrice = (price: string | number, currency: string = "TL"): string => {
  if (!price && price !== 0) return "-";
  let str = String(price).trim();
  if (/[₺TL$€£]/.test(str)) return str;
  const n = parseFloat(str.replace(/\./g, '').replace(',', '.'));
  if (isNaN(n)) return str;
  
  const symbolMap: Record<string, string> = {
    'TL': '₺',
    'TRY': '₺',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };
  
  const symbol = symbolMap[currency.toUpperCase()] || currency;
  return symbol === '$' || symbol === '€' || symbol === '£' 
    ? `${symbol}${n.toLocaleString('tr-TR')}`
    : `${n.toLocaleString('tr-TR')} ${symbol}`;
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
  if (formattedSrc.includes('cdn.shopier.app')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
    return `${apiBase}/sites/proxy-image?url=${encodeURIComponent(formattedSrc)}`;
  }
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

  // Ürünü bul (Gelişmiş slug eşleme)
  const product = products.find(p => {
    const currentSlug = typeof slug === 'string' ? slug : '';
    const pSlug = p.slug || slugify(p.name);
    return pSlug === currentSlug || pSlug.replace(/--/g, '-') === currentSlug.replace(/--/g, '-');
  });
  
  // Varsayılan beden seçimi
  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else if (product && product.variations && product.variations.length > 0) {
      setSelectedSize(product.variations[0].options[0]);
    }
  }, [product]);

  // Favori durumunu kontrol et
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

  // Sayfa başlığını güncelle (Tab ismi)
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | ${store?.name || "Mağaza"}`;
    } else if (!isLoading) {
      document.title = "Ürün Bulunamadı | Mağaza";
    }
  }, [product, isLoading, store]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-accent text-xs tracking-[0.5em] uppercase font-bold animate-pulse">
          YÜKLENİYOR...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary text-secondary">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-serif">Ürün Bulunamadı</h1>
          <p className="text-sm opacity-50 uppercase tracking-widest">Aradığınız ürün mağazamızda mevcut değil.</p>
          <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-secondary text-primary text-[10px] uppercase tracking-widest font-bold rounded-full">
            Mağazaya Dön
          </button>
        </div>
      </div>
    );
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const allImages = product.images && product.images.length > 0 ? product.images : [];

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedSize || 'OS'}`,
      productId: product.id,
      name: product.name.split('|')[0].trim(),
      price: product.price,
      quantity: quantity,
      size: selectedSize || "OS",
      image: allImages[0],
      currency: product.currency,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  // Ikas/Ticimax Seviyesi Ürün Şeması (JSON-LD)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - En uygun fiyatlarla ${store?.name || 'mağazamızda'}.`,
    "image": safeImage(product.images?.[0] || product.image),
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": store?.name || "Premium Collection"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://${typeof window !== 'undefined' ? window.location.host : ''}/product/${product.slug}`,
      "priceCurrency": "TRY",
      "price": String(product.price).replace(/[^0-9.]/g, ''),
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Sol Kolon: Görseller */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[3/4] bg-neutral/20 overflow-hidden cursor-crosshair group/zoom">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={safeImage(allImages[selectedImage])}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover/zoom:scale-[2.5]"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.src.includes('pictures_large')) {
                      img.src = img.src.replace('pictures_large', 'pictures_mid');
                    } else {
                      img.style.display = 'none';
                    }
                  }}
                />
              </AnimatePresence>
              
              {allImages.length > 1 && (
                <>
                  <button 
                    onClick={() => setSelectedImage(prev => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-secondary hover:text-primary transition-all z-20"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setSelectedImage(prev => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-secondary hover:text-primary transition-all z-20"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnaillar */}
            <div className="grid grid-cols-5 gap-4">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-[3/4] border-2 transition-all ${
                    selectedImage === idx ? "border-secondary" : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={safeImage(img)} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Sağ Kolon: Ürün Detayları */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.3em] uppercase text-accent font-bold">
                  {product.category || "Koleksiyon"}
                </p>
                <h1 className="text-4xl md:text-5xl font-serif text-secondary uppercase leading-none tracking-tighter">
                  {product.name.split('|')[0].trim()}
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-secondary">
                  {formatPrice(product.price, product.currency)}
                </span>
                {((product.originalPrice ?? product.oldPrice) !== null && (product.originalPrice ?? product.oldPrice) !== undefined) && 
                 Number(product.originalPrice ?? product.oldPrice) > Number(product.price) && (
                  <>
                    <span className="text-lg text-secondary/30 line-through">
                      {formatPrice((product.originalPrice ?? product.oldPrice) as (string | number), product.currency)}
                    </span>
                    <span className="text-[10px] px-2 py-1 bg-rose-600 text-white font-black rounded-sm">
                      %{Math.round(((Number(product.originalPrice ?? product.oldPrice) - Number(product.price)) / Number(product.originalPrice ?? product.oldPrice)) * 100)} İNDİRİM
                    </span>
                  </>
                )}
              </div>
              {product.productType === 'Dijital' && (
                <div className="flex items-center gap-2 text-blue-500 font-bold text-[10px] tracking-widest uppercase">
                  <Zap size={12} className="fill-current" /> DİJİTAL TESLİMAT - ANINDA ERİŞİM
                </div>
              )}
            </div>

            {/* Beden Seçimi */}
            {((product.sizes && product.sizes.length > 0) || (product.variations && product.variations.length > 0)) && (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] tracking-widest uppercase font-bold">Beden Seçin</label>
                </div>
                <div className="flex flex-wrap gap-3">
                  {((product.sizes && product.sizes.length > 0) ? product.sizes : (product.variations?.[0]?.options || [])).map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[60px] h-12 flex items-center justify-center text-xs tracking-widest uppercase border transition-all duration-300 ${
                        selectedSize === size
                          ? "bg-secondary text-primary border-secondary"
                          : "border-secondary/10 text-secondary/60 hover:border-secondary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Adet ve Sepet */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch gap-4">
                <button
                  onClick={handleAddToCart}
                  className={cn(
                    "flex-1 h-14 bg-secondary text-primary text-[10px] tracking-[0.3em] uppercase font-black transition-all duration-500 hover:bg-secondary/90 flex items-center justify-center gap-2",
                    isAdded && "bg-green-600"
                  )}
                >
                  {isAdded ? "SEPETE EKLENDİ" : "SEPETE EKLE"}
                  <ShoppingBag size={18} />
                </button>

                {product.shopierUrl && (
                  <button
                    onClick={() => window.open(product.shopierUrl, '_blank')}
                    className="flex-1 h-14 border border-secondary text-secondary text-[10px] tracking-[0.3em] uppercase font-black hover:bg-secondary hover:text-primary transition-all flex items-center justify-center gap-2"
                  >
                    SHOPIER'DE TAMAMLA
                    <Zap size={14} className="fill-current" />
                  </button>
                )}
              </div>

              <button 
                onClick={toggleFavorite}
                className="w-full h-14 border border-secondary/10 text-[10px] tracking-[0.3em] uppercase font-bold flex items-center justify-center hover:bg-secondary hover:text-primary hover:border-secondary transition-all"
              >
                <Heart size={16} className={cn("mr-2 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "")} /> 
                {isFavorite ? "FAVORİLERİMDE" : "FAVORİLERİME EKLE"}
              </button>
            </div>

            {/* Bilgi Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-secondary/10">
              <div className="flex flex-col items-center text-center space-y-2 p-4 bg-neutral/10">
                {product.productType === 'Dijital' ? <Zap size={20} className="text-accent" /> : <Truck size={20} className="text-accent" />}
                <span className="text-[9px] tracking-widest uppercase font-bold">
                  {product.productType === 'Dijital' ? 'ANINDA TESLİM' : (product.shippingType || 'HIZLI KARGO')}
                </span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4 bg-neutral/10">
                <RefreshCw size={20} className="text-accent" />
                <span className="text-[9px] tracking-widest uppercase font-bold">
                  {product.productType === 'Dijital' ? '7/24 ERİŞİM' : 'KOLAY İADE'}
                </span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4 bg-neutral/10">
                <ShieldCheck size={20} className="text-accent" />
                <span className="text-[9px] tracking-widest uppercase font-bold">GÜVENLİ ÖDEME</span>
              </div>
            </div>

            {/* Ürün Açıklaması */}
            <div className="space-y-6">
              <h3 className="text-xs tracking-[0.3em] uppercase font-black border-b border-secondary/10 pb-4">Ürün Detayları</h3>
              <div 
                className="prose prose-sm prose-secondary max-w-none text-secondary/70 leading-relaxed text-xs"
                dangerouslySetInnerHTML={{ __html: product.description || "Bu ürün için henüz bir açıklama girilmemiş." }}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
