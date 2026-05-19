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
  let cleanPrice = String(price).replace(/[₺TL$€£]/g, '').trim();
  
  if (cleanPrice.includes('.') && cleanPrice.includes(',')) {
    cleanPrice = cleanPrice.replace(/\./g, '').replace(',', '.');
  } else if (cleanPrice.includes('.') && cleanPrice.split('.').pop()?.length === 3) {
    cleanPrice = cleanPrice.replace(/\./g, '');
  } else if (cleanPrice.includes(',')) {
    cleanPrice = cleanPrice.replace(',', '.');
  }
  
  const n = parseFloat(cleanPrice);
  if (isNaN(n)) return String(price);
  
  const symbolMap: Record<string, string> = {
    'TL': '₺', 'TRY': '₺', 'USD': '$', 'EUR': '€', 'GBP': '£'
  };
  
  const symbol = symbolMap[currency.toUpperCase()] || currency;
  
  const parts = n.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const formattedValue = parts.join(',');

  return symbol === '$' || symbol === '€' || symbol === '£' 
    ? `${symbol}${formattedValue}`
    : `${formattedValue} ${symbol}`;
};

const safeImage = (src: string | undefined): string => {
  if (!src || src.trim() === "" || src.includes('placeholder')) return "";
  let formattedSrc = src;
  if (formattedSrc.startsWith('//')) {
    formattedSrc = `https:${formattedSrc}`;
  }
  if (formattedSrc.includes('cdn.shopier.app')) {
    const apiBase = '/api';
    return `${apiBase}/sites/proxy-image?url=${encodeURIComponent(formattedSrc)}`;
  }
  return formattedSrc;
};

// Turkish color names to hex codes mapping
const colorMap: Record<string, string> = {
  "siyah": "#1A1A1A", "black": "#1A1A1A",
  "beyaz": "#FFFFFF", "white": "#FFFFFF",
  "gri": "#808080", "grey": "#808080", "gray": "#808080",
  "kırmızı": "#E31C25", "red": "#E31C25",
  "mavi": "#0055FF", "blue": "#0055FF",
  "yeşil": "#2E4A3F", "green": "#2E4A3F",
  "bej": "#F5F5DC", "beige": "#F5F5DC",
  "kahverengi": "#5C4033", "brown": "#5C4033",
  "turuncu": "#FF8C00", "orange": "#FF8C00",
  "pembe": "#FFC0CB", "pink": "#FFC0CB",
  "mor": "#800080", "purple": "#800080",
  "haki": "#4B5320", "khaki": "#F0E68C",
  "kamuflaj": "#6E7F5E", "camo": "#6E7F5E"
};

const resolveColor = (colorName: string): string => {
  const clean = colorName.trim().toLowerCase();
  if (clean.startsWith("#")) return clean;
  return colorMap[clean] || "#888888";
};

const getProductColors = (prod: Product) => {
  // 1. Check if variations has a color variation
  const colorVar = prod.variations?.find(v => 
    v.name.toLowerCase().includes("renk") || v.name.toLowerCase().includes("color")
  );
  if (colorVar && colorVar.options && colorVar.options.length > 0) {
    return colorVar.options;
  }
  
  // 2. Generate premium mock colors based on title to keep the cards complete
  const name = prod.name.toLowerCase();
  if (name.includes("retro") || name.includes("oversize") || name.includes("sweatshirt")) {
    return ["yeşil", "siyah", "kırmızı", "mavi", "pembe", "bej", "mor"];
  }
  if (name.includes("orman") || name.includes("kamuflaj")) {
    return ["haki", "bej"];
  }
  if (name.includes("mont") || name.includes("kürk") || name.includes("şişme")) {
    return ["siyah", "bej"];
  }
  if (name.includes("sparks") || name.includes("büyük beden")) {
    return ["siyah", "beyaz", "kahverengi"];
  }
  if (name.includes("grafiti") || name.includes("ayakkabı") || name.includes("sneaker")) {
    return ["siyah", "bej", "mavi"];
  }
  
  // Default elegant clothing colors
  return ["siyah", "bej"];
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

  const originalPriceNum = product.originalPrice ? parseFloat(String(product.originalPrice).replace(/[^\d.,]/g, "").replace(",", ".")) : 0;
  const priceNum = parseFloat(String(product.price).replace(/[^\d.,]/g, "").replace(",", "."));
  const discountPercent = product.discountPercent || (originalPriceNum > priceNum ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100) : null);

  const colors = getProductColors(product);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="group relative flex flex-col h-full bg-white transition-all duration-300 border border-secondary/5 hover:border-secondary/15 p-2 shadow-xs"
    >
      {/* Link surrounding Image and Main Info */}
      <Link href={`/product/${product.slug}`} className="block flex-1">
        <div className="relative aspect-[3/4] overflow-hidden bg-white mb-4">
          {mainImage ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
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

          {/* Red Discount Banner Overlay on the Bottom-Left of the image */}
          {discountPercent && (
            <div className="absolute bottom-3 left-3 bg-[#e31c25] text-white text-[9px] font-bold tracking-wider px-2 py-1 flex items-center gap-1 z-10 uppercase shadow-xs">
              <span role="img" aria-label="discount" className="text-[10px]">🏷</span> %{discountPercent} İNDİRİM
            </div>
          )}

          {/* Favorite button overlay */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 text-secondary p-1.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-xs shadow-xs transition-all duration-300"
          >
            <Heart size={16} strokeWidth={1.5} className={isFavorite ? "fill-[#e31c25] text-[#e31c25]" : "text-secondary"} />
          </button>
        </div>

        {/* Text Area */}
        <div className="space-y-1.5 px-1 pb-1">
          <h4 className="text-[12px] font-bold text-secondary tracking-tight line-clamp-2 leading-tight uppercase font-sans">
            {product.name.split('|')[0].trim()}
          </h4>
          
          <div className="flex items-center gap-2 font-sans">
            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
              <span className="text-[10px] font-light text-secondary/40 line-through">
                {formatPrice(product.originalPrice, product.currency)}
              </span>
            )}
            <span className={cn(
              "text-[12px] font-bold",
              product.originalPrice && Number(product.originalPrice) > Number(product.price) ? "text-[#e31c25]" : "text-secondary"
            )}>
              {formatPrice(product.price, product.currency)}
            </span>
          </div>
        </div>
      </Link>

      {/* Non-link Swatches and CTA elements */}
      <div className="px-1 pt-1 pb-2">
        {/* Colors Row */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {colors.map((color, i) => {
              const hex = resolveColor(color);
              const isWhite = hex.toLowerCase() === "#ffffff";
              return (
                <span 
                  key={i} 
                  className={cn(
                    "w-3.5 h-3.5 rounded-full border border-secondary/10 inline-block cursor-pointer transition-transform duration-300 hover:scale-125",
                    isWhite && "border-secondary/25 shadow-xs"
                  )}
                  style={{ backgroundColor: hex }}
                  title={color}
                />
              );
            })}
          </div>
        )}

        {/* Full width premium Red Button */}
        <button 
          onClick={handleQuickAdd}
          className="w-full bg-[#e31c25] hover:bg-[#b0141b] text-white text-[10px] font-bold tracking-[0.2em] py-3 transition-all duration-300 font-sans uppercase rounded-xs"
        >
          SEÇENEKLERİ BELİRLEYİN
        </button>
      </div>
    </motion.div>
  );
};
