"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart, toNum } from "@/store/useCart";
import { ChevronLeft, Lock, Truck, CreditCard, CheckCircle2, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [step, setStep] = useState(1);
  const shipping = 50;
  const tax = total * 0.08;

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-secondary">
      {/* Header */}
      <header className="py-8 px-6 lg:px-12 border-b border-secondary/10 flex justify-between items-center bg-background">
        <Link href="/">
          <h1 className="text-3xl font-serif tracking-tighter">NOVA</h1>
        </Link>
        <div className="flex items-center space-x-2 text-xs tracking-widest uppercase text-secondary/40">
          <Lock size={14} />
          <span>Secure Checkout</span>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Left Side - Form */}
        <div className="lg:col-span-7 p-6 lg:p-16 space-y-16">
          <Link href="/cart" className="inline-flex items-center space-x-2 text-xs tracking-widest uppercase hover:text-accent transition-colors">
            <ChevronLeft size={16} />
            <span>Sepete Dön</span>
          </Link>

          {/* Steps */}
          <div className="space-y-12">
            {/* Step 1: Shipping */}
            <div className={step >= 1 ? "opacity-100" : "opacity-30"}>
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-secondary text-primary flex items-center justify-center text-xs font-bold">1</div>
                <h2 className="text-2xl font-serif">Teslimat Bilgileri</h2>
              </div>
              
              {step === 1 && (
                <div className="grid grid-cols-2 gap-6 animate-fade-in">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold opacity-40">E-Posta Adresi</label>
                    <input type="email" className="w-full bg-transparent border-b border-secondary/20 py-3 focus:border-secondary outline-none transition-colors" placeholder="alex@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold opacity-40">Ad</label>
                    <input type="text" className="w-full bg-transparent border-b border-secondary/20 py-3 focus:border-secondary outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold opacity-40">Soyad</label>
                    <input type="text" className="w-full bg-transparent border-b border-secondary/20 py-3 focus:border-secondary outline-none transition-colors" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold opacity-40">Adres</label>
                    <input type="text" className="w-full bg-transparent border-b border-secondary/20 py-3 focus:border-secondary outline-none transition-colors" placeholder="Sokak, Mahalle, Kapı No" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold opacity-40">Şehir</label>
                    <input type="text" className="w-full bg-transparent border-b border-secondary/20 py-3 focus:border-secondary outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold opacity-40">Posta Kodu</label>
                    <input type="text" className="w-full bg-transparent border-b border-secondary/20 py-3 focus:border-secondary outline-none transition-colors" />
                  </div>
                  <div className="col-span-2 pt-6">
                    <Button size="lg" className="w-full" onClick={() => setStep(2)}>
                      ÖDEMEYE GEÇ
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Payment */}
            <div className={step >= 2 ? "opacity-100" : "opacity-30"}>
              <div className="flex items-center space-x-4 mb-8">
                <div className={`w-8 h-8 rounded-full ${step >= 2 ? 'bg-secondary text-primary' : 'border border-secondary/20 text-secondary/20'} flex items-center justify-center text-xs font-bold`}>2</div>
                <h2 className="text-2xl font-serif">Ödeme Yöntemi</h2>
              </div>
              
              {step === 2 && (
                <div className="space-y-8 animate-fade-in">
                   <div className="p-6 border border-secondary bg-background/50">
                      <div className="flex items-center space-x-4 mb-6">
                        <CreditCard size={20} />
                        <span className="text-sm font-medium">Kredi veya Banka Kartı</span>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 space-y-2">
                          <label className="text-[10px] tracking-widest uppercase font-bold opacity-40">Kart Numarası</label>
                          <input type="text" className="w-full bg-transparent border-b border-secondary/20 py-3 focus:border-secondary outline-none transition-colors" placeholder="0000 0000 0000 0000" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] tracking-widest uppercase font-bold opacity-40">Son Kullanma</label>
                          <input type="text" className="w-full bg-transparent border-b border-secondary/20 py-3 focus:border-secondary outline-none transition-colors" placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] tracking-widest uppercase font-bold opacity-40">CVC</label>
                          <input type="text" className="w-full bg-transparent border-b border-secondary/20 py-3 focus:border-secondary outline-none transition-colors" placeholder="123" />
                        </div>
                      </div>
                   </div>
                   <Button size="lg" className="w-full" onClick={() => setStep(3)}>
                      SİPARİŞİ TAMAMLA
                   </Button>
                </div>
              )}
            </div>

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="flex flex-col items-center justify-center text-center py-20 space-y-6 animate-fade-in">
                <CheckCircle2 size={64} className="text-accent" />
                <h2 className="text-4xl font-serif">Siparişiniz İçin Teşekkür Ederiz.</h2>
                <p className="text-secondary/60 max-w-md">Siparişiniz #NOV-88219 alındı ve işleme konuldu. Onay e-postasını adresinize gönderdik.</p>
                <Link href="/">
                  <Button variant="outline" size="lg" className="mt-8">Anasayfaya Dön</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Summary */}
        <div className="lg:col-span-5 bg-background p-6 lg:p-16 border-l border-secondary/10 min-h-screen">
          <div className="sticky top-16 space-y-12">
            <h3 className="text-xl font-serif">Sipariş Özeti</h3>
            
            <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {items.length === 0 ? (
                <div className="text-center py-10 opacity-20 uppercase text-[10px] tracking-widest">Sepetiniz Boş</div>
              ) : items.map((item) => (
                <div key={item.id} className="flex items-center space-x-6">
                  <div className="relative w-20 h-24 bg-neutral/30 overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-secondary text-primary text-[10px] flex items-center justify-center rounded-full">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-serif">{item.name}</h4>
                    <p className="text-[10px] tracking-widest uppercase text-secondary/40 mt-1">
                      Size: {item.size || 'One Size'}
                    </p>
                  </div>
                  <span className="text-sm font-medium">${(toNum(item.price) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-secondary/10">
              <div className="flex justify-between text-sm">
                <span className="text-secondary/60">Ara Toplam</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary/60">Kargo</span>
                <span>{total > 0 ? `$${shipping.toLocaleString()}` : '$0'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary/60">Vergi (8%)</span>
                <span>${tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-serif pt-4 border-t border-secondary/10">
                <span>Toplam</span>
                <span className="text-accent">${(total + (total > 0 ? shipping : 0) + tax).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="p-6 bg-secondary/5 space-y-4">
              <div className="flex items-center space-x-4">
                <Truck size={18} />
                <span className="text-xs font-medium">Express Worldwide Delivery</span>
              </div>
              <div className="flex items-center space-x-4">
                <ShieldCheck size={18} />
                <span className="text-xs font-medium">2-Year Material Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
