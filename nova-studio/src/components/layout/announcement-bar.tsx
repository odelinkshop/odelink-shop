"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStoreData } from "@/store/useStoreData";

const AnnouncementBar = () => {
  const { settings } = useStoreData();
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rawText = mounted
    ? (settings?.content?.announcementBar || "ÜCRETSİZ KARGO VE ÖZEL İNDİRİMLER! • TÜM SİPARİŞLERDE HIZLI TESLİMAT GARANTİSİ")
    : "ÜCRETSİZ KARGO VE ÖZEL İNDİRİMLER! • TÜM SİPARİŞLERDE HIZLI TESLİMAT GARANTİSİ";

  const announcements = rawText
    .split(/[•|]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const handlePrev = useCallback(() => {
    if (announcements.length <= 1) return;
    setDirection(-1);
    setIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));
  }, [announcements.length]);

  const handleNext = useCallback(() => {
    if (announcements.length <= 1) return;
    setDirection(1);
    setIndex((prev) => (prev === announcements.length - 1 ? 0 : prev + 1));
  }, [announcements.length]);

  // Auto-slide every 3.5 seconds
  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev === announcements.length - 1 ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 40 : -40,
      opacity: 0,
    }),
  };

  const activeIndex = index >= announcements.length ? 0 : index;

  return (
    <div className="w-full bg-[#000000] text-white py-3 border-b border-white/5 relative z-50 font-sans">
      <div className="flex items-center justify-center gap-3 h-5">
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="flex-shrink-0 p-0.5 focus:outline-none transition-colors duration-200 text-white/70 hover:text-white cursor-pointer"
          aria-label="Önceki Duyuru"
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
        </button>

        {/* Sliding Text */}
        <div className="relative h-5 flex items-center justify-center overflow-hidden" style={{ minWidth: '280px' }}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.span
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute text-[10px] md:text-xs font-black tracking-[0.2em] text-center uppercase whitespace-nowrap text-white font-sans"
              style={{ fontWeight: 900 }}
            >
              {announcements[activeIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="flex-shrink-0 p-0.5 focus:outline-none transition-colors duration-200 text-white/70 hover:text-white cursor-pointer"
          aria-label="Sonraki Duyuru"
        >
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
