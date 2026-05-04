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
      setIsScrolled(window.scrollY > 50);
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
          "fixed w-full z-50 transition-all duration-500 px-6 lg:px-12",
          isScrolled 
            ? "top-0 bg-background/80 backdrop-blur-md py-4 border-b border-secondary/10" 
            : "top-[37px] bg-transparent py-8"
        )}
      >
        <div className="max-w-[1800px] mx-auto grid grid-cols-3 items-center">
          {/* Left: Navigation */}
          <div className="flex items-center space-x-8">
            <button 
              className={cn(
                "lg:hidden transition-colors",
                isActive ? "text-secondary" : "text-primary"
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-[10px] tracking-[0.3em] font-bold transition-colors",
                    isActive ? "text-secondary hover:text-accent" : "text-primary hover:text-accent"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Center: Logo */}
          <Link href="/" className="flex justify-center group">
            <h1 className={cn(
              "text-xl sm:text-2xl lg:text-3xl font-serif tracking-[-0.05em] transition-colors uppercase",
              isActive ? "text-secondary" : "text-primary"
            )}>
              {siteName.split('|')[0].trim()}
            </h1>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center justify-end space-x-6">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className={cn(
                "transition-colors",
                isActive ? "text-secondary" : "text-primary"
              )}
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link href="/account" className={cn(
              "hidden sm:block transition-colors",
              isActive ? "text-secondary" : "text-primary"
            )}>
              <User size={20} strokeWidth={1.5} />
            </Link>
            <Link href="/cart" className={cn(
              "relative transition-colors",
              isActive ? "text-secondary" : "text-primary"
            )}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className={cn(
                "absolute -top-2 -right-2 text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold",
                isActive ? "bg-secondary text-primary" : "bg-primary text-secondary"
              )}>
                {items.length}
              </span>
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 bg-background/98 backdrop-blur-2xl z-[60] flex flex-col p-8 lg:hidden"
            >
              <div className="flex justify-between items-center mb-16">
                <h1 className="text-3xl font-serif uppercase tracking-tighter">{siteName}</h1>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-12 h-12 bg-secondary/5 rounded-full flex items-center justify-center border border-secondary/10"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col space-y-8">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="text-4xl font-serif text-secondary tracking-tight"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto space-y-6 pt-12 border-t border-secondary/10">
                 <Link 
                   href="/account" 
                   className="flex items-center space-x-4 text-xs tracking-widest uppercase font-bold"
                   onClick={() => setIsMobileMenuOpen(false)}
                 >
                    <User size={18} />
                    <span>Hesabım</span>
                 </Link>
                 <Link 
                   href="/cart" 
                   className="flex items-center space-x-4 text-xs tracking-widest uppercase font-bold"
                   onClick={() => setIsMobileMenuOpen(false)}
                 >
                    <ShoppingBag size={18} />
                    <span>Sepetim ({items.length})</span>
                 </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/98 z-[100] flex flex-col p-8 lg:p-24"
          >
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-8 right-8 lg:top-12 lg:right-12 text-secondary"
            >
              <X size={32} strokeWidth={1} />
            </button>

            <div className="max-w-4xl mx-auto w-full pt-24 space-y-12">
              <div className="space-y-4">
                <span className="text-xs tracking-[0.6em] uppercase text-accent font-bold">Search the collection</span>
                <input 
                  autoFocus
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün veya kategori arayın..."
                  className="w-full bg-transparent border-b border-secondary/20 py-8 text-4xl lg:text-6xl font-serif outline-none focus:border-secondary transition-colors"
                />
              </div>

              <div className="space-y-8">
                {searchQuery.length > 0 && (
                  <>
                    <h4 className="text-[10px] tracking-widest uppercase font-bold text-secondary/40">Sonuçlar</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {filteredSearch.map((product) => (
                        <Link 
                          key={product.id}
                          href={`/product/${product.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center space-x-6 p-4 hover:bg-secondary/5 transition-colors group"
                        >
                          <div className="relative w-20 h-24 bg-neutral/20">
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                          </div>
                          <div>
                            <h5 className="text-lg font-serif">{product.name}</h5>
                            <p className="text-xs text-accent uppercase tracking-widest mt-1">{product.category}</p>
                          </div>
                        </Link>
                      ))}
                      {filteredSearch.length === 0 && (
                        <p className="text-secondary/60 italic font-light">Eşleşen ürün bulunamadı.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
