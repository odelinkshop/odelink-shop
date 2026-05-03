"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { useStoreData } from "@/store/useStoreData";

export const CategoryGrid = () => {
  const { products } = useStoreData();
  
  // Dynamically extract categories and their first image
  const categories = Array.from(
    products.reduce((acc, p) => {
      const catName = (p.category || 'KOLEKSİYON').toUpperCase();
      if (!acc.has(catName) && acc.size < 4) {
        const catSlug = catName.toLowerCase().replace(/\s+/g, '-');
        acc.set(catName, {
          name: catName,
          image: p.images?.[0] || "/hero_italian.png",
          href: `/shop?category=${encodeURIComponent(catName)}`
        });
      }
      return acc;
    }, new Map()).values()
  );

  if (categories.length === 0) return null;

  if (categories.length === 0) return null;
  return (
    <section className="py-16 md:py-24 px-6 lg:px-12 bg-background">
      <div className="max-w-[1800px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group"
          >
            <Link href={cat.href} className="space-y-6">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-serif text-secondary tracking-[0.2em] uppercase">
                  {cat.name}
                </h3>
                <span className="text-[9px] tracking-[0.4em] uppercase text-accent font-bold mt-2 block opacity-0 group-hover:opacity-100 transition-opacity">
                  KEŞFET
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
