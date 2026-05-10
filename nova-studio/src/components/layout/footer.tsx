"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { useStoreData } from "@/store/useStoreData";
import { motion } from "framer-motion";

const Footer = () => {
  const { siteName, settings, subdomain } = useStoreData();
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const response = await fetch(`/api/sites/public/${subdomain}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (response.ok) setStatus("success");
      else setStatus("error");
    } catch (err) {
      setStatus("error");
    }
  };

  const contact = settings.contact || {};
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-white/5 font-sans">
      {/* Top Section: Socials & Newsletter */}
      <div className="border-b border-white/5 py-12 px-6 lg:px-24">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center space-y-12">
          {/* Social Icons */}
          <div className="flex items-center space-x-6">
            {[
              { icon: <Instagram size={20} />, href: "#" },
              { icon: <Facebook size={20} />, href: "#" },
              { icon: <Twitter size={20} />, href: "#" },
              { icon: <Youtube size={20} />, href: "#" },
            ].map((social, i) => (
              <Link 
                key={i} 
                href={social.href} 
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
              >
                {social.icon}
              </Link>
            ))}
          </div>

          {/* Newsletter Header */}
          <div className="text-center space-y-2">
            <h3 className="text-xl md:text-2xl font-bold tracking-widest uppercase">HABER BÜLTENİMİZE ABONE OL</h3>
            <p className="text-white/40 text-sm font-light tracking-wide italic">Yeni koleksiyonlar ve özel indirimlerden ilk siz haberdar olun.</p>
          </div>

          {/* Newsletter Form */}
          <form onSubmit={handleNewsletter} className="w-full max-w-2xl flex flex-col md:flex-row gap-4">
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Posta adresinizi yazın..." 
              className="flex-1 bg-white/5 border border-white/10 px-6 py-4 outline-none text-sm tracking-wider focus:border-white/30 transition-all rounded-sm"
            />
            <button 
              disabled={status === "loading"}
              className="bg-white text-black px-12 py-4 text-sm font-bold tracking-widest uppercase hover:bg-white/90 transition-all rounded-sm active:scale-95"
            >
              {status === "loading" ? "..." : "GÖNDER"}
            </button>
          </form>
          {status === "success" && <p className="text-green-400 text-xs tracking-widest">Aramıza hoş geldin!</p>}
        </div>
      </div>

      {/* Main Links Section */}
      <div className="py-20 px-6 lg:px-24">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8">
          
          {/* Column 1: Bize Ulaşın */}
          <div className="space-y-8">
            <h4 className="text-sm font-bold tracking-[0.2em] uppercase border-b border-white/10 pb-4 inline-block">Bize Ulaşın</h4>
            <div className="space-y-6">
              <Link href={`tel:${contact.phone || "0532 171 34 09"}`} className="flex items-center space-x-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <Phone size={16} />
                </div>
                <span className="text-sm text-white/60 font-light group-hover:text-white transition-colors">{contact.phone || "0532 171 34 09"}</span>
              </Link>
              <Link href={`mailto:${contact.email || "nomarc857@gmail.com"}`} className="flex items-center space-x-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <Mail size={16} />
                </div>
                <span className="text-sm text-white/60 font-light group-hover:text-white transition-colors">{contact.email || "nomarc857@gmail.com"}</span>
              </Link>
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <span className="text-sm text-white/60 font-light leading-relaxed">İstanbul / Türkiye</span>
              </div>
            </div>
          </div>

          {/* Column 2: Kurumsal */}
          <div className="space-y-8">
            <h4 className="text-sm font-bold tracking-[0.2em] uppercase border-b border-white/10 pb-4 inline-block">Kurumsal</h4>
            <ul className="space-y-4">
              {[
                { label: "Hakkımızda", href: "/about" },
                { label: "İletişim", href: "/contact" },
                { label: "Aydınlatma Metni", href: "/policies/kvkk" },
                { label: "Sürdürülebilirlik", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/40 hover:text-white hover:pl-2 transition-all duration-300 font-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Önemli Bilgiler */}
          <div className="space-y-8">
            <h4 className="text-sm font-bold tracking-[0.2em] uppercase border-b border-white/10 pb-4 inline-block">Önemli Bilgiler</h4>
            <ul className="space-y-4">
              {[
                { label: "İptal & İade Şartları", href: "/policies/returns" },
                { label: "Sıkça Sorulan Sorular", href: "/faq" },
                { label: "Kargo Takip", href: "#" },
                { label: "Beden Rehberi", href: "#" },
                { label: "Blog", href: "/blog" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/40 hover:text-white hover:pl-2 transition-all duration-300 font-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Hızlı Erişim */}
          <div className="space-y-8">
            <h4 className="text-sm font-bold tracking-[0.2em] uppercase border-b border-white/10 pb-4 inline-block">Hızlı Erişim</h4>
            <ul className="space-y-4">
              {[
                "Tişörtler", "Outlet Ürünler", "Eşofman Altları", "Jeanler", "Gömlekler"
              ].map((item) => (
                <li key={item}>
                  <Link href="/shop" className="text-sm text-white/40 hover:text-white hover:pl-2 transition-all duration-300 font-light">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Payment & App Section */}
      <div className="border-t border-white/5 py-12 px-6 lg:px-24 bg-white/[0.02]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          {/* App Stores */}
          <div className="flex items-center space-x-6">
             <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-md hover:bg-white/10 cursor-pointer transition-all">
                <div className="text-xs">
                  <p className="text-[8px] uppercase opacity-40 leading-none">Download on</p>
                  <p className="font-bold leading-none">App Store</p>
                </div>
             </div>
             <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-md hover:bg-white/10 cursor-pointer transition-all">
                <div className="text-xs">
                  <p className="text-[8px] uppercase opacity-40 leading-none">Get it on</p>
                  <p className="font-bold leading-none">Google Play</p>
                </div>
             </div>
          </div>

          {/* Payment Icons */}
          <div className="flex items-center gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
             <span className="text-xs font-bold tracking-widest">IYZICO</span>
             <span className="text-xs font-bold tracking-widest">VISA</span>
             <span className="text-xs font-bold tracking-widest">MASTERCARD</span>
             <span className="text-xs font-bold tracking-widest">AMEX</span>
             <span className="text-xs font-bold tracking-widest">TROY</span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="bg-black py-12 px-6 lg:px-24">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4">
            <p className="text-sm text-white/60 tracking-wider">
              Bu Site <span className="text-white font-bold uppercase">{siteName.split('|')[0].trim()}</span> Tarafından Yönetilmektedir.
            </p>
            <p className="text-[11px] text-white/30 tracking-widest leading-relaxed max-w-4xl">
              Copyright© {year} {siteName.split('|')[0].trim()} All rights reserved. <br className="md:hidden" />
              Kredi kartı bilgileriniz <span className="text-white/50">Shopier</span> Tarafından 256bit SSL sertifikası ile korunmaktadır.
            </p>
          </div>

          {/* Odelink Logo (Ticimax style) */}
          <div className="pt-8 border-t border-white/5 w-full flex flex-col items-center space-y-4">
             <div className="flex items-center space-x-2 opacity-50 hover:opacity-100 transition-opacity">
                <span className="text-xl font-black tracking-tighter italic">ödelink</span>
             </div>
             <p className="text-[8px] tracking-[0.5em] text-white/20 uppercase font-bold">POWERED BY ODELINK ENGINE</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
