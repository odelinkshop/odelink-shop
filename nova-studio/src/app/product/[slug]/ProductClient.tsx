"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import { useStoreData } from "@/store/useStoreData";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, ChevronLeft, ChevronRight, Star, ShieldCheck, Truck, RefreshCw, Plus, Minus } from "lucide-react";
import { useCart } from "@/store/useCart";
import { cn, slugify } from "@/lib/utils";

// Fiyat formatlama
const formatPrice = (price: string | number): string => {
  if (!price && price !== 0) return "-";
  let str = String(price).trim();
  if (/[₺TL$€£]/.test(str)) return str;
  const n = parseFloat(str.replace(/\./g, '').replace(',', '.'));
  if (isNaN(n)) return str;
  return `${n.toLocaleString('tr-TR')} ₺`;
};

export default function ProductClient() {
  const { slug } = useParams();
  const { products, isLoading } = useStoreData();
  const addItem = useCart((state) => state.addItem);
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Ürünü bul
  const product = products.find(p => p.slug === slug || slugify(p.name) === slug);
  
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-8">
        <h2 className="text-4xl font-serif text-secondary">Ürün Bulunamadı</h2>
        <a href="/shop" className="text-xs tracking-widest uppercase border-b border-secondary pb-2">
          Mağazaya Dön
        </a>
      </div>
    );
  }

  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || "/hero_italian.png"];

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedSize || 'OS'}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      size: selectedSize || "OS",
      image: allImages[0],
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Sol Kolon: Görseller */}
          <div className="lg:col-span-7 space-y-4">
            <div 
              className="relative aspect-[3/4] bg-neutral/20 overflow-hidden cursor-crosshair group/zoom"
              onMouseMove={(e) => {
                const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                const x = ((e.pageX - left - window.scrollX) / width) * 100;
                const y = ((e.pageY - top - window.scrollY) / height) * 100;
                const img = e.currentTarget.querySelector('img');
                if (img) {
                  img.style.transformOrigin = `${x}% ${y}%`;
                }
              }}
              onMouseLeave={(e) => {
                const img = e.currentTarget.querySelector('img');
                if (img) {
                  img.style.transformOrigin = 'center';
                }
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={allImages[selectedImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover/zoom:scale-[2.5]"
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
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
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
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-lg text-secondary/30 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Beden Seçimi */}
            {((product.sizes && product.sizes.length > 0) || (product.variations && product.variations.length > 0)) && (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] tracking-widest uppercase font-bold">Beden Seçin</label>
                  <button className="text-[9px] tracking-widest uppercase text-secondary/40 hover:text-secondary underline underline-offset-4">Beden Rehberi</button>
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
              <div className="flex items-center space-x-6">
                <div className="flex items-center border border-secondary/10 h-14">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-full flex items-center justify-center hover:bg-neutral/10 transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-xs font-bold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-12 h-full flex items-center justify-center hover:bg-neutral/10 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize && ((product.sizes && product.sizes.length > 0) || (product.variations && product.variations.length > 0))}
                  className={`flex-1 h-14 text-xs tracking-[0.3em] uppercase font-black transition-all duration-500 relative overflow-hidden group ${
                    isAdded ? "bg-emerald-600 text-white" : "bg-secondary text-primary hover:tracking-[0.4em]"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isAdded ? (
                      <>
                        <ShieldCheck size={18} className="mr-2" />
                        SEPETE EKLENDİ
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} className="mr-2" />
                        SEPETE EKLE
                      </>
                    )}
                  </span>
                </button>
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
                <Truck size={20} className="text-accent" />
                <span className="text-[9px] tracking-widest uppercase font-bold">Hızlı Kargo</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4 bg-neutral/10">
                <RefreshCw size={20} className="text-accent" />
                <span className="text-[9px] tracking-widest uppercase font-bold">Kolay İade</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4 bg-neutral/10">
                <ShieldCheck size={20} className="text-accent" />
                <span className="text-[9px] tracking-widest uppercase font-bold">Güvenli Ödeme</span>
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
