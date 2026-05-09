"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export const CategoryGrid = () => {
  return (
    <section className="py-12 md:py-24 px-4 md:px-12 bg-background">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 h-auto md:h-[800px]">
          
          {/* ————— LARGE LEFT (NEW SEASON) ————— */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative group overflow-hidden aspect-[4/5] md:aspect-auto"
          >
            <Link href="/shop" className="block w-full h-full">
              <Image
                src="/cat_1.jpg"
                alt="New Season"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
                <span className="text-[9px] md:text-[10px] tracking-[0.4em] text-primary/80 uppercase mb-2 block font-light">
                  EXPLORE
                </span>
                <h3 className="text-3xl md:text-4xl font-serif text-primary uppercase tracking-tight font-light">
                  NEW SEASON
                </h3>
              </div>
            </Link>
          </motion.div>

          {/* ————— RIGHT COLUMN (2 STACKED) ————— */}
          <div className="grid grid-cols-1 md:grid-rows-2 gap-4 md:gap-6">
            
            {/* TOP RIGHT (SHIRTS) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative group overflow-hidden aspect-[4/5] md:aspect-auto"
            >
              <Link href="/shop" className="block w-full h-full">
                <Image
                  src="/cat_2.avif"
                  alt="Premium Shirts"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
                  <h3 className="text-2xl font-serif text-primary uppercase tracking-tight font-light">
                    SHIRTS
                  </h3>
                </div>
              </Link>
            </motion.div>

            {/* BOTTOM RIGHT (PANTS) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative group overflow-hidden aspect-[4/5] md:aspect-auto"
            >
              <Link href="/shop" className="block w-full h-full">
                <Image
                  src="/cat_3.avif"
                  alt="Designer Pants"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
                  <h3 className="text-2xl font-serif text-primary uppercase tracking-tight font-light">
                    PANTS
                  </h3>
                </div>
              </Link>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};
