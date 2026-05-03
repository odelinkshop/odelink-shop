"use client";

import React from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-40 pb-24 px-6 lg:px-12 max-w-[1000px] mx-auto">
        <div className="mb-24 space-y-6 text-center lg:text-left">
          <span className="text-xs tracking-[0.6em] uppercase text-accent font-bold italic">SaaS Editor Mode</span>
          <h1 className="text-6xl font-serif text-secondary uppercase tracking-tighter">İptal & İade Politikası Düzenleme Alanı</h1>
          <p className="text-secondary/60 italic">Bu sayfa, site sahibinin kendi politikalarını girmesi için hazırlanmış bir şablondur.</p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-16">
          
          <div className="p-12 bg-neutral/10 border-2 border-dashed border-secondary/20 rounded-none space-y-8">
             <div className="space-y-4">
                <h3 className="text-2xl font-serif text-secondary">BÖLÜM 1: İade Şartlarını Belirleyin</h3>
                <p className="text-sm text-secondary/70 leading-relaxed">
                  <span className="font-bold text-secondary underline">TALİMAT:</span> Buraya müşterilerinizin hangi durumlarda ürün iade edebileceğini yazın. 
                  Genellikle 14 günlük yasal cayma hakkından, ürünün kullanılmamış olması gerektiğinden ve orijinal ambalaj şartından bahsedilir. 
                  Lüks bir marka olduğunuz için ürünlerin etiketlerinin sökülmemiş olması gerektiğini vurgulamanız önemlidir.
                </p>
             </div>

             <div className="space-y-4">
                <h3 className="text-2xl font-serif text-secondary">BÖLÜM 2: Geri Ödeme Sürecini Tanımlayın</h3>
                <p className="text-sm text-secondary/70 leading-relaxed">
                  <span className="font-bold text-secondary underline">TALİMAT:</span> İade onaylandıktan sonra paranın kaç gün içinde hesaba yatacağını belirtin. 
                  Standart olarak "7-10 iş günü" ibaresi kullanılır. Banka komisyonları veya taksitli ödemelerin iade şekli (taksit taksit mi yoksa tek seferde mi) hakkında bilgi vermeniz müşteri memnuniyetini artırır.
                </p>
             </div>

             <div className="space-y-4">
                <h3 className="text-2xl font-serif text-secondary">BÖLÜM 3: İstisnaları Listeleyin</h3>
                <p className="text-sm text-secondary/70 leading-relaxed">
                  <span className="font-bold text-secondary underline">TALİMAT:</span> Hijyen veya özel üretim nedeniyle iade edilemeyecek ürünleri (küpe, iç giyim, kişiye özel tasarım vb.) buraya açıkça yazın. 
                  Bu bölüm hukuki olarak sizi koruyacak en önemli kısımdır.
                </p>
             </div>
          </div>

          <div className="p-8 bg-secondary text-primary text-center">
             <p className="text-[10px] tracking-widest uppercase font-bold">BU ALAN DİNAMİK OLARAK YÖNETİM PANELİNDEN DOLDURULACAKTIR</p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
