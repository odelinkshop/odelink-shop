"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  {
    id: 1,
    title: "KOMBİNLER",
    subtitle: "Koleksiyonu incele",
    image: "/4.jpg",
    link: "/shop?category=kombinler",
  },
  {
    id: 2,
    title: "GÜNLÜK ŞIKLIK",
    subtitle: "Koleksiyonu incele",
    image: "/2.png",
    link: "/shop?category=gunluk-siklik",
  },
  {
    id: 3,
    title: "DIŞ GİYİM",
    subtitle: "Koleksiyonu incele",
    image: "/1.jpg",
    link: "/shop?category=dis-giyim",
  },
  {
    id: 4,
    title: "KLASİK ŞIKLIK",
    subtitle: "Koleksiyonu incele",
    image: "/3.jpg",
    link: "/shop?category=klasik-siklik",
  },
];

export const CategoryGrid = () => {
  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.15 }}
            className="relative group overflow-hidden aspect-[3/4] w-full"
          >
          <Link href={category.link} prefetch={false} className="block w-full h-full">
              <Image
                src={category.image}
                alt={category.title}
                fill
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
                priority={index < 2}
              />
              {/* Elegant overlay: Darkening gradient towards bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 group-hover:from-black/85 group-hover:via-black/40 transition-all duration-500" />
              
              {/* Text overlay - aligned beautifully in the lower third */}
              <div className="absolute inset-x-0 bottom-6 md:bottom-12 flex flex-col items-center justify-center text-center px-2 z-10">
                <h3 className="text-sm sm:text-2xl md:text-3xl font-serif text-white tracking-widest font-light uppercase transition-transform duration-500 group-hover:scale-105 leading-tight">
                  {category.title}
                </h3>
                <span className="text-[7px] sm:text-[10px] md:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-white/70 uppercase mt-1 md:mt-2 font-light transition-colors duration-500 group-hover:text-white">
                  {category.subtitle}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
