"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductCard } from "@/components/ui/product-card";
import { useStoreData } from "@/store/useStoreData";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 1.2, ease: "easeOut" as const },
};

export default function Home() {
  const { products, settings, isLoading, siteName } = useStoreData();

  const heroTitle   = settings.content?.heroTitle   || siteName  || "NOVA";
  const heroBadge   = settings.content?.heroBadge   || settings.content?.heroSubtitle || "ESTATE ITALIANA '26";
  const heroDesc    = settings.content?.heroDescription || settings.description || "";
  const heroImage   = settings.content?.heroImageUrl || "/hero_italian.png";
  const aboutTitle  = settings.content?.aboutTitle  || "Zamansız Zarafet,";
  const aboutText   = settings.content?.aboutText   || "NOVA bir markadan daha fazlasıdır; İtalyan Riviera'sının sessiz lüksüne duyulan bir bağlılıktır.";
  const ctaText     = settings.content?.heroButtonText || "KOLEKSİYONU KEŞFET";

  return (
    <main className="flex-1 bg-background text-secondary">
      <Navbar />

      {/* ————— HERO ————— */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={heroImage}
            alt={heroTitle}
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/hero_italian.png";
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        <div className="relative z-10 text-center w-full px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          >
            <span className="text-accent text-xs tracking-[0.8em] uppercase mb-8 block font-bold">
              {heroBadge}
            </span>
            <h2 className="text-6xl md:text-[9rem] font-serif text-primary leading-none tracking-tighter uppercase mb-12">
              {heroTitle}
            </h2>
            {heroDesc && (
              <p className="text-primary/80 text-sm md:text-base max-w-lg mx-auto mb-10 font-light leading-relaxed">
                {heroDesc}
              </p>
            )}
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-accent text-secondary hover:bg-primary hover:text-secondary transition-all min-w-[240px] h-16 text-[10px] tracking-widest uppercase font-bold"
              >
                {ctaText}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ————— FİLOZOFİ ————— */}
      <section className="py-32 px-6 lg:px-24 bg-neutral/30 border-y border-secondary/5">
        <div className="max-w-[1200px] mx-auto text-center space-y-12">
          <motion.span {...fadeInUp} className="text-[10px] tracking-[0.5em] uppercase text-accent font-bold">
            THE PHILOSOPHY
          </motion.span>
          <motion.h3
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
            className="text-4xl md:text-6xl font-serif text-secondary leading-tight"
          >
            {aboutTitle}
          </motion.h3>
          <motion.p
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.4 }}
            className="text-lg text-secondary/60 max-w-2xl mx-auto leading-relaxed font-light"
          >
            {aboutText}
          </motion.p>
        </div>
      </section>

      {/* ————— KATEGORİ GRİD ————— */}
      <motion.div {...fadeInUp}>
        <CategoryGrid />
      </motion.div>

      {/* ————— ÜRÜNLER ————— */}
      <section className="py-32 px-6 lg:px-24 bg-neutral/20">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            {...fadeInUp}
            className="flex flex-col md:flex-row justify-between items-center md:items-end mb-24 gap-8"
          >
            <div className="text-center md:text-left">
              <span className="text-[10px] tracking-[0.5em] uppercase text-accent font-bold mb-3 block">
                SELECTED PIECES
              </span>
              <h3 className="text-5xl font-serif text-secondary tracking-tight">Öne Çıkanlar</h3>
            </div>
            <Link
              href="/shop"
              className="group flex items-center space-x-4 text-[10px] tracking-widest uppercase font-bold text-secondary"
            >
              <span>TÜM KOLEKSİYONU GÖR ({products.length})</span>
              <div className="w-8 h-[1px] bg-secondary group-hover:w-16 transition-all" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-[3/4] bg-neutral/40" />
                    <div className="h-4 bg-neutral/40 w-3/4 mx-auto" />
                    <div className="h-6 bg-neutral/40 w-1/4 mx-auto" />
                  </div>
                ))
              : products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    {...fadeInUp}
                    transition={{ ...fadeInUp.transition, delay: i * 0.08 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </div>
        </div>
      </section>
    </main>
  );
}
