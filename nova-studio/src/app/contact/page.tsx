"use client";

import React from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-40 pb-24 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-24 space-y-6">
          <span className="text-xs tracking-[0.6em] uppercase text-accent font-bold italic">Concierge</span>
          <h1 className="text-7xl font-serif text-secondary uppercase tracking-tighter">İletişim</h1>
          <p className="text-secondary/60 max-w-xl mx-auto font-light leading-relaxed">
            Sorularınız veya özel talepleriniz için ekibimiz her zaman yanınızda. 
            Lütfen aşağıdaki formu doldurun, en kısa sürede size dönüş yapalım.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Contact Info */}
          <div className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-accent">
                   <Phone size={18} />
                   <span className="text-[10px] tracking-widest uppercase font-bold">Telefon</span>
                </div>
                <p className="text-lg font-serif">+90 000 000 00 00</p>
                <p className="text-xs text-secondary/40">Pzt - Cmt: 09:00 - 19:00</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-accent">
                   <Mail size={18} />
                   <span className="text-[10px] tracking-widest uppercase font-bold">E-Posta</span>
                </div>
                <p className="text-lg font-serif">info@nova.com</p>
                <p className="text-xs text-secondary/40">Genel ve Ticari sorular için</p>
              </div>
            </div>

            <div className="space-y-6 pt-12 border-t border-secondary/10">
               <div className="flex items-center space-x-3 text-accent">
                   <MapPin size={18} />
                   <span className="text-[10px] tracking-widest uppercase font-bold">Merkez Ofis</span>
                </div>
                <p className="text-xl font-serif leading-relaxed">
                  İtalya Riviera&apos;sı Esintili <br />
                  Modern Zarafet Ofisi, Türkiye
                </p>
            </div>

            {/* Visual Element */}
            <div className="relative aspect-video bg-neutral/20 overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center text-secondary/20">
                  <span className="text-xs tracking-widest uppercase italic">Harita Alanı (Demo)</span>
               </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-neutral/10 p-12 lg:p-16 border border-secondary/5">
             <form className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] tracking-widest uppercase font-bold text-secondary/60">ADINIZ & SOYADINIZ</label>
                   <input type="text" className="w-full bg-transparent border-b border-secondary/20 py-3 outline-none focus:border-secondary transition-colors text-sm" />
                </div>
                
                <div className="space-y-2">
                   <label className="text-[10px] tracking-widest uppercase font-bold text-secondary/60">E-POSTA ADRESİNİZ</label>
                   <input type="email" className="w-full bg-transparent border-b border-secondary/20 py-3 outline-none focus:border-secondary transition-colors text-sm" />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] tracking-widest uppercase font-bold text-secondary/60">KONU</label>
                   <select className="w-auto bg-transparent border-b border-secondary/20 py-3 outline-none focus:border-secondary transition-colors text-sm">
                      <option>Sipariş Durumu</option>
                      <option>Ürün Bilgisi</option>
                      <option>Geri İade</option>
                      <option>Diğer</option>
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] tracking-widest uppercase font-bold text-secondary/60">MESAJINIZ</label>
                   <textarea rows={4} className="w-full bg-transparent border-b border-secondary/20 py-3 outline-none focus:border-secondary transition-colors text-sm resize-none"></textarea>
                </div>

                <button className="w-full bg-secondary text-primary py-6 flex items-center justify-center space-x-4 hover:bg-accent transition-all group">
                   <span className="text-[10px] tracking-[0.3em] font-bold uppercase">MESAJI GÖNDER</span>
                   <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
