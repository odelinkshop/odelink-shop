"use client";

import React, { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/navbar";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import { useStoreData } from "@/store/useStoreData";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react";

const toNum = (p: string | number): number => {
  if (typeof p === "number") return p;
  const n = parseFloat(String(p).replace(/[^0-9.,]/g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
};

const formatPrice = (price: string | number, qty = 1): string => {
  const num = toNum(price) * qty;
  return new Intl.NumberFormat('tr-TR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(num) + " ₺";
};

const safeImage = (src: string) =>
  !src || src.trim() === "" ? "/hero_italian.png" : src;

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCart();
  const storeData = (useStoreData as any)();
  const shopierUser = storeData?.settings?.shopier_user || storeData?.settings?.shopierUrl;
  const [isCheckingOut, setIsCheckingOut] = useState(false);


  const subtotal = items.reduce(
    (acc, item) => acc + toNum(item.price) * item.quantity,
    0
  );

  const currencyLabel = "₺";
  const formatTotal = (n: number) =>
    `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`;


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
                      <p className="text-[11px] text-secondary font-bold tracking-tight">
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
                
                <button 
                  disabled={isCheckingOut}
                  onClick={async () => {
                    if (items.length === 0 || isCheckingOut) return;
                    setIsCheckingOut(true);
                    
                    if (typeof window !== "undefined" && (window as any).reportAnalyticsEvent) {
                      (window as any).reportAnalyticsEvent({
                        type: 'begin_checkout',
                        page: '/cart',
                        target: 'checkout_button',
                        label: 'Proceed to Shopier',
                        amount: subtotal
                      });
                    }
                    
                    const item = items[0];
                    const finalUrl = item.url && item.url !== "#" && !item.url.startsWith('/') 
                      ? (item.url.startsWith('//') ? `https:${item.url}` : (item.url.startsWith('http') ? item.url : `https://www.shopier.com/${item.url}`))
                      : (shopierUser && item.productId ? `https://www.shopier.com/${shopierUser}/${item.productId}` : null);

                    if (!finalUrl) {
                      alert("Ödeme sayfasına yönlendirilemedi. Lütfen mağaza sahibiyle iletişime geçin.");
                      setIsCheckingOut(false);
                      return;
                    }

                    try {
                      // Fetch resolved checkout data from backend to ensure variations are parsed correctly
                      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://api.odelink.shop"}/api/payments/shopier-checkout-data?url=${encodeURIComponent(finalUrl)}&size=${encodeURIComponent(item.size || '')}`;
                      const response = await fetch(apiUrl);
                      const resData = await response.json();

                      if (resData.success && resData.shopName && resData.productId) {
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = `https://www.shopier.com/s/shipping/${resData.shopName}`;
                        
                        // Add product_id
                        const inputId = document.createElement('input');
                        inputId.type = 'hidden';
                        inputId.name = 'product_id';
                        inputId.value = resData.productId;
                        form.appendChild(inputId);

                        // If variation/size is present and resolved, send its option ID
                        if (resData.variationId) {
                          const inputSize = document.createElement('input');
                          inputSize.type = 'hidden';
                          inputSize.name = 'size';
                          inputSize.value = resData.variationId;
                          form.appendChild(inputSize);

                          const inputVarName = document.createElement('input');
                          inputVarName.type = 'hidden';
                          inputVarName.name = 'first_variation_name';
                          inputVarName.value = resData.variationName || 'Beden ';
                          form.appendChild(inputVarName);

                          const inputVarId = document.createElement('input');
                          inputVarId.type = 'hidden';
                          inputVarId.name = 'first_variation_id';
                          inputVarId.value = '0';
                          form.appendChild(inputVarId);
                        }

                        // Add quantity
                        const inputQty = document.createElement('input');
                        inputQty.type = 'hidden';
                        inputQty.name = 'quantity';
                        inputQty.value = String(item.quantity || 1);
                        form.appendChild(inputQty);

                        document.body.appendChild(form);
                        form.submit();
                        document.body.removeChild(form);
                        return;
                      }
                    } catch (err) {
                      console.error('Error fetching/parsing Shopier checkout data:', err);
                    }

                    // Fallback redirect
                    setIsCheckingOut(false);
                    window.location.href = finalUrl;
                  }}
                  className="w-full bg-[#C5A059] text-black hover:brightness-110 font-bold tracking-[0.2em] uppercase py-6 h-auto text-[11px] mt-4 flex items-center justify-center transition-all cursor-pointer border-0 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-3 w-3 border-2 border-black border-t-transparent" />
                      YÖNLENDİRİLİYOR...
                    </span>
                  ) : "ÖDEMEYE GEÇ →"}
                </button>

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
