"use client";
 
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/navbar";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductCard } from "@/components/ui/product-card";
import { useStoreData } from "@/store/useStoreData";
import { Play, Pause, Volume2, VolumeX, Star, X, Check, Heart, ThumbsUp, ThumbsDown, ShieldCheck } from "lucide-react";
import { ScrollingText } from "@/components/home/scrolling-text";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 1, ease: "easeOut" as const },
};

const reviewsData = [
  {
    id: 1,
    name: "Tom s.",
    initials: "TS",
    flag: "🇬🇧",
    avatarColor: "bg-amber-500",
    rating: 5,
    title: "Satın aldığımdan gerçekten çok memnunum!",
    text: "Genellikle tembel olduğum için yorum yazmam ama bu kapüşonlu sweatshirt gerçekten harika, yumuşak ve malzemesi çok kaliteli, dürüst olmak gerekirse çok etkilendim, bayıldım resmen!",
    image: "/1.png?v=3",
    likes: 48,
    dislikes: 4
  },
  {
    id: 2,
    name: "Emre K.",
    initials: "EK",
    flag: "🇹🇷",
    avatarColor: "bg-blue-600",
    rating: 5,
    title: "Kalıbı ve dikiş kalitesi efsane!",
    text: "Oversize kesimi o kadar iyi ayarlanmış ki üzerimde tam hayal ettiğim gibi durdu. Kumaş dokusu kalın ve içi yumuşacık. Kesinlikle başka modellerini de sipariş vereceğim.",
    image: "/2.png?v=3",
    likes: 34,
    dislikes: 1
  },
  {
    id: 3,
    name: "Can S.",
    initials: "CS",
    flag: "🇹🇷",
    avatarColor: "bg-emerald-600",
    rating: 5,
    title: "Beklentimin çok üzerinde!",
    text: "Sessiz lüks tasarım çizgisini çok iyi yansıtmış. Dolabımdaki en kaliteli ve şık sweatshirt diyebilirim. Hızlı teslimat ve özenli paketleme için de ayrıca teşekkürler.",
    image: "/3.png?v=3",
    likes: 22,
    dislikes: 0
  }
];

