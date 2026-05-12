"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import { useStoreData } from "@/store/useStoreData";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, ChevronLeft, ChevronRight, Star, ShieldCheck, Truck, RefreshCw, Plus, Minus, Zap } from "lucide-react";
import { useCart } from "@/store/useCart";
import { cn } from "@/lib/utils";

// Fiyat formatlama - Shopify Standard
const formatPrice = (price: string | number, currency: string = "TL"): string => {
  if (price === undefined || price === null || price === "") return "-";
  
  // Eğer zaten sembol içeriyorsa temizle ve parse et
  let cleanPrice = String(price).replace(/[₺TL$€£]/g, '').trim();
  
  // Nokta ve virgül karmaşasını çöz: 2.450,00 -> 2450.00
  // Eğer hem nokta hem virgül varsa, binlik ayracı noktadır.
  if (cleanPrice.includes('.') && cleanPrice.includes(',')) {
    cleanPrice = cleanPrice.replace(/\./g, '').replace(',', '.');
  } else if (cleanPrice.includes(',')) {
    // Sadece virgül varsa kuruş ayracıdır
    cleanPrice = cleanPrice.replace(',', '.');
  }
  
  const n = parseFloat(cleanPrice);
  if (isNaN(n)) return String(price);
  
  const symbolMap: Record<string, string> = {
    'TL': '₺', 'TRY': '₺', 'USD': '$', 'EUR': '€', 'GBP': '£'
  };
  
  const symbol = symbolMap[currency.toUpperCase()] || currency;
  const formatted = n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  return symbol === '$' || symbol === '€' || symbol === '£' 
    ? `${symbol}${formatted}`
    : `${formatted} ${symbol}`;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[#C5A059] text-xs tracking-[0.8em] uppercase font-bold animate-pulse"
        >
          Koleksiyon Yükleniyor
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-[#F2EBE1]">
        <div className="text-center space-y-8 max-w-md px-6">
          <h1 className="text-5xl font-serif tracking-tighter uppercase">Kayıp Parça</h1>
          <p className="text-[10px] opacity-40 uppercase tracking-[0.4em] leading-relaxed">Aradığınız nadide parça şu an koleksiyonumuzda mevcut değil.</p>
          <button onClick={() => window.location.href = '/'} className="w-full py-5 bg-[#C5A059] text-[#0A0A0A] text-[10px] uppercase tracking-[0.3em] font-black hover:bg-white transition-all">
            Ana Sayfaya Dön
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

  if (!mounted) return <div className="min-h-screen bg-[#0A0A0A]" />;

  return (
    <>
      <Navbar />
      <main className="bg-[#0A0A0A] text-[#F2EBE1] min-h-screen pt-40 pb-24 px-4 md:px-12 lg:px-24">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* SOL KOLON: PREMIUM GALERİ */}
            <div className="lg:col-span-7">
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative aspect-[3/4] bg-white/[0.02] border border-white/5 group overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedImage}
                      src={safeImage(allImages[selectedImage])}
                      alt={product.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  </AnimatePresence>

                  {/* Fiyat Rozeti (Mobil için) */}
                  {(product.originalPrice || product.oldPrice) && Number(product.originalPrice || product.oldPrice) > Number(product.price) && (
                    <div className="absolute top-8 left-8 bg-red-600 text-white text-[8px] font-black px-4 py-2 uppercase tracking-[0.2em] z-10">
                      Özel İndirim
                    </div>
                  )}
                </motion.div>

                {/* Thumbnaillar */}
                {allImages.length > 1 && (
                  <div className="grid grid-cols-5 gap-4">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative aspect-[3/4] bg-white/[0.02] border transition-all duration-500 overflow-hidden ${
                          selectedImage === idx ? "border-[#C5A059]" : "border-white/5 opacity-40 hover:opacity-100"
                        }`}
                      >
                        <img src={safeImage(img)} alt="" className="w-full h-full object-cover" />
                        {selectedImage === idx && <div className="absolute inset-0 bg-[#C5A059]/10" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SAĞ KOLON: STICKY ÜRÜN BİLGİSİ */}
            <div className="lg:col-span-5">
              <div className="sticky top-40 space-y-12">
                
                {/* Üst Başlık ve Fiyat */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] tracking-[0.4em] uppercase text-[#C5A059] font-black">
                        {product.category || "Mağaza Seçkisi"}
                      </span>
                      <div className="h-px w-8 bg-white/10" />
                      {product.sku && (
                        <span className="text-[9px] tracking-[0.4em] uppercase text-white/20 font-black">
                          Kod: {product.sku}
                        </span>
                      )}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif text-white uppercase leading-[0.95] tracking-tighter">
                      {product.name.split('|')[0].trim()}
                    </h1>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex items-baseline gap-4">
                      <span className="text-4xl font-serif text-[#C5A059]">
                        {formatPrice(product.price, product.currency)}
                      </span>
                      {(product.originalPrice || product.oldPrice) && Number(product.originalPrice || product.oldPrice) > Number(product.price) && (
                        <span className="text-lg text-white/20 line-through font-medium">
                          {formatPrice((product.originalPrice || product.oldPrice) as any, product.currency)}
                        </span>
                      )}
                    </div>
                    {/* Stok Durumu */}
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-green-500/80">Stokta Mevcut - Hemen Teslim</span>
                    </div>
                  </div>
                </div>

                {/* Beden Seçimi */}
                {((product.sizes && product.sizes.length > 0) || (product.variations && product.variations.length > 0)) && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <label className="text-[10px] tracking-[0.3em] uppercase font-black text-white/40">Beden / Varyant</label>
                      <button className="text-[9px] tracking-[0.2em] uppercase text-[#C5A059] font-black underline underline-offset-4">Beden Rehberi</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {((product.sizes && product.sizes.length > 0) ? product.sizes : (product.variations?.[0]?.options || [])).map((size: string) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[70px] h-14 flex items-center justify-center text-[10px] tracking-widest uppercase border transition-all duration-500 ${
                            selectedSize === size
                              ? "bg-white text-[#0A0A0A] border-white"
                              : "border-white/10 text-white/60 hover:border-[#C5A059] hover:text-[#C5A059]"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Butonlar */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={isAdded}
                      className={cn(
                        "flex-[2] h-16 text-[11px] tracking-[0.4em] uppercase font-black transition-all duration-700 flex items-center justify-center gap-3 group relative overflow-hidden",
                        isAdded ? "bg-green-600 text-white" : "bg-[#C5A059] text-[#0A0A0A] hover:bg-white"
                      )}
                    >
                      <span className="relative z-10">{isAdded ? "KOLEKSİYONA EKLENDİ" : "SEPETE EKLE"}</span>
                      <ShoppingBag size={18} className="relative z-10 group-hover:scale-110 transition-transform" />
                    </button>
                    
                    <button 
                      onClick={toggleFavorite}
                      className="w-16 h-16 border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white transition-all duration-500"
                    >
                      <Heart size={20} className={cn("transition-all duration-500", isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-white/40")} />
                    </button>
                  </div>

                  {product.shopierUrl && (
                    <button
                      onClick={() => window.open(product.shopierUrl, '_blank')}
                      className="w-full h-16 border border-[#C5A059]/30 text-[#C5A059] text-[10px] tracking-[0.4em] uppercase font-black hover:bg-[#C5A059]/10 transition-all flex items-center justify-center gap-3"
                    >
                      SHOPIER GÜVENLİ ÖDEME
                      <Zap size={14} className="fill-current" />
                    </button>
                  )}
                </div>

                {/* Güven ve Bilgi */}
                <div className="grid grid-cols-3 gap-1 py-8 border-y border-white/5">
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-10 h-10 bg-white/[0.03] flex items-center justify-center text-[#C5A059]"><Truck size={18} /></div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Ücretsiz<br/>Kargo</p>
                  </div>
                  <div className="text-center space-y-3 border-x border-white/5">
                    <div className="mx-auto w-10 h-10 bg-white/[0.03] flex items-center justify-center text-[#C5A059]"><RefreshCw size={18} /></div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30">14 Gün<br/>İade</p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-10 h-10 bg-white/[0.03] flex items-center justify-center text-[#C5A059]"><ShieldCheck size={18} /></div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Güvenli<br/>Altyapı</p>
                  </div>
                </div>

                {/* Açıklama */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-[10px] tracking-[0.3em] uppercase font-black text-[#C5A059]">Ürün Detayları</h3>
                    <div className="flex-grow h-px bg-white/5" />
                  </div>
                  <div 
                    className="text-white/40 text-sm leading-relaxed font-medium space-y-4"
                    dangerouslySetInnerHTML={{ __html: product.description || "Bu nadide parça için özel bir açıklama hazırlanıyor." }}
                  />
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
