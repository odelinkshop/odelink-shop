"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/store/useCart";
import { cn } from "@/lib/utils";
import { useStoreData } from "@/store/useStoreData";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const pathname = usePathname();
  const { siteName, products } = useStoreData();
  const isHomePage = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSearch = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "HAKKIMIZDA", href: "/about" },
    { name: "İLETİŞİM", href: "/contact" },
    { name: "SIKÇA SORULANLAR", href: "/faq" },
    { name: "KARGO TAKİP", href: "/faq" },
  ];

  const items = useCart((state) => state.items);
  const isActive = !isHomePage || isScrolled;

  return (
    <>
      <nav
        className={cn(
          "fixed w-full z-50 transition-all duration-700 px-6 lg:px-12",
          isScrolled 
            ? "top-0 bg-primary/95 backdrop-blur-md py-3 border-b border-secondary/5 shadow-sm" 
            : "top-[41px] bg-transparent py-7"
        )}
      >
        <div className="max-w-[1800px] mx-auto flex items-center justify-between min-h-[60px] gap-8">
          {/* Left: Logo */}
          <div className="flex-shrink-0 min-w-[150px]">
            <Link href="/" className="group inline-block">
              <h1 className={cn(
                "text-base sm:text-lg lg:text-xl xl:text-2xl font-serif tracking-[-0.03em] transition-all uppercase font-normal truncate max-w-[200px]",
                isActive ? "text-secondary" : "text-white"
              )}>
                {mounted ? (siteName.split('|')[0].trim() || "MAĞAZA") : "MAĞAZA"}
              </h1>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden lg:flex items-center justify-center flex-grow space-x-6 xl:space-x-12">
            {mounted && navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-[9px] xl:text-[10px] tracking-[0.4em] xl:tracking-[0.5em] font-light transition-all hover:opacity-60 whitespace-nowrap",
                  isActive ? "text-secondary" : "text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end space-x-6 xl:space-x-8 flex-shrink-0 min-w-[150px]">
             <button 
              className={cn(
                "lg:hidden transition-colors",
                isActive ? "text-secondary" : "text-white"
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <button 
              onClick={() => setIsSearchOpen(true)}
              className={cn(
                "transition-colors hover:opacity-60",
                isActive ? "text-secondary" : "text-white"
              )}
            >
              <Search className="w-4 h-4 xl:w-5 xl:h-5" strokeWidth={1} />
            </button>
            <Link href="/cart" className={cn(
              "relative transition-colors hover:opacity-60",
              isActive ? "text-secondary" : "text-white"
            )}>
              <ShoppingBag className="w-4 h-4 xl:w-5 xl:h-5" strokeWidth={1} />
              <span className={cn(
                "absolute -top-1.5 -right-1.5 text-[8px] w-4 h-4 flex items-center justify-center rounded-full",
                isActive ? "bg-secondary text-primary" : "bg-white text-secondary"
              )}>
                {mounted ? items.length : 0}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Refined Luxury Redesign */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-[#0A0A0A] z-[60] flex flex-col lg:hidden"
          >
            {/* Minimalist Header */}
            <div className="flex justify-between items-center px-8 py-10 border-b border-white/[0.03]">
              <span className="text-[10px] font-medium tracking-[0.4em] text-white/40 uppercase">MENU</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={22} strokeWidth={1} />
              </button>
            </div>

            <div className="flex flex-col h-full overflow-y-auto px-8 py-12">
              {/* Primary Links - Refined & Smaller */}
              <nav className="space-y-8 mb-20">
                {[
                  { name: "HAKKIMIZDA", href: "/about" },
                  { name: "İLETİŞİM", href: "/contact" },
                  { name: "SIKÇA SORULANLAR", href: "/faq" },
                  { name: "KARGO TAKİP", href: "/faq" },
                ].map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 + 0.2 }}
                  >
                    <Link 
                      href={link.href} 
                      className="text-2xl font-serif text-white/90 tracking-tight hover:text-accent transition-colors block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom Info Section - Professional Layout */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-auto pt-12 border-t border-white/[0.03] grid grid-cols-1 gap-12"
              >
                <div className="space-y-6">
                  <p className="text-[9px] font-black tracking-[0.3em] text-white/20 uppercase">İLETİŞİM KANALLARI</p>
                  <div className="space-y-3">
                    <a href="mailto:info@gmail.com" className="text-sm text-white/50 block hover:text-white transition-colors font-light">info@gmail.com</a>
                    <p className="text-sm text-white/50 font-light">+90 000 000 00 00</p>
                  </div>
                </div>

                <div className="space-y-6 pb-12">
                  <p className="text-[9px] font-black tracking-[0.3em] text-white/20 uppercase">BİZİ TAKİP EDİN</p>
                  <div className="flex space-x-8">
                     {['INSTAGRAM', 'FACEBOOK', 'TWITTER'].map(social => (
                       <a key={social} href="#" className="text-[10px] text-white/30 hover:text-white transition-colors tracking-[0.2em]">{social}</a>
                     ))}
                  </div>
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
