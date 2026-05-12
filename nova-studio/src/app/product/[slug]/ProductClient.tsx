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
  RefreshCw, 
  ShieldCheck, 
  Zap 
} from "lucide-react";
import { useCart } from "@/store/useCart";
import { cn } from "@/lib/utils";

// Fiyat formatlama - Shopify Standard
const formatPrice = (price: string | number, currency: string = "TL"): string => {
  if (price === undefined || price === null || price === "") return "-";
  
  let cleanPrice = String(price).replace(/[₺TL$€£]/g, '').trim();
  
  if (cleanPrice.includes('.') && cleanPrice.includes(',')) {
    cleanPrice = cleanPrice.replace(/\./g, '').replace(',', '.');
  } else if (cleanPrice.includes(',')) {
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <div className="text-center space-y-6 max-w-sm px-6">
          <h1 className="text-2xl font-medium tracking-tight">Ürün Bulunamadı</h1>
          <p className="text-sm text-gray-400 leading-relaxed">Aradığınız ürün şu an stoklarımızda bulunmuyor.</p>
          <button onClick={() => window.location.href = '/'} className="inline-block border-b border-black pb-1 text-xs uppercase tracking-widest font-bold">
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

  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
    <>
      <Navbar />
      <main className="bg-white text-black min-h-screen pt-32 pb-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* GALLERY SECTION */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-[#fbfbfb] overflow-hidden group border border-gray-50">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={safeImage(allImages[selectedImage])}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-contain p-4 md:p-8"
                  />
                </AnimatePresence>
                
                {allImages.length > 1 && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setSelectedImage(prev => (prev === 0 ? allImages.length - 1 : prev - 1))} className="w-10 h-10 bg-white/90 shadow-sm flex items-center justify-center rounded-full hover:bg-black hover:text-white transition-all">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setSelectedImage(prev => (prev === allImages.length - 1 ? 0 : prev + 1))} className="w-10 h-10 bg-white/90 shadow-sm flex items-center justify-center rounded-full hover:bg-black hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* THUMBNAILS BELOW */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-16 h-16 bg-[#fbfbfb] border transition-all ${
                        selectedImage === idx ? "border-black" : "border-transparent opacity-60"
                      }`}
                    >
                      <img src={safeImage(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PRODUCT INFO SECTION */}
            <div className="flex flex-col">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-bold">
                      {product.category || "Mağaza"}
                    </span>
                    {product.sku && (
                      <>
                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                        <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-bold">SKU: {product.sku}</span>
                      </>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-medium tracking-tight">
                    {product.name.split('|')[0].trim()}
                  </h1>
                  <div className="flex items-baseline gap-4">
                    <span className="text-xl font-medium">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {(product.originalPrice || product.oldPrice) && Number(product.originalPrice || product.oldPrice) > Number(product.price) && (
                      <span className="text-sm text-gray-300 line-through">
                        {formatPrice((product.originalPrice || product.oldPrice) as any, product.currency)}
                      </span>
                    )}
                  </div>
                </div>

                {/* VARIANT SELECTION */}
                {((product.sizes && product.sizes.length > 0) || (product.variations && product.variations.length > 0)) && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                      <span className="text-gray-400">Seçenekler</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {((product.sizes && product.sizes.length > 0) ? product.sizes : (product.variations?.[0]?.options || [])).map((size: string) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 h-11 flex items-center justify-center text-[11px] tracking-tighter border transition-all duration-200 ${
                            selectedSize === size
                              ? "bg-black text-white border-black"
                              : "border-gray-100 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* BUY BUTTONS */}
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={cn(
                      "flex-1 h-14 text-[11px] tracking-[0.1em] font-bold transition-all duration-300 flex items-center justify-center gap-3",
                      isAdded ? "bg-gray-100 text-black cursor-default" : "bg-black text-white hover:bg-gray-800 active:scale-95"
                    )}
                  >
                    {isAdded ? "SEPETE EKLENDİ" : "SEPETE EKLE"}
                    <ShoppingBag size={16} />
                  </button>
                  <button 
                    onClick={toggleFavorite}
                    className="w-14 h-14 border border-gray-100 flex items-center justify-center hover:border-gray-300 transition-all active:scale-90"
                  >
                    <Heart size={18} className={cn("transition-colors", isFavorite ? "fill-black text-black" : "text-gray-300")} />
                  </button>
                </div>

                {/* TRUST CARDS - MINIMAL GRID */}
                <div className="grid grid-cols-3 gap-2 py-6 border-y border-gray-50">
                  <div className="text-center space-y-1">
                    <Truck size={14} className="mx-auto text-gray-400" />
                    <p className="text-[9px] uppercase font-bold text-gray-400">Hızlı Kargo</p>
                  </div>
                  <div className="text-center space-y-1">
                    <RefreshCw size={14} className="mx-auto text-gray-400" />
                    <p className="text-[9px] uppercase font-bold text-gray-400">Kolay İade</p>
                  </div>
                  <div className="text-center space-y-1">
                    <ShieldCheck size={14} className="mx-auto text-gray-400" />
                    <p className="text-[9px] uppercase font-bold text-gray-400">Güvenli Ödeme</p>
                  </div>
                </div>

                {/* DESCRIPTION AREA */}
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-300">Ürün Detayları</h3>
                  <div 
                    className="text-gray-600 text-xs leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description || "Açıklama mevcut değil." }}
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