export default function Home() {
  const { products, settings, isLoading } = useStoreData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"satis" | "cok-satanlar" | "aktif">("satis");
  const [displayProducts, setDisplayProducts] = useState<any[]>([]);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

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

    setDisplayProducts(shuffled.slice(0, 4));
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

          {/* TÜMÜNÜ GÖRÜNTÜLE Button */}
          <div className="flex justify-center mt-12 md:mt-16">
            <Link 
              href="/shop" 
              className="bg-[#e31c25] hover:bg-[#b0141b] text-white text-xs md:text-sm font-bold tracking-[0.2em] px-8 py-3.5 uppercase transition-all duration-300 rounded-xs shadow-md"
            >
              TÜMÜNÜ GÖRÜNTÜLE
            </Link>
          </div>
        </div>
      </section>

      {/* ————— CUSTOMER REVIEWS (SANTO STYLE & LIGHTBOX MODAL) ————— */}
      <section className="py-24 md:py-32 px-4 md:px-12 bg-white border-t border-secondary/5 overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          {/* Centered Heading */}
          <div className="text-center space-y-4 mb-16">
            <h3 className="text-xl md:text-3xl font-sans font-black uppercase tracking-wider text-secondary leading-tight">
              Müşterilerimiz bizim hakkımızda neler söylüyor...
            </h3>
            <div className="flex flex-col items-center gap-1.5 justify-center">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-5 h-5 md:w-6 md:h-6 bg-[#00b67a] flex items-center justify-center rounded-[3px] text-white">
                    <Star size={12} fill="currentColor" stroke="none" />
                  </div>
                ))}
              </div>
              <span className="text-[11px] md:text-xs font-semibold text-secondary/60 uppercase tracking-widest font-sans">
                Güven Puanı: 4.9 / 5.0
              </span>
            </div>
          </div>

          {/* Trustpilot-style Rating Overview Grid */}
          <div className="bg-[#fcfbf9] border border-secondary/5 p-6 md:p-8 rounded-xs mb-16 shadow-xs max-w-[1000px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
              {/* Score summary column */}
              <div className="text-center space-y-2 md:border-r border-secondary/10 pr-0 md:pr-8">
                <span className="text-5xl md:text-6xl font-black font-sans text-secondary leading-none">4.9</span>
                <div className="flex justify-center items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className="fill-[#00b67a] text-[#00b67a]" />
                  ))}
                </div>
                <p className="text-xs font-bold text-[#00b67a] uppercase tracking-wider font-sans">531 YORUM</p>
              </div>

              {/* Progress bars columns */}
              <div className="col-span-1 md:col-span-2 space-y-3 font-sans">
                {/* 5 Stars */}
                <div className="flex items-center gap-3 text-xs text-secondary/70">
                  <div className="flex items-center gap-0.5 w-14">
                    <span className="font-bold">5</span>
                    <Star size={10} className="fill-secondary/50 text-secondary/50" />
                  </div>
                  <div className="flex-1 h-2 bg-secondary/5 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[85%] rounded-full" />
                  </div>
                  <span className="font-semibold w-8 text-right">%85</span>
                </div>

                {/* 4 Stars */}
                <div className="flex items-center gap-3 text-xs text-secondary/70">
                  <div className="flex items-center gap-0.5 w-14">
                    <span className="font-bold">4</span>
                    <Star size={10} className="fill-secondary/50 text-secondary/50" />
                  </div>
                  <div className="flex-1 h-2 bg-secondary/5 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[14%] rounded-full" />
                  </div>
                  <span className="font-semibold w-8 text-right">%14</span>
                </div>

                {/* 3 Stars */}
                <div className="flex items-center gap-3 text-xs text-secondary/70">
                  <div className="flex items-center gap-0.5 w-14">
                    <span className="font-bold">3</span>
                    <Star size={10} className="fill-secondary/50 text-secondary/50" />
                  </div>
                  <div className="flex-1 h-2 bg-secondary/5 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[0%] rounded-full" />
                  </div>
                  <span className="font-semibold w-8 text-right">%0</span>
                </div>

                {/* 2 Stars */}
                <div className="flex items-center gap-3 text-xs text-secondary/70">
                  <div className="flex items-center gap-0.5 w-14">
                    <span className="font-bold">2</span>
                    <Star size={10} className="fill-secondary/50 text-secondary/50" />
                  </div>
                  <div className="flex-1 h-2 bg-secondary/5 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[0%] rounded-full" />
                  </div>
                  <span className="font-semibold w-8 text-right">%0</span>
                </div>

                {/* 1 Star */}
                <div className="flex items-center gap-3 text-xs text-secondary/70">
                  <div className="flex items-center gap-0.5 w-14">
                    <span className="font-bold">1</span>
                    <Star size={10} className="fill-secondary/50 text-secondary/50" />
                  </div>
                  <div className="flex-1 h-2 bg-secondary/5 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[0%] rounded-full" />
                  </div>
                  <span className="font-semibold w-8 text-right">%0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviewsData.map((review) => (
              <div 
                key={review.id}
                onClick={() => setSelectedReview(review)}
                className="bg-white border border-secondary/10 p-6 rounded-xs shadow-xs hover:border-secondary/30 hover:shadow-md transition-all duration-300 flex flex-col h-full justify-between cursor-pointer group"
              >
                <div className="space-y-4">
                  {/* Avatar and name header */}
                  <div className="flex items-center gap-3 font-sans">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold", review.avatarColor)}>
                      {review.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-secondary">{review.name}</span>
                        <span className="text-sm">{review.flag}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <div key={i} className="w-3.5 h-3.5 bg-[#00b67a] flex items-center justify-center rounded-[2px] text-white">
                            <Star size={8} fill="currentColor" stroke="none" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Verified Buyer Badge */}
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#00b67a] font-sans uppercase tracking-wider">
                    <ShieldCheck size={12} className="stroke-[2.5px]" />
                    <span>Doğrulanmış Alıcı</span>
                  </div>

                  {/* Review Text */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs md:text-sm text-secondary uppercase font-sans tracking-wide">
                      {review.title}
                    </h4>
                    <p className="text-[11px] md:text-xs text-secondary leading-relaxed font-sans">
                      {review.text}
                    </p>
                  </div>
                </div>

                {/* Review image and helpful row */}
                <div className="mt-6 space-y-4 pt-4 border-t border-secondary/10">
                  {review.image && (
                    <div className="relative w-20 h-28 overflow-hidden bg-secondary/10 rounded-xs border border-secondary/20 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                      <img 
                        src={review.image} 
                        alt="Customer Photo"
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.src = review.id === 2 ? "/2.png?v=3" : (review.id === 3 ? "/3.png?v=3" : "/1.png?v=3");
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-secondary font-semibold font-sans uppercase tracking-wider">
                    <span>Bu yardımcı oldu mu?</span>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 text-secondary/80 hover:text-[#00b67a] transition-all">
                        <ThumbsUp size={10} />
                        <span>{review.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-secondary/80 hover:text-red-500 transition-all">
                        <ThumbsDown size={10} />
                        <span>{review.dislikes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ————— REVIEWS LIGHTBOX POPUP MODAL ————— */}
      <AnimatePresence>
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark blur backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReview(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-[550px] bg-white rounded-xs border border-secondary/10 p-6 md:p-8 shadow-2xl z-10 flex flex-col gap-6 max-h-[90vh] overflow-y-auto scrollbar-none"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedReview(null)}
                className="absolute top-4 right-4 text-secondary hover:text-secondary/80 p-1.5 rounded-full hover:bg-secondary/10 transition-all z-20"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 border-b border-secondary/10 pb-4 font-sans">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg", selectedReview.avatarColor)}>
                  {selectedReview.initials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base text-secondary">{selectedReview.name}</span>
                    <span className="text-base">{selectedReview.flag}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: selectedReview.rating }).map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-[#00b67a] flex items-center justify-center rounded-[2px] text-white">
                        <Star size={9} fill="currentColor" stroke="none" />
                      </div>
                    ))}
                    <span className="text-xs font-semibold text-secondary ml-1.5 uppercase tracking-wide">5 YILDIZ</span>
                  </div>
                </div>
              </div>

              {/* Modal Body Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#00b67a] font-sans uppercase tracking-wider">
                  <ShieldCheck size={14} className="stroke-[2.5px]" />
                  <span>Doğrulanmış Alıcı</span>
                </div>

                <h4 className="font-black text-sm md:text-base text-secondary uppercase font-sans tracking-wide leading-tight">
                  {selectedReview.title}
                </h4>
                
                <p className="text-xs md:text-sm text-secondary leading-relaxed font-sans">
                  {selectedReview.text}
                </p>
              </div>

              {/* Modal Customer image display */}
              {selectedReview.image && (
                <div className="relative w-full aspect-[2/3] max-h-[50vh] bg-secondary/10 rounded-xs overflow-hidden border border-secondary/20 shadow-inner">
                  <img 
                    src={selectedReview.image} 
                    alt="Customer mirror selfie"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.src = selectedReview.id === 2 ? "/2.png?v=3" : (selectedReview.id === 3 ? "/3.png?v=3" : "/1.png?v=3");
                    }}
                  />
                </div>
              )}

              {/* Modal Footer helpful row */}
              <div className="flex items-center justify-between text-xs text-secondary font-semibold font-sans uppercase tracking-wider border-t border-secondary/10 pt-4">
                <span>Bu yardımcı oldu mu?</span>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-secondary/80 hover:text-[#00b67a] transition-all">
                    <ThumbsUp size={12} />
                    <span>{selectedReview.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-secondary/80 hover:text-red-500 transition-all">
                    <ThumbsDown size={12} />
                    <span>{selectedReview.dislikes}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
