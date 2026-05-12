"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart, toNum } from "@/store/useCart";
import { useStoreData } from "@/store/useStoreData";
import { ChevronLeft, Lock, ShoppingBag, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function CheckoutPage() {
  const { items, total } = useCart();
  const { settings } = useStoreData();
  
  // Shopier URL'sini bul (Ayarlardan veya ürünlerden)
  const shopierUrl = settings?.shopier_url || settings?.shopierUrl || (items.length > 0 ? (items[0] as any).shopierUrl : "");
  
  const shipping = 0; // Ücretsiz kargo vurgusu için
  const totalInTL = total;

  const formatPrice = (n: number) => {
    return new Intl.NumberFormat('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(n) + " ₺";
  };

  const handleFinalRedirect = () => {
    if (shopierUrl) {
      window.location.href = shopierUrl;
    } else {
      // Eğer Shopier URL yoksa ana sayfaya dön (Güvenlik önlemi)
      window.location.href = "/";
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center space-y-8 p-6">
        <ShoppingBag size={64} strokeWidth={1} className="text-secondary/20" />
        <h2 className="text-2xl font-serif uppercase tracking-tight">Sepetiniz Boş</h2>
        <Link href="/shop">
          <Button className="bg-black text-white px-12 py-6 h-auto tracking-widest uppercase text-xs font-bold">
            ALIŞVERİŞE BAŞLA
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-black">
      {/* Header */}
      <header className="py-8 px-6 lg:px-12 border-b border-black/5 flex justify-between items-center bg-white">
        <Link href="/">
          <h1 className="text-2xl font-serif tracking-tighter uppercase font-black italic">NOVA</h1>
        </Link>
        <div className="flex items-center space-x-2 text-[10px] tracking-[0.2em] uppercase font-bold text-black/40">
          <Lock size={12} />
          <span>GÜVENLİ ÖDEME SİSTEMİ</span>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[calc(100vh-100px)]">
        
        {/* SOL KOLON: SİPARİŞ ONAY VE BİLGİLENDİRME */}
        <div className="lg:col-span-7 p-6 lg:p-20 space-y-16 bg-white">
          <div className="space-y-12">
            <div className="space-y-4">
              <Link href="/cart" className="inline-flex items-center space-x-2 text-[10px] tracking-[0.2em] uppercase font-bold hover:text-gray-500 transition-colors">
                <ChevronLeft size={14} />
                <span>SEPETE DÖN</span>
              </Link>
              <h2 className="text-4xl lg:text-5xl font-serif italic tracking-tighter">Sipariş Özeti</h2>
            </div>

            <div className="space-y-8 py-10 border-y border-black/5">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold uppercase tracking-tight">Ürün Kontrolü</h3>
                  <p className="text-sm text-black/60 leading-relaxed">
                    Siparişinizdeki ürünleri ve adetleri son bir kez kontrol edin. Her şey hazırsa ödeme aşamasına geçebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-black/5 text-black rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold uppercase tracking-tight">Güvenli Ödeme</h3>
                  <p className="text-sm text-black/60 leading-relaxed">
                    "Ödemeyi Tamamla" butonuna bastığınızda, Shopier altyapısı üzerinden güvenli ödeme sayfasına aktarılacaksınız.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border border-black/5 space-y-6">
              <div className="flex items-center space-x-4 text-emerald-600">
                <ShieldCheck size={24} />
                <span className="text-xs font-black uppercase tracking-widest">256-BIT SSL GÜVENLİ ÖDEME</span>
              </div>
              <p className="text-[12px] text-black/50 leading-relaxed font-medium">
                Ödemeleriniz Shopier güvencesiyle uçtan uca şifrelenir. Kart bilgileriniz asla Nova sunucularında saklanmaz ve doğrudan banka altyapısı üzerinden işlenir.
              </p>
            </div>
          </div>
        </div>

        {/* SAĞ KOLON: ÜRÜN LİSTESİ VE FİNAL BUTONU */}
        <div className="lg:col-span-5 bg-[#FAF9F6] p-6 lg:p-20 lg:border-l border-black/5">
          <div className="sticky top-12 space-y-12">
            <div className="space-y-8">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-6">
                  <div className="relative w-24 h-32 bg-white overflow-hidden shadow-sm border border-black/5 group">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-lg">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-bold uppercase tracking-tight leading-snug">{item.name.split('|')[0].trim()}</h4>
                    <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-black/40">
                      Beden: {item.size || 'Standart'}
                    </p>
                    <div className="pt-2 text-sm font-black italic">
                      {formatPrice(toNum(item.price) * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-10 border-t border-black/10">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-black/50">
                <span>Ara Toplam</span>
                <span>{formatPrice(totalInTL)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-emerald-600">
                <span>Kargo</span>
                <span className="font-black">ÜCRETSİZ</span>
              </div>
              <div className="flex justify-between text-2xl font-serif italic font-black pt-6 border-t border-black/10">
                <span className="tracking-tighter">Toplam</span>
                <span className="text-black tracking-tighter">{formatPrice(totalInTL)}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full h-20 bg-black text-white hover:bg-gray-900 transition-all shadow-xl group"
                onClick={handleFinalRedirect}
              >
                <span className="text-[12px] font-black tracking-[0.3em] uppercase flex items-center gap-4">
                  ÖDEMEYİ TAMAMLA
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>
              <div className="flex items-center justify-center gap-3 text-[10px] text-black/40 font-bold uppercase tracking-widest">
                <ExternalLink size={12} />
                <span>Shopier Güvenli Ödeme Sayfasına Yönlendiriliyorsunuz</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
