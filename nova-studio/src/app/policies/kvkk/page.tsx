"use client";

import React from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

import { useStoreData } from "@/store/useStoreData";

export default function KVKKPage() {
  const { settings, siteName } = useStoreData();
  const kvkkContent = settings.policies?.kvkk;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-40 pb-24 px-6 lg:px-12 max-w-[1000px] mx-auto">
        <div className="mb-24 space-y-6">
          <span className="text-xs tracking-[0.6em] uppercase text-accent font-bold italic">Legal Documentation</span>
          <h1 className="text-6xl font-serif text-secondary uppercase tracking-tighter">Aydınlatma Metni (KVKK)</h1>
          <p className="text-secondary/60 italic">{siteName} için hazırlanan yasal bildirimler.</p>
        </div>

        <div className="space-y-16">
          {kvkkContent ? (
            <div className="prose prose-secondary max-w-none text-secondary/80 leading-relaxed whitespace-pre-wrap font-light text-lg">
              {kvkkContent}
            </div>
          ) : (
            <div className="p-10 bg-neutral/10 border-2 border-dashed border-secondary/20 space-y-10">
              <div className="space-y-4">
                <h3 className="text-2xl font-serif text-secondary">Aydınlatma Metni Hazırlanıyor</h3>
                <p className="text-sm text-secondary/70 leading-relaxed">
                  {siteName} henüz bu bölümü güncellememiştir. Lütfen daha sonra tekrar kontrol ediniz veya mağaza sahibiyle iletişime geçiniz.
                </p>
              </div>
            </div>
          )}

          <div className="p-8 bg-secondary text-primary text-center">
             <p className="text-[10px] tracking-widest uppercase font-bold">BU METİN {siteName.toUpperCase()} TARAFINDAN SAĞLANMAKTADIR</p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
