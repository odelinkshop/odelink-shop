"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export const CategoryGrid = () => {
  return (
    <section className="py-12 md:py-24 px-4 md:px-12 bg-background">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          
          {/* ————— LARGE (NEW SEASON) ————— */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-2 md:col-span-1 relative group overflow-hidden aspect-[4/5] md:aspect-auto md:h-[800px]"
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
                <span className="text-[8px] md:text-[10px] tracking-[0.5em] text-white/90 uppercase mb-2 block font-medium">
                  EXPLORE
                </span>
                <h3 className="text-2xl md:text-5xl font-serif text-white uppercase tracking-tight font-light">
                  NEW SEASON
                </h3>
              </div>
            </Link>
          </motion.div>

          {/* ————— SMALLER ITEMS ————— */}
          <div className="col-span-2 md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-6 md:h-[800px]">
            
            {/* ITEM 2 (SHIRTS) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative group overflow-hidden aspect-[3/4] md:aspect-auto"
            >
              <Link href="/shop" className="block w-full h-full">
                <Image
                  src="/cat_2.avif"
                  alt="Premium Shirts"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                  <h3 className="text-lg md:text-3xl font-serif text-white uppercase tracking-tight font-light leading-none">
                    SHIRTS
                  </h3>
                </div>
              </Link>
            </motion.div>

            {/* ITEM 3 (PANTS) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative group overflow-hidden aspect-[3/4] md:aspect-auto"
            >
              <Link href="/shop" className="block w-full h-full">
                <Image
                  src="/cat_3.avif"
                  alt="Designer Pants"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                  <h3 className="text-lg md:text-3xl font-serif text-white uppercase tracking-tight font-light leading-none">
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
