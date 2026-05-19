"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/navbar";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductCard } from "@/components/ui/product-card";
import { useStoreData } from "@/store/useStoreData";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { ScrollingText } from "@/components/home/scrolling-text";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 1, ease: "easeOut" as const },
};

export default function Home() {
  const { products, settings, isLoading } = useStoreData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"satis" | "cok-satanlar" | "aktif">("satis");
  const [displayProducts, setDisplayProducts] = useState<any[]>([]);

  useEffect(() => {
    if (isLoading || products.length === 0) return;

    let filtered = products;
    if (activeTab === "satis") {
      filtered = products.filter(p => p.originalPrice && Number(p.originalPrice) > Number(p.price));
    } else if (activeTab === "aktif") {
      filtered = products.filter(p => p.isNew);
    }

    if (filtered.length === 0) {
      filtered = products;
    }

    // Fisher-Yates Shuffle for random selection
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setDisplayProducts(shuffled.slice(0, 8));
  }, [activeTab, products, isLoading]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const videos = ["/hero_video_1.mp4", "/hero_video_2.mp4"];
  const handleVideoEnd = () => {
    setCurrentVideo((prev) => (prev + 1) % videos.length);
  };

  useEffect(() => {
    if (mounted && videoRef.current) {
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentVideo, isPlaying, isMuted, mounted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  const aboutTitle = settings.content?.aboutTitle || "THE PHILOSOPHY OF SILENCE";
  const aboutText = settings.content?.aboutText || "Modern aristokrasinin sessiz lüksü ile tanışın. Sadelik en üstün sofistikasyondur.";

  return (
    <main className="flex-1 bg-background text-secondary overflow-x-hidden">

      {/* ————— HERO ————— */}
      <section className="relative h-[80vh] md:h-screen w-full overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVideo}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            <video
              ref={videoRef} src={videos[currentVideo]} onEnded={handleVideoEnd}
              autoPlay playsInline muted={isMuted}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/10 z-10" />
        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-30 flex items-center space-x-3">
          <button onClick={togglePlay} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-white/20 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all">
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={toggleMute} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-white/20 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all">
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </section>

      {/* ————— DYNAMIC BAR 1 ————— */}
      <ScrollingText text="LIMITED EDITORIAL — CURATED LUXURY" speed={50} />

      {/* ————— CATEGORY GRID ————— */}
      <section className="px-6 lg:px-12 py-24 md:py-32">
         <CategoryGrid />
      </section>

      {/* ————— DYNAMIC BAR 2 ————— */}
      <ScrollingText text="NEW ARRIVALS — ESTATE ITALIANA 26" speed={60} reverse className="bg-primary text-secondary" />

      {/* ————— PRODUCTS (SANTO TABBED STYLE) ————— */}
      <section className="py-24 md:py-36 px-4 md:px-12 overflow-hidden">
        <div className="max-w-[1800px] mx-auto">
          {/* Centered Title and Tabs Header */}
          <div className="text-center space-y-6 mb-16 md:mb-24">
            <h3 className="text-2xl md:text-5xl font-sans font-black uppercase tracking-wider text-secondary leading-tight">
              ALIŞVERİŞ İÇİN TIKLAYIN
            </h3>
            
            <div className="flex flex-row justify-center items-center gap-1.5 md:gap-3 flex-nowrap overflow-x-auto scrollbar-none py-1">
              <button 
                onClick={() => setActiveTab("satis")}
                className={cn(
                  "px-4 py-2.5 md:px-8 md:py-3.5 text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all duration-300 rounded-xs flex-shrink-0",
                  activeTab === "satis" 
                    ? "bg-[#e31c25] text-white shadow-md" 
                    : "bg-[#f2f2f2] text-secondary hover:bg-secondary/10"
                )}
              >
                SATIŞ
              </button>
              <button 
                onClick={() => setActiveTab("cok-satanlar")}
                className={cn(
                  "px-4 py-2.5 md:px-8 md:py-3.5 text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all duration-300 rounded-xs flex-shrink-0",
                  activeTab === "cok-satanlar" 
                    ? "bg-[#e31c25] text-white shadow-md" 
                    : "bg-[#f2f2f2] text-secondary hover:bg-secondary/10"
                )}
              >
                ÇOK SATANLAR
              </button>
              <button 
                onClick={() => setActiveTab("aktif")}
                className={cn(
                  "px-4 py-2.5 md:px-8 md:py-3.5 text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all duration-300 rounded-xs flex-shrink-0",
                  activeTab === "aktif" 
                    ? "bg-[#e31c25] text-white shadow-md" 
                    : "bg-[#f2f2f2] text-secondary hover:bg-secondary/10"
                )}
              >
                AKTİF
              </button>
            </div>
          </div>

          {/* Swipeable on Mobile, Grid on Desktop */}
          <div className="flex lg:grid lg:grid-cols-4 gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory pb-6 lg:pb-0 scrollbar-none w-full">
            {isLoading || displayProducts.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-[48vw] sm:w-[45vw] lg:w-auto flex-shrink-0 animate-pulse space-y-4">
                    <div className="aspect-[3/4] bg-secondary/5" />
                    <div className="h-4 bg-secondary/5 w-3/4" />
                  </div>
                ))
              : displayProducts.map((product, i) => (
                  <motion.div 
                    key={product.id} 
                    {...fadeInUp} 
                    transition={{ delay: i * 0.05 }} 
                    className="w-[48vw] sm:w-[45vw] lg:w-auto snap-start flex-shrink-0 h-full"
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
