"use client";

import React from "react";
import Image from "next/image";
import Navbar from "@/components/layout/navbar";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react";

const toNum = (p: string | number): number => {
  if (typeof p === "number") return p;
  const n = parseFloat(String(p).replace(/[^0-9.,]/g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
};

const formatPrice = (price: string | number, qty = 1): string => {
  const num = toNum(price) * qty;
  // Eğer orijinal string TL içeriyorsa ₺ kullan
  const hasTL = typeof price === "string" && /TL|₺/i.test(price);
  return hasTL || typeof price !== "number"
    ? `${num.toLocaleString("tr-TR")} ₺`
    : `$${num.toLocaleString()}`;
};

const safeImage = (src: string) =>
  !src || src.trim() === "" ? "/hero_italian.png" : src;

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCart();

  const subtotal = items.reduce(
    (acc, item) => acc + toNum(item.price) * item.quantity,
    0
  );

  // Para birimi tahmini
  const hasTL = items.some(
    (item) => typeof item.price === "string" && /TL|₺/i.test(String(item.price))
  );
  const currencyLabel = hasTL ? "₺" : "$";
  const formatTotal = (n: number) =>
    hasTL
      ? `${n.toLocaleString("tr-TR")} ₺`
      : `$${n.toLocaleString()}`;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-40 pb-24 px-4 sm:px-6 lg:px-12 max-w-[1200px] mx-auto">
        <h1 className="text-4xl font-serif text-secondary uppercase tracking-tight mb-12">
          Alışveriş Sepeti
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-32 space-y-8 bg-neutral/10 border border-secondary/5">
            <div className="flex justify-center">
              <ShoppingBag size={48} strokeWidth={1} className="text-secondary/20" />
            </div>
            <p className="text-sm tracking-widest uppercase text-secondary/40">
              Sepetiniz şu an boş.
            </p>
            <Link href="/shop">
              <Button className="bg-secondary text-primary px-12">
                Alışverişe Başla
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Ürünler */}
            <div className="lg:col-span-2 space-y-8">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-5 pb-8 border-b border-secondary/5"
                >
                  {/* Görsel */}
                  <div className="relative w-24 h-32 bg-neutral/10 overflow-hidden shrink-0">
                    <Image
                      src={safeImage(item.image)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/hero_italian.png";
                      }}
                    />
                  </div>

                  <div className="flex-1 flex justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold uppercase leading-snug">
                        {item.name}
                      </h3>
                      {item.size && item.size !== "OS" && (
                        <p className="text-[10px] text-secondary/40 tracking-widest uppercase">
                          {item.size}
                        </p>
                      )}

                      {/* Miktar kontrolü */}
                      <div className="flex items-center gap-3 pt-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          className="w-7 h-7 border border-secondary/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-7 h-7 border border-secondary/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="text-right space-y-3 shrink-0">
                      <p className="text-sm font-bold text-secondary">
                        {formatPrice(item.price, item.quantity)}
                      </p>
                      <p className="text-[10px] text-secondary/30 font-medium">
                        {formatPrice(item.price)} / adet
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-secondary/20 hover:text-red-500 transition-colors"
                        aria-label="Kaldır"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Özet */}
            <div>
              <div className="bg-secondary text-primary p-8 space-y-6 sticky top-24">
                <h3 className="text-xs tracking-[0.3em] uppercase font-bold">
                  Sipariş Özeti
                </h3>
                <div className="space-y-4 pt-4 border-t border-primary/10 text-sm">
                  <div className="flex justify-between">
                    <span className="font-light opacity-70">Ara Toplam</span>
                    <span className="font-bold">{formatTotal(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-light opacity-70">Kargo</span>
                    <span className="font-bold text-emerald-400">ÜCRETSİZ</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-primary/10 text-lg">
                    <span className="font-serif">Toplam</span>
                    <span className="font-bold text-accent">
                      {formatTotal(subtotal)}
                    </span>
                  </div>
                </div>
                <Link href="/checkout" className="block pt-4">
                  <Button className="w-full bg-accent text-secondary hover:brightness-110 font-bold tracking-widest uppercase py-6 h-auto text-[11px]">
                    Ödemeye Geç →
                  </Button>
                </Link>
                <Link href="/shop" className="block text-center text-[10px] tracking-widest uppercase font-bold text-primary/40 hover:text-primary transition-colors pt-2">
                  Alışverişe Devam Et
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
