"use client";

import React from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-40 pb-24 px-6 lg:px-12 max-w-[900px] mx-auto">
        <div className="text-center mb-24 space-y-6">
          <span className="text-xs tracking-[0.6em] uppercase text-accent font-bold italic">Support Editor Mode</span>
          <h1 className="text-6xl font-serif text-secondary uppercase tracking-tighter">Sıkça Sorulan Sorular Yapılandırması</h1>
          <p className="text-secondary/60 italic">Müşterilerinizin en çok merak edeceği soruları burada yanıtlayın.</p>
        </div>

        <div className="space-y-12">
          <div className="p-10 border-2 border-dashed border-secondary/20 space-y-12">
             
             <div className="space-y-4">
                <h3 className="text-2xl font-serif text-secondary">KATEGORİ 1: Sipariş & Gönderim</h3>
                <p className="text-sm text-secondary/70 leading-relaxed italic">
                   <span className="font-bold text-secondary not-italic underline">Öneri:</span> "Kargom kaç günde gelir?", "Hangi kargo şirketi ile çalışıyorsunuz?", "Kargo ücretli mi?" gibi soruları burada yanıtlayın. Özellikle $500 üzeri ücretsiz kargo gibi avantajlarınızı vurgulayın.
                </p>
             </div>

             <div className="space-y-4">
                <h3 className="text-2xl font-serif text-secondary">KATEGORİ 2: Ödeme & Güvenlik</h3>
                <p className="text-sm text-secondary/70 leading-relaxed italic">
                   <span className="font-bold text-secondary not-italic underline">Öneri:</span> "Taksit imkanı var mı?", "Kapıda ödeme kabul ediyor musunuz?", "Kart bilgilerim güvende mi?" gibi güven veren açıklamalar ekleyin. SSL sertifikalarınızdan bahsedin.
                </p>
             </div>

             <div className="space-y-4">
                <h3 className="text-2xl font-serif text-secondary">KATEGORİ 3: Ürün & Beden</h3>
                <p className="text-sm text-secondary/70 leading-relaxed italic">
                   <span className="font-bold text-secondary not-italic underline">Öneri:</span> "Bedenimi nasıl seçerim?", "Ürünleriniz orijinal mi?", "Özel üretim yapıyor musunuz?" gibi ürün odaklı sorulara yer vererek satış kaçırmamanızı sağlayın.
                </p>
             </div>

          </div>

          <div className="mt-12 text-center">
             <p className="text-xs text-secondary/40">Bu bölüm dinamik bir SSS (Accordion) bileşeniyle entegre edilebilir.</p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
