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
    <main className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-accent selection:text-primary overflow-x-hidden">
      {/* Background Decorative Elements - Refined */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-accent/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-white/[0.03] rounded-full blur-[150px]" />
      </div>

      <section className="relative flex-1 pt-52 pb-40 px-6 lg:px-24">
        <div className="max-w-4xl mx-auto">
          {/* Header Section - Minimalist & Elegant */}
          <div className="relative mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-4">
                <div className="h-px w-8 bg-accent/40" />
                <span className="text-[9px] font-black tracking-[0.8em] text-accent uppercase">
                  {subtitle}
                </span>
              </div>
              <h1 className="text-4xl md:text-7xl font-serif tracking-tighter leading-none uppercase">
                {title}
              </h1>
            </motion.div>
          </div>

          {/* Professional Content Layout */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="relative z-10"
          >
            <div className="prose prose-invert max-w-none prose-p:text-white/40 prose-p:text-base prose-p:leading-relaxed prose-headings:text-white/90 prose-headings:font-serif prose-headings:font-light prose-strong:text-white prose-strong:font-bold prose-a:text-accent hover:prose-a:text-white transition-all">
              {content}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
