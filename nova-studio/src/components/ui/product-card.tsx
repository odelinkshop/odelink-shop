"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/store/useCart";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: Product;
}

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

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCart((state) => state.addItem);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(product.id));
  }, [product.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const mainImage = safeImage(product.images?.[0] || product.image);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.variations || product.variations.length === 0) {
      const firstSize = product.sizes?.[0] || "OS";
      addItem({
        id: `${product.id}-${firstSize}`,
        productId: product.id,
        name: product.name.split('|')[0].trim(),
        price: product.price,
        quantity: 1,
        size: firstSize,
        image: mainImage,
        url: product.url || "#",
      });
      return;
    }
    window.location.href = `/product/${product.slug}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-white mb-6">
          {mainImage ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full h-full"
            >
              <Image
                src={mainImage} alt={product.name} fill quality={100} priority={product.isNew}
                sizes="(max-width: 768px) 100vw, 25vw" className="object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.src.includes('pictures_large')) {
                    img.src = img.src.replace('pictures_large', 'pictures_mid');
                  } else {
                    img.style.display = 'none';
                  }
                }}
              />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-secondary/5 flex items-center justify-center">
               <span className="text-[8px] tracking-widest text-secondary/20 uppercase font-light">Resim Yok</span>
            </div>
          )}

          {/* Minimal Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNew && (
              <span className="text-[8px] tracking-[0.4em] text-secondary font-light bg-primary/80 backdrop-blur-md px-3 py-1.5 border border-secondary/5">
                YENİ KOLEKSİYON
              </span>
            )}
            {product.productType === 'Dijital' && (
              <span className="text-[8px] tracking-[0.4em] text-white font-black bg-blue-600/80 backdrop-blur-md px-3 py-1.5 border border-white/10">
                DİJİTAL ÜRÜN
              </span>
            )}
            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
              <span className="text-[8px] tracking-[0.4em] text-white font-black bg-rose-600/80 backdrop-blur-md px-3 py-1.5 border border-white/10">
                İNDİRİM %{Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}
              </span>
            )}
          </div>

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
          
          <button
            onClick={toggleFavorite}
            className="absolute top-4 right-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart size={18} strokeWidth={1} className={isFavorite ? "fill-secondary" : ""} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-start">
             <h4 className="text-[11px] tracking-[0.1em] uppercase font-light text-secondary/80 flex-1 pr-4">
              {product.name.split('|')[0].trim()}
            </h4>
            <div className="flex flex-col items-end">
              {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                <span className="text-[9px] font-light text-secondary/40 line-through mb-0.5">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
              )}
              <span className="text-[11px] font-medium text-secondary">
                {formatPrice(product.price, product.currency)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <div className="flex gap-2">
                {product.sizes?.slice(0, 3).map(s => (
                  <span key={s} className="text-[8px] tracking-widest text-secondary/40">{s}</span>
                ))}
             </div>
             <button 
               onClick={handleQuickAdd}
               className="text-[9px] tracking-[0.2em] font-light uppercase border-b border-secondary/20 hover:border-secondary transition-all"
             >
               Hızlı Ekle
             </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
