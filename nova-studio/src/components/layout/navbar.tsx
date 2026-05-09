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
    { name: "OUTLET", href: "/shop/outlet" },
    { name: "KOLEKSİYON", href: "/shop" },
    { name: "EDITORIAL", href: "/blog" },
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
                {siteName.split('|')[0].trim()}
              </h1>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden lg:flex items-center justify-center flex-grow space-x-6 xl:space-x-12">
            {navLinks.map((link) => (
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
                {items.length}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Search Overlay & Mobile Menu (Keeping logic, updating styles) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/99 backdrop-blur-2xl z-[60] flex flex-col p-8 lg:hidden"
          >
            <div className="flex justify-between items-center mb-16">
              <h1 className="text-2xl font-serif uppercase tracking-tight text-secondary font-normal truncate max-w-[80vw]">{siteName.split('|')[0].trim()}</h1>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-secondary flex-shrink-0"><X size={24} /></button>
            </div>
            <div className="flex flex-col space-y-8">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-4xl font-serif text-secondary font-light" onClick={() => setIsMobileMenuOpen(false)}>
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
