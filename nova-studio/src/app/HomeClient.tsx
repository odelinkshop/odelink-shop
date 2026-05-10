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

      {/* ————— PHYLOSOPHY ————— */}
      <section className="py-24 md:py-40 px-6 lg:px-24">
        <div className="max-w-[1400px] mx-auto text-center space-y-10 md:space-y-16">
          <motion.h3 {...fadeInUp} className="text-3xl md:text-8xl font-serif text-secondary tracking-tighter uppercase font-light">
            {aboutTitle}
          </motion.h3>
          <motion.p {...fadeInUp} transition={{delay: 0.3}} className="text-lg md:text-2xl text-secondary/60 max-w-3xl mx-auto font-light leading-relaxed">
            {aboutText}
          </motion.p>
        </div>
      </section>

      {/* ————— CATEGORY GRID ————— */}
      <section className="px-6 lg:px-12 pb-24 md:pb-32">
         <CategoryGrid />
      </section>

      {/* ————— DYNAMIC BAR 2 ————— */}
      <ScrollingText text="NEW ARRIVALS — ESTATE ITALIANA 26" speed={60} reverse className="bg-primary text-secondary" />

      {/* ————— PRODUCTS ————— */}
      <section className="py-24 md:py-40 px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-20 md:mb-32">
            <div className="space-y-2">
               <span className="text-[9px] tracking-[0.8em] text-accent uppercase font-light">The Selection</span>
               <h3 className="text-4xl md:text-6xl font-serif font-light uppercase">Koleksiyon</h3>
            </div>
            <Link href="/shop" className="text-[10px] tracking-[0.4em] uppercase border-b border-secondary/20 pb-2 hover:border-accent transition-all">
              TÜMÜNÜ KEŞFET
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20 md:gap-y-32">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-[3/4] bg-secondary/5" />
                    <div className="h-4 bg-secondary/5 w-3/4" />
                  </div>
                ))
              : products.slice(0, 8).map((product, i) => (
                  <motion.div key={product.id} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </div>
        </div>
      </section>
    </main>
  );
}
