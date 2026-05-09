"use client";

import React from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import { ProductCard } from "@/components/ui/product-card";
import { MOCK_PRODUCTS } from "@/services/mockData";
import { motion } from "framer-motion";

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;

  const filteredProducts = MOCK_PRODUCTS.filter(
    (p) => p.category.toLowerCase() === categorySlug.toLowerCase()
  );

  const categoryName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-40 pb-24 px-6 lg:px-12 max-w-[1800px] mx-auto">
        <header className="mb-24 text-center space-y-4">
          <span className="text-[10px] tracking-[0.6em] uppercase text-accent font-bold">Collection</span>
          <h1 className="text-6xl font-serif text-secondary uppercase tracking-tighter">
            {categoryName}
          </h1>
          <p className="text-secondary/40 text-xs tracking-widest">
            {filteredProducts.length} ÜRÜN BULUNDU
          </p>
        </header>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
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
        ) : (
          <div className="py-32 text-center space-y-8">
            <p className="text-secondary/40 font-light italic">Bu koleksiyonda henüz ürün bulunmuyor.</p>
            <a href="/shop" className="inline-block text-[10px] tracking-widest uppercase font-bold border-b border-secondary pb-1">
               TÜMÜNÜ GÖR
            </a>
          </div>
        )}
      </div>

    </main>
  );
}
