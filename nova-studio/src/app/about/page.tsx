"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/navbar';
import { useStoreData } from '@/store/useStoreData';

export default function AboutPage() {
  const { siteName, settings } = useStoreData();
  
  return (
    <main className="flex-1 bg-background text-secondary min-h-screen">
      <Navbar />
      
      <div className="pt-40 pb-24 px-6 lg:px-24">
        <div className="max-w-4xl mx-auto space-y-16">
          <header className="space-y-4">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] tracking-[0.5em] uppercase text-accent font-bold"
            >
              HİKAYEMİZ
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-serif tracking-tight uppercase"
            >
              {siteName}
            </motion.h1>
          </header>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg prose-invert max-w-none"
          >
            <p className="text-xl md:text-2xl text-secondary/70 leading-relaxed font-light italic">
              "{settings.description || 'Zamansız zarafeti ve sessiz lüksü modern bir aristokrasi ile birleştiriyoruz.'}"
            </p>
            
            <div className="h-[1px] w-full bg-secondary/10 my-12" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-secondary/60 font-light leading-relaxed">
              <p>
                Mağazamız, kaliteyi ve estetiği her şeyin üzerinde tutan bir vizyonla kuruldu. 
                Her bir parçamız, sadece bir ürün değil, aynı zamanda bir yaşam tarzının yansımasıdır. 
                Geleneksel zanaatkarlığı modern tasarım anlayışıyla harmanlayarak, müşterilerimize 
                sıradanlıktan uzak bir deneyim sunmayı hedefliyoruz.
              </p>
              <p>
                Seçtiğimiz her doku, her renk ve her form; size kendinizi özel hissettirmek için 
                özenle kürate edildi. Mağazamızda sadece modayı değil, aynı zamanda zamana 
                meydan okuyan bir duruşu bulacaksınız. Bizimle bu yolculuğa katıldığınız için teşekkür ederiz.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
