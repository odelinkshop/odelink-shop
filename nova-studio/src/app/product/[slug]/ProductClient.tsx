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
  Star
} from "lucide-react";
import { useCart } from "@/store/useCart";
import { cn } from "@/lib/utils";

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
  const formatted = n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${formatted} TL`;
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
  const [openAccordion, setOpenAccordion] = useState<string | null>("ozellikler");

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
      <main className="bg-white text-black min-h-screen pt-32 pb-24 px-4 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* SOL KOLON: GÖRSELLER */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allImages.slice(0, 4).map((img, idx) => (
                <div key={idx} className="aspect-[2/3] bg-gray-50 overflow-hidden">
                  <img 
                    src={safeImage(img)} 
                    alt="" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SAĞ KOLON: ÜRÜN BİLGİSİ (SOKAK BUTIK STYLE) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-orange-400 text-orange-400" />)}
                <span className="text-[11px] text-gray-400 ml-2">(2)</span>
              </div>
              <div className="text-3xl font-black italic tracking-tighter">
                {formatPrice(product.price)}
              </div>
            </div>

            <div className="space-y-6">
              {/* Renk Seçimi (Thumbnail'lar) */}
              <div className="space-y-3">
                <div className="text-[13px] font-bold">Renk: <span className="font-normal text-gray-500">Yıkamalı Siyah</span></div>
                <div className="flex gap-2">
                  {allImages.slice(0, 4).map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={cn(
                        "w-16 h-20 border-2 transition-all p-0.5",
                        selectedImage === idx ? "border-black" : "border-transparent opacity-60"
                      )}
                    >
                      <img src={safeImage(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Beden Seçimi */}
              {((product.sizes && product.sizes.length > 0) || (product.variations && product.variations.length > 0)) && (
                <div className="space-y-3">
                  <div className="text-[13px] font-bold">Beden:</div>
                  <div className="flex flex-wrap gap-2">
                    {((product.sizes && product.sizes.length > 0) ? product.sizes : (product.variations?.[0]?.options || [])).map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "min-w-[80px] h-10 flex items-center justify-center text-[12px] font-bold transition-all",
                          selectedSize === size ? "bg-black text-white" : "bg-white text-black border border-gray-200 hover:border-black"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SATIN ALMA ALANI */}
            <div className="flex gap-2">
              <div className="flex items-center border border-gray-200 h-14 px-4 gap-6">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-gray-400 hover:text-black"><Minus size={16} /></button>
                <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="text-gray-400 hover:text-black"><Plus size={16} /></button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={cn(
                  "flex-1 h-14 flex items-center justify-center gap-3 text-[13px] font-bold transition-all",
                  isAdded ? "bg-green-600 text-white" : "bg-black text-white hover:bg-gray-800"
                )}
              >
                <ShoppingBag size={18} />
                {isAdded ? "EKLENDİ" : "SEPETE EKLE"}
              </button>
              <button 
                onClick={toggleFavorite}
                className="w-14 h-14 bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-all"
              >
                <Heart size={20} className={cn(isFavorite && "fill-white")} />
              </button>
            </div>

            {/* GÜVEN İKONLARI */}
            <div className="flex justify-between items-center py-6 border-y border-gray-100">
              <div className="flex items-center gap-3">
                <Truck size={24} strokeWidth={1.5} />
                <div className="text-[10px] font-bold leading-tight">HIZLI<br/>GÖNDERİ</div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} strokeWidth={1.5} />
                <div className="text-[10px] font-bold leading-tight">GÜVENLİ<br/>ALIŞVERİŞ</div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw size={24} strokeWidth={1.5} />
                <div className="text-[10px] font-bold leading-tight">İADE VE<br/>DEĞİŞİM</div>
              </div>
            </div>

            {/* AKORDİYONLAR */}
            <div className="pt-4">
              <Accordion 
                id="ozellikler" 
                title="ÜRÜN ÖZELLİKLERİ" 
                content={
                  <div dangerouslySetInnerHTML={{ __html: product.description || "Ürün açıklaması bulunmuyor." }} />
                } 
              />
              <Accordion 
                id="yorumlar" 
                title="YORUMLAR" 
                content="Bu ürün için henüz yorum yapılmamış." 
              />
              <Accordion 
                id="teslimat" 
                title="GARANTİ VE TESLİMAT" 
                content="Siparişleriniz 1-3 iş günü içerisinde kargoya verilir." 
              />
              <Accordion 
                id="taksit" 
                title="TAKSİT SEÇENEKLERİ" 
                content="Tüm kredi kartlarına 12 aya varan taksit seçenekleri." 
              />
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
