"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/useCart";

interface ProductCardProps {
  product: Product;
}

/** Fiyatı düzgün göstermek için: "150 TL" ya da 150 → "150 TL" */
const formatPrice = (price: string | number): string => {
  if (!price && price !== 0) return "-";
  const str = String(price).trim();
  // Zaten para birimi içeriyorsa direkt döndür
  if (/[₺TL$€£]/.test(str)) return str;
  // Sayısal ise ₺ ekle
  const n = parseFloat(str.replace(',', '.'));
  if (isNaN(n)) return str;
  return `${n.toLocaleString('tr-TR')} ₺`;
};

/** Görsel url geçerliyse kullan, yoksa fallback */
const safeImage = (src: string | undefined): string => {
  if (!src || src.trim() === "") return "/hero_italian.png";
  return src;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCart((state) => state.addItem);

  const mainImage = safeImage(product.images?.[0] || product.image);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Varyasyon yoksa direkt ekle
    if (!product.variations || product.variations.length === 0) {
      const firstSize = product.sizes?.[0] || "OS";
      addItem({
        id: `${product.id}-${firstSize}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        size: firstSize,
        image: mainImage,
      });
      return;
    }

    // Varyasyon varsa ürün sayfasına yönlendir
    window.location.href = `/product/${product.slug}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative cursor-pointer"
    >
      <Link href={`/product/${product.slug}`}>
        {/* Görsel */}
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral/40 mb-6">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/hero_italian.png";
            }}
          />

          {/* Yeni etiketi */}
          {product.isNew && (
            <span className="absolute top-4 left-4 bg-accent text-secondary text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1">
              YENİ
            </span>
          )}

          {/* Ücretsiz kargo etiketi */}
          {product.hasFreeShipping && (
            <span className="absolute top-4 right-14 bg-emerald-600 text-white text-[8px] font-black tracking-[0.1em] uppercase px-2 py-1">
              ÜCRETSİZ
            </span>
          )}

          {/* Quick Add butonu */}
          <button
            onClick={handleQuickAdd}
            title="Sepete Ekle"
            className="absolute bottom-4 right-4 w-10 h-10 bg-background border border-secondary/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300 z-10"
          >
            <Plus size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Metin alanı */}
        <div className="space-y-2 text-center px-2">
          <h4 className="text-[11px] tracking-widest uppercase font-medium text-secondary/80 line-clamp-2 min-h-[32px] leading-relaxed">
            {product.name}
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
            <div className="bg-secondary text-primary text-[11px] px-4 py-1.5 font-bold tracking-widest">
              {formatPrice(product.price)}
            </div>
          </div>

          {/* Varyasyonlar (beden önizlemesi) */}
          {product.variations && product.variations.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center pt-1">
              {product.variations[0]?.options?.slice(0, 4).map((opt) => (
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
