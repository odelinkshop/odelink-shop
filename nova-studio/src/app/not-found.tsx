"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-[12rem] font-serif text-secondary/5 leading-none absolute select-none">404</h1>
        <div className="relative z-10 space-y-8">
          <span className="text-xs tracking-[0.6em] uppercase text-accent font-bold">Aradığınız Sayfa Bulunamadı</span>
          <h2 className="text-4xl md:text-6xl font-serif text-secondary uppercase tracking-tight">Kayıp Bir Rota</h2>
          <p className="text-sm text-secondary/60 max-w-md mx-auto leading-relaxed">
            Görünüşe göre rotanızdan saptınız. Ancak zarafet yolunda her zaman geri dönmek mümkündür.
          </p>
          <div className="pt-8">
            <Link href="/">
              <Button size="lg" className="bg-secondary text-primary px-12">Ana Sayfaya Dön</Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
