"use client";

import React from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Image from "next/image";
import { motion } from "framer-motion";

const articles = [
  {
    title: "Amalfi Sahillerinde Bir Yaz Rüyası",
    category: "LIFESTYLE",
    image: "/hero_italian.png",
    date: "24 Nisan 2026"
  },
  {
    title: "Old Money Stilinin 5 Temel Kuralı",
    category: "STYLING",
    image: "/cat_knitwear.png",
    date: "20 Nisan 2026"
  },
  {
    title: "Toskana Bağlarında Keten Şıklığı",
    category: "COLLECTION",
    image: "/tuscany.png",
    date: "15 Nisan 2026"
  }
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-40 pb-24 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-24 space-y-6">
          <span className="text-xs tracking-[0.6em] uppercase text-accent font-bold">The Editorial</span>
          <h1 className="text-7xl font-serif text-secondary uppercase tracking-tighter">Journal</h1>
        </div>

        <div className="space-y-32">
          {articles.map((article, i) => (
            <motion.article
              key={article.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-16 items-center`}
            >
              <div className="flex-1 relative aspect-[16/9] w-full bg-neutral/10 overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <span className="text-[10px] tracking-[0.4em] uppercase text-accent font-bold">{article.category}</span>
                <h2 className="text-4xl font-serif text-secondary leading-tight">{article.title}</h2>
                <p className="text-sm text-secondary/60 leading-relaxed font-light">
                  İtalyan Riviera&apos;sının eşsiz atmosferinde, lüksün en saf haliyle tanışın. 
                  Bu sezonda doğallık ve zarafet ön planda.
                </p>
                <div className="pt-6">
                  <button className="text-[10px] tracking-widest uppercase font-bold border-b border-secondary/20 pb-1 hover:border-secondary transition-all">
                    DEVAMINI OKU
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
