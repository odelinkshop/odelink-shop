"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const ANNOUNCEMENTS = [
  "ÜCRETSİZ KARGO VE ÖZEL İNDİRİMLER!",
  "TÜM SİPARİŞLERDE HIZLI TESLİMAT GARANTİSİ",
];

const REGIONS = [
  "Türkiye | TRY ₺",
];

const LANGUAGES = [
  "Türkçe",
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
  const [activeDropdown, setActiveDropdown] = useState<"region" | "language" | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("Türkiye | TRY ₺");
  const [selectedLanguage, setSelectedLanguage] = useState("Türkçe");

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
    <div className="w-full bg-[#000000] text-white py-2.5 border-b border-white/5 relative z-[9999] font-sans px-4">
      <div className="flex items-center justify-between max-w-[1800px] mx-auto h-5">
        {/* Left: Social Icons */}
        <div className="hidden lg:flex flex-1 items-center gap-5 pl-1">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Instagram"
          >
            <InstagramIcon size={14} />
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            aria-label="TikTok"
          >
            <TikTokIcon size={14} />
          </a>
        </div>

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
        <div className="hidden lg:flex items-center justify-end flex-1 gap-6 text-[11px] md:text-xs font-semibold text-white/90 relative">
          
          {/* Region Dropdown */}
          <div className="relative">
            <div 
              className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors"
              onClick={() => setActiveDropdown(activeDropdown === "region" ? null : "region")}
            >
              <span>{selectedRegion}</span>
              <ChevronDown size={12} strokeWidth={2.5} className="text-white/70" />
            </div>

            <AnimatePresence>
              {activeDropdown === "region" && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full mt-3 right-0 w-48 bg-white text-black py-2 rounded-xs shadow-xl z-50 border border-secondary/10"
                  >
                    {REGIONS.map((region) => (
                      <button
                        key={region}
                        className={`w-full text-left px-4 py-2.5 transition-colors text-[11px] font-bold uppercase tracking-wider ${
                          selectedRegion === region ? "bg-black/5 text-[#e31c25]" : "hover:bg-black/5 text-secondary"
                        }`}
                        onClick={() => {
                          setSelectedRegion(region);
                          setActiveDropdown(null);
                        }}
                      >
                        {region}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Language Dropdown */}
          <div className="relative">
            <div 
              className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors"
              onClick={() => setActiveDropdown(activeDropdown === "language" ? null : "language")}
            >
              <span>{selectedLanguage}</span>
              <ChevronDown size={12} strokeWidth={2.5} className="text-white/70" />
            </div>

            <AnimatePresence>
              {activeDropdown === "language" && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full mt-3 right-0 w-32 bg-white text-black py-2 rounded-xs shadow-xl z-50 border border-secondary/10"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        className={`w-full text-left px-4 py-2.5 transition-colors text-[11px] font-bold uppercase tracking-wider ${
                          selectedLanguage === lang ? "bg-black/5 text-[#e31c25]" : "hover:bg-black/5 text-secondary"
                        }`}
                        onClick={() => {
                          setSelectedLanguage(lang);
                          setActiveDropdown(null);
                        }}
                      >
                        {lang}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
