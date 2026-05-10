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
    <main className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-accent selection:text-primary">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <section className="relative flex-1 pt-48 pb-32 px-6 lg:px-24">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="relative mb-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block"
            >
              <span className="text-[10px] font-black tracking-[0.6em] text-accent uppercase mb-6 block drop-shadow-sm">
                {subtitle}
              </span>
              <h1 className="text-5xl md:text-8xl font-serif tracking-tighter leading-none uppercase mb-8">
                {title}
              </h1>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto" />
            </motion.div>
          </div>

          {/* Glass Content Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[2px] p-8 md:p-16 lg:p-20 shadow-2xl"
          >
            <div className="prose prose-invert max-w-none prose-p:text-white/50 prose-p:text-lg prose-p:leading-relaxed prose-headings:text-white prose-headings:font-serif prose-strong:text-accent prose-a:text-accent hover:prose-a:text-white transition-colors">
              {content}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
