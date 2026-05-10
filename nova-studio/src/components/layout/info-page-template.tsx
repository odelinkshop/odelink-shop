"use client";

import React from 'react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { motion } from 'framer-motion';

interface InfoPageProps {
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export default function InfoPage({ title, subtitle, content }: InfoPageProps) {
  return (
    <main className="min-h-screen bg-background text-secondary flex flex-col">
      <Navbar />
      
      <section className="flex-1 pt-40 pb-24 px-6 lg:px-24">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4 border-b border-secondary/10 pb-12">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] tracking-[0.5em] text-accent uppercase font-medium"
            >
              {subtitle}
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-serif uppercase tracking-tight"
            >
              {title}
            </motion.h1>
          </div>

          {/* Content Area */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="prose prose-invert max-w-none prose-p:text-secondary/60 prose-p:leading-relaxed prose-headings:text-secondary prose-headings:font-serif"
          >
            {content}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
