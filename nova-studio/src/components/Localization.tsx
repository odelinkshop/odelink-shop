"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const languages = [
  { code: "tr", name: "Türkçe" },
  { code: "en", name: "İngilizce" },
  { code: "fr", name: "Fransızca" },
  { code: "it", name: "İtalyanca" },
  { code: "es", name: "İspanyolca" },
  { code: "de", name: "Almanca" },
  { code: "ar", name: "Arapça" },
  { code: "ru", name: "Rusça" },
];

const countries = [
  { code: "TR", name: "Türkiye", currency: "TRY", symbol: "₺" },
  { code: "US", name: "Amerika Birleşik Devletleri", currency: "USD", symbol: "$" },
  { code: "GB", name: "Birleşik Krallık", currency: "GBP", symbol: "£" },
  { code: "FR", name: "Fransa", currency: "EUR", symbol: "€" },
  { code: "DE", name: "Almanya", currency: "EUR", symbol: "€" },
  { code: "IT", name: "İtalya", currency: "EUR", symbol: "€" },
  { code: "ES", name: "İspanya", currency: "EUR", symbol: "€" },
  { code: "MX", name: "Meksika", currency: "MXN", symbol: "$" },
  { code: "AE", name: "Birleşik Arap Emirlikleri", currency: "AED", symbol: "د.إ" },
  { code: "SA", name: "Suudi Arabistan", currency: "SAR", symbol: "ر.س" },
  { code: "RU", name: "Rusya", currency: "RUB", symbol: "₽" },
];

export const Localization = () => {
  const [langOpen, setLangOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  
  const [searchQuery, setSearchQuery] = useState("");

  const langRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  // Initialize from localStorage if available
  useEffect(() => {
    const savedLang = localStorage.getItem("nova_lang");
    const savedCountry = localStorage.getItem("nova_country");
    if (savedLang) {
      const found = languages.find(l => l.code === savedLang);
      if (found) setSelectedLang(found);
    }
    if (savedCountry) {
      const found = countries.find(c => c.code === savedCountry);
      if (found) setSelectedCountry(found);
    }
  }, []);

  const handleLangSelect = (lang: typeof languages[0]) => {
    setSelectedLang(lang);
    localStorage.setItem("nova_lang", lang.code);
    setLangOpen(false);
    // In a real app, this would trigger a page reload or translation context update
    // window.location.reload();
  };

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    localStorage.setItem("nova_country", country.code);
    setCountryOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.currency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      {/* Country/Region Dropdown */}
      <div className="relative" ref={countryRef}>
        <div className="text-[11px] text-white/80 mb-2 font-medium tracking-wide">Ülke/bölge</div>
        <button 
          onClick={() => { setCountryOpen(!countryOpen); setLangOpen(false); }}
          className="flex items-center justify-between w-full sm:w-[220px] bg-black border border-white/20 rounded-[4px] px-4 py-3 hover:border-white/40 transition-colors text-white"
        >
          <span className="text-[13px] tracking-wide truncate">
            {selectedCountry.name} | {selectedCountry.currency} {selectedCountry.symbol}
          </span>
          <ChevronDown className="w-4 h-4 text-white/60 ml-2 flex-shrink-0" />
        </button>

        <AnimatePresence>
          {countryOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full mb-2 left-0 w-[300px] sm:w-[320px] bg-[#111] border border-white/10 rounded-[6px] shadow-2xl overflow-hidden z-50"
            >
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Aramak" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black border border-white/20 rounded-[4px] py-2 px-3 pl-8 text-[12px] text-white placeholder:text-white/40 outline-none focus:border-white/50 transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-2">
                {filteredCountries.map(country => (
                  <button
                    key={country.code}
                    onClick={() => handleCountrySelect(country)}
                    className="w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-white/5 rounded-[4px] transition-colors group"
                  >
                    <span className="text-[13px] text-white/90 group-hover:text-white">{country.name}</span>
                    <span className="text-[11px] text-white/40 group-hover:text-white/60">{country.currency} {country.symbol}</span>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="text-center py-4 text-[12px] text-white/40">Sonuç bulunamadı</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Language Dropdown */}
      <div className="relative" ref={langRef}>
        <div className="text-[11px] text-white/80 mb-2 font-medium tracking-wide">Dil</div>
        <button 
          onClick={() => { setLangOpen(!langOpen); setCountryOpen(false); }}
          className="flex items-center justify-between w-full sm:w-[160px] bg-black border border-white/20 rounded-[4px] px-4 py-3 hover:border-white/40 transition-colors text-white"
        >
          <span className="text-[13px] tracking-wide">{selectedLang.name}</span>
          <ChevronDown className="w-4 h-4 text-white/60 ml-2" />
        </button>

        <AnimatePresence>
          {langOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full mb-2 left-0 sm:right-0 sm:left-auto w-[200px] bg-[#111] border border-white/10 rounded-[6px] shadow-2xl py-2 z-50 max-h-[250px] overflow-y-auto custom-scrollbar"
            >
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLangSelect(lang)}
                  className="w-full text-left px-4 py-2.5 flex items-center hover:bg-white/5 transition-colors"
                >
                  <span className="w-6 flex justify-center">
                    {selectedLang.code === lang.code && <Check className="w-3.5 h-3.5 text-white" />}
                  </span>
                  <span className={`text-[13px] ${selectedLang.code === lang.code ? 'text-white' : 'text-white/70 hover:text-white'}`}>
                    {lang.name}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}} />
    </div>
  );
};
