"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ANNOUNCEMENTS = [
  "ÜCRETSİZ KARGO VE ÖZEL İNDİRİMLER!",
  "TÜM SİPARİŞLERDE HIZLI TESLİMAT GARANTİSİ",
];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir < 0 ? 60 : -60,
    opacity: 0,
  }),
};

const AnnouncementBar = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setIndex((prev) => (prev === 0 ? ANNOUNCEMENTS.length - 1 : prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setDirection(1);
    setIndex((prev) => (prev === ANNOUNCEMENTS.length - 1 ? 0 : prev + 1));
  }, []);

  // Auto-slide every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev === ANNOUNCEMENTS.length - 1 ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#000000] text-white py-2.5 border-b border-white/5 relative z-50 font-sans px-4">
      <div className="flex items-center justify-between max-w-[1800px] mx-auto h-5">
        {/* Left Placeholder for centering */}
        <div className="hidden lg:flex flex-1" />

        {/* Center: Carousel */}
        <div className="flex items-center justify-center gap-4 flex-1">
          {/* Left Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            className="flex-shrink-0 text-white/70 hover:text-white cursor-pointer transition-colors duration-200 focus:outline-none"
            aria-label="Önceki Duyuru"
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
          </button>

          {/* Sliding Text */}
          <div className="relative h-5 flex items-center justify-center overflow-hidden w-[280px] md:w-[420px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.span
                key={index}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center text-[9px] md:text-xs font-black tracking-[0.15em] md:tracking-[0.2em] text-center uppercase whitespace-nowrap text-white font-sans"
                style={{ fontWeight: 900 }}
              >
                {ANNOUNCEMENTS[index]}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={handleNext}
            className="flex-shrink-0 text-white/70 hover:text-white cursor-pointer transition-colors duration-200 focus:outline-none"
            aria-label="Sonraki Duyuru"
          >
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Right: Selectors */}
        <div className="hidden lg:flex items-center justify-end flex-1 gap-6 text-[11px] md:text-xs font-semibold text-white/90">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <span>Türkiye | GBP £</span>
            <ChevronDown size={12} strokeWidth={2.5} className="text-white/70" />
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <span>İngilizce</span>
            <ChevronDown size={12} strokeWidth={2.5} className="text-white/70" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
