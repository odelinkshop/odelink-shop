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
    { name: "OUTLET", href: "/shop" },
    { name: "KOLEKSİYON", href: "/shop" },
    { name: "EDITORIAL", href: "/faq" },
    { name: "HAKKIMIZDA", href: "/about" },
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
                {mounted ? siteName.split('|')[0].trim() : "..."}
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

      {/* Mobile Menu - Professional Redesign */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 bg-[#080808] z-[60] flex flex-col lg:hidden overflow-hidden"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.png')] bg-repeat" />
            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[120px]" />

            <div className="relative z-10 flex flex-col h-full p-8 pt-12">
              <div className="flex justify-between items-center mb-16">
                <span className="text-[10px] font-black tracking-[0.6em] text-accent uppercase">ODELINK MENU</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white"
                >
                  <X size={18} strokeWidth={1} />
                </button>
              </div>

              <nav className="flex-grow space-y-10">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                  >
                    <Link 
                      href={link.href} 
                      className="group flex items-end space-x-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-4xl md:text-5xl font-serif text-white/90 font-light tracking-tighter group-hover:text-accent transition-colors italic">
                        {link.name}
                      </span>
                      <div className="h-px flex-grow bg-white/5 mb-3 group-hover:bg-accent/20 transition-colors" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-auto space-y-12 border-t border-white/5 pt-12"
              >
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[8px] font-black tracking-[0.5em] text-white/30 uppercase">Destek</p>
                    <a href="mailto:info@gmail.com" className="text-xs text-white/60 block hover:text-white transition-colors">info@gmail.com</a>
                    <p className="text-xs text-white/60">+90 000 000 00 00</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[8px] font-black tracking-[0.5em] text-white/30 uppercase">Sosyal</p>
                    <div className="flex space-x-6">
                       <a href="#" className="text-white/40 hover:text-white transition-colors uppercase text-[10px] tracking-widest">IG</a>
                       <a href="#" className="text-white/40 hover:text-white transition-colors uppercase text-[10px] tracking-widest">FB</a>
                       <a href="#" className="text-white/40 hover:text-white transition-colors uppercase text-[10px] tracking-widest">TW</a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between opacity-20">
                  <p className="text-[8px] tracking-[0.5em] uppercase">© 2026 ODELINK</p>
                  <div className="h-px w-12 bg-white" />
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
