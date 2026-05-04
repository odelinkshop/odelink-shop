"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { Plus, ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/store/useCart";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: Product;
}

/** Fiyatı düzgün göstermek için: "150 TL" ya da 150 → "150 TL" */
const formatPrice = (price: string | number): string => {
  if (!price && price !== 0) return "-";
  let str = String(price).trim();
  if (/[₺TL$€£]/.test(str)) return str;
  
  // Binlik ayracı olan noktayı temizle, virgülü noktaya çevir
  const n = parseFloat(str.replace(/\./g, '').replace(',', '.'));
  if (isNaN(n)) return str;
  return `${n.toLocaleString('tr-TR')} ₺`;
};

/** Görsel url geçerliyse kullan, yoksa fallback */
const safeImage = (src: string | undefined): string => {
  if (!src || src.trim() === "" || src.includes('placeholder')) return "";
  
  // Shopier resim kalitesini 2K'ya (XLarge) yükselt (Tüm formatları tanı)
  if (src.includes('cdn.shopier.app/pictures')) {
    // HAR dosyasına göre mid formatı garanti, xlarge'ı deneyeceğiz
    return src.replace(/pictures_(mid|large|small|mid_mid|standard|mid_large|thumb)/, 'pictures_xlarge');
  }
  return src;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCart((state) => state.addItem);
  const [isFavorite, setIsFavorite] = useState(false);

  // Favori durumunu localStorage'dan kontrol et
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
    // Özel bir event tetikleyerek diğer bileşenleri haberdar et
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
      });
      return;
    }

    window.location.href = `/product/${product.slug}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative cursor-pointer"
    >
      {/* Favori butonu - Link'in dışında olması şart */}
      <button
        onClick={toggleFavorite}
        className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center border border-secondary/10 hover:bg-white transition-all duration-300 z-30"
      >
        <Heart 
          size={18} 
          className={cn("transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-secondary")} 
        />
      </button>

      <Link href={`/product/${product.slug}`} className="block relative z-10">
        {/* Görsel */}
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral/10 mb-5 group">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="w-full h-full"
          >
            <Image
              src={mainImage}
              alt={product.name}
              fill
              quality={100}
              priority={product.isNew}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (img.src.includes('pictures_xlarge')) {
                  img.src = img.src.replace('pictures_xlarge', 'pictures_large');
                } else if (img.src.includes('pictures_large')) {
                  img.src = img.src.replace('pictures_large', 'pictures_mid');
                } else {
                  // Resim tamamen yoksa manken basma, görünmez yap veya sil
                  img.style.display = 'none';
                }
              }}
            />
          </motion.div>

          {/* Yeni etiketi */}
          {product.isNew && (
            <span className="absolute top-4 left-4 bg-secondary text-primary text-[8px] font-black tracking-[0.2em] uppercase px-3 py-1.5 backdrop-blur-sm">
              YENİ
            </span>
          )}

          {/* Quick Add butonu */}
          <button
            onClick={handleQuickAdd}
            title="Sepete Ekle"
            className="absolute bottom-4 right-4 w-11 h-11 bg-secondary text-primary border border-secondary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 z-10"
          >
            <ShoppingBag size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Metin alanı */}
        <div className="space-y-1 text-center px-1">
          <h4 className="text-[12px] tracking-tight uppercase font-bold text-secondary line-clamp-1 leading-tight">
            {product.name.split('|')[0].trim()}
          </h4>

          <div className="flex flex-col items-center space-y-1">
            {/* Eski fiyat */}
            {product.oldPrice ? (
              <span className="text-[10px] text-secondary/40 line-through tracking-widest">
                {formatPrice(product.oldPrice)}
              </span>
            ) : (
              <span className="text-[10px] opacity-0 select-none">0</span>
            )}

            {/* Güncel fiyat */}
            <div className="mt-1">
              <span className="text-[12px] font-black tracking-widest text-secondary">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* Varyasyonlar (beden önizlemesi) */}
          {product.variations && product.variations.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center pt-1">
              {product.variations[0]?.options?.slice(0, 4).map((opt: string) => (
                <span
                  key={opt}
                  className="text-[9px] border border-secondary/10 px-2 py-0.5 text-secondary/50 font-medium"
                >
                  {opt}
                </span>
              ))}
              {(product.variations[0]?.options?.length ?? 0) > 4 && (
                <span className="text-[9px] text-secondary/30">+{(product.variations[0]?.options?.length ?? 0) - 4}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};
