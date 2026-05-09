"use client";

import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/layout/navbar";
import { ProductCard } from "@/components/ui/product-card";
import { useStoreData } from "@/store/useStoreData";
import { motion } from "framer-motion";
import { Filter, ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category')?.toUpperCase() || "HEPSİ";
  
  const { products, isLoading } = useStoreData();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  
  // Update category if URL changes
  useEffect(() => {
    const cat = searchParams.get('category')?.toUpperCase();
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  // Dynamically extract categories from products
  const categories = ["HEPSİ", ...new Set(products.map(p => (p.category || 'DİĞER').toUpperCase()))];

  if (isLoading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center h-screen">
        <div className="text-accent text-xs tracking-[0.5em] uppercase font-bold animate-pulse">
          YÜKLENİYOR...
        </div>
      </div>
    );
  }

  const filteredProducts = activeCategory === "HEPSİ" 
    ? products 
    : products.filter(p => (p.category || 'DİĞER').toUpperCase() === activeCategory);

  return (
    <>
      <Navbar />
      <div className="pt-40 pb-24 px-6 lg:px-12 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 space-y-8 md:space-y-0">
          <div className="space-y-4">
            <h1 className="text-6xl font-serif text-secondary uppercase tracking-tighter">
              Koleksiyon
            </h1>
            <p className="text-xs tracking-[0.3em] uppercase text-accent font-bold">
              Estate Italiana &apos;26 Essentials
            </p>
          </div>
          
          <div className="flex items-center space-x-12 pb-2">
            <button className="flex items-center space-x-2 text-[10px] tracking-widest uppercase font-bold group">
              <Filter size={14} />
              <span>Filtrele</span>
            </button>
            <button className="flex items-center space-x-2 text-[10px] tracking-widest uppercase font-bold group">
              <span>Sırala</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-4 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 text-[10px] tracking-widest uppercase font-bold border transition-all duration-300 ${
                activeCategory === cat 
                  ? "bg-secondary text-primary border-secondary" 
                  : "border-secondary/10 text-secondary/40 hover:border-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {filteredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex-1 bg-background flex items-center justify-center h-screen font-serif text-secondary animate-pulse">
          YÜKLENİYOR...
        </div>
      }>
        <ShopContent />
      </Suspense>
    </main>
  );
}
