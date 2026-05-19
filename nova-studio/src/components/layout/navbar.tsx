"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/store/useCart";
import { useStoreData } from "@/store/useStoreData";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { siteName } = useStoreData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: "HAKKIMIZDA", href: "/about" },
    { name: "İLETİŞİM", href: "/contact" },
    { name: "SIKÇA SORULANLAR", href: "/faq" },
    { name: "KARGO TAKİP", href: "/faq" },
  ];

  const items = useCart((state) => state.items);

  return (
    <>
      <nav className="sticky top-0 w-full z-[90] px-6 lg:px-12 bg-[#000000] border-b border-white/5 shadow-sm">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between min-h-[70px] gap-8">
          {/* Left: Logo */}
          <div className="flex-shrink-0 min-w-[150px]">
            <Link href="/" className="group flex items-center relative">
              {/* SANTO Style Compass Star Icon */}
              <svg 
                viewBox="0 0 24 24" 
                fill="white" 
                className="absolute -left-2 top-1/2 -translate-y-1/2 w-7 h-7 z-10"
                style={{ mixBlendMode: 'difference' }}
              >
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
              <h1 
                className="text-3xl sm:text-4xl lg:text-5xl uppercase text-white truncate max-w-[250px] relative z-0 pl-1"
                style={{ 
                  fontFamily: "Impact, 'Arial Black', 'Helvetica Neue', sans-serif", 
                  fontWeight: 900, 
                  letterSpacing: "-0.05em",
                  transform: "scaleY(1.05)"
                }}
              >
                {mounted ? (siteName.split('|')[0].trim() || "AKKESL") : "AKKESL"}
              </h1>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden lg:flex items-center justify-center flex-grow space-x-8 xl:space-x-10">
            {mounted && navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="group flex items-center gap-1.5 text-[13px] xl:text-[14px] tracking-[0.08em] font-semibold transition-all text-white hover:text-white/70 whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end space-x-6 xl:space-x-8 flex-shrink-0 min-w-[150px]">
            <button 
              className="lg:hidden transition-colors text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <button className="transition-colors text-white/90 hover:text-white">
              <Search className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </button>
            <Link href="/profile" className="transition-colors text-white/90 hover:text-white hidden sm:block">
              <User className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </Link>
            <Link href="/cart" className="relative transition-colors text-white/90 hover:text-white">
              <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-2 text-[9px] w-[18px] h-[18px] flex items-center justify-center rounded-full bg-white text-black font-semibold">
                {mounted ? items.length : 0}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-[#000000] z-[80] flex flex-col lg:hidden"
          >
            <div className="flex justify-between items-center px-8 py-8 border-b border-white/[0.05]">
              <span className="text-[10px] font-bold tracking-[0.4em] text-white/50 uppercase">MENÜ</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex flex-col h-full overflow-y-auto px-8 py-10">
              <nav className="space-y-6 mb-20">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <Link 
                      href={link.href} 
                      className="text-lg font-sans font-medium text-white/90 tracking-wider hover:text-white transition-colors flex items-center justify-between"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                      {link.hasDropdown && <ChevronDown size={18} className="opacity-40" />}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-auto pt-8 border-t border-white/[0.05] grid grid-cols-1 gap-8"
              >
                <div className="space-y-4">
                   <Link href="/profile" className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors">
                     <User size={20} strokeWidth={1.5} />
                     HESABIM
                   </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
