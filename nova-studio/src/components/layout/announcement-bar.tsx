"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStoreData } from "@/store/useStoreData";

const AnnouncementBar = () => {
  const { settings } = useStoreData();
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  useEffect(() => {
    setMounted(true);
  }, []);

  const rawText = mounted 
    ? (settings?.content?.announcementBar || "TÜM SİPARİŞLERDE ÜCRETSİZ HEDİYE • 5.000 TL ÜZERİ SİPARİŞLERDE ÜCRETSİZ KARGO") 
    : "TÜM SİPARİŞLERDE ÜCRETSİZ HEDİYE • 5.000 TL ÜZERİ SİPARİŞLERDE ÜCRETSİZ KARGO";

  // Split the dynamically saved text by bullet points or pipes
  const announcements = rawText
    .split(/[•|]/)
    .map((s) => s.trim())
    .filter(Boolean);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 3500);
    return () => clearInterval(timer);
  }, [index, announcements.length]);

  const handlePrev = () => {
    if (announcements.length <= 1) return;
    setDirection(-1);
    setIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (announcements.length <= 1) return;
    setDirection(1);
    setIndex((prev) => (prev === announcements.length - 1 ? 0 : prev + 1));
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const hasMultiple = announcements.length > 1;

  // Safe fallback index check
  const activeIndex = index >= announcements.length ? 0 : index;

  return (
    <div className="w-full bg-[#000000] text-white py-3 border-b border-white/5 relative z-50 overflow-hidden font-sans">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 md:px-8 h-5">
        {/* Left Arrow — always visible */}
        <button 
          onClick={handlePrev}
          disabled={!hasMultiple}
          className={`p-1 focus:outline-none transition-colors duration-200 ${
            hasMultiple
              ? "text-white/70 hover:text-white cursor-pointer"
              : "text-white/20 cursor-default"
          }`}
          aria-label="Önceki Duyuru"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>

        {/* Sliding Text Wrapper */}
        <div className="flex-1 relative h-5 flex items-center justify-center overflow-hidden mx-4">
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

        {/* Right Arrow — always visible */}
        <button 
          onClick={handleNext}
          disabled={!hasMultiple}
          className={`p-1 focus:outline-none transition-colors duration-200 ${
            hasMultiple
              ? "text-white/70 hover:text-white cursor-pointer"
              : "text-white/20 cursor-default"
          }`}
          aria-label="Sonraki Duyuru"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
