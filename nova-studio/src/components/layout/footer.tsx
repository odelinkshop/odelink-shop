"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { useStoreData } from "@/store/useStoreData";
import { motion } from "framer-motion";

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const YoutubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2c1.71.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
);

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
  const storeDisplayName = siteName.split('|')[0].trim();

  return (
    <footer className="bg-[#050505] text-[#f8f9fa] border-t border-white/5 font-sans overflow-hidden">
      {/* Top Section: Socials & Newsletter */}
      <div className="border-b border-white/5 py-12 px-6 lg:px-24 bg-gradient-to-b from-transparent to-white/[0.01]">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center space-y-12">
          {/* Social Icons */}
          <div className="flex items-center space-x-6">
            {[
              { icon: <InstagramIcon />, href: "https://instagram.com" },
              { icon: <FacebookIcon />, href: "https://facebook.com" },
              { icon: <TwitterIcon />, href: "https://twitter.com" },
              { icon: <YoutubeIcon />, href: "https://youtube.com" },
            ].map((social, i) => (
              <a 
                key={i} 
                href={social.href} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500 hover:scale-110 shadow-lg"
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* Newsletter Header */}
          <div className="text-center space-y-2">
            <h3 className="text-xl md:text-2xl font-black tracking-[0.25em] uppercase text-white">HABER BÜLTENİMİZE ABONE OL</h3>
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
              className="flex-1 bg-white/5 border border-white/10 px-6 py-4 outline-none text-sm tracking-wider focus:border-white/40 focus:bg-white/10 transition-all rounded-sm text-white placeholder:text-white/20"
            />
            <button 
              disabled={status === "loading"}
              className="bg-white text-black px-12 py-4 text-sm font-black tracking-widest uppercase hover:bg-white/90 transition-all rounded-sm active:scale-95 shadow-xl"
            >
              {status === "loading" ? "İŞLENİYOR..." : "KAYIT OL"}
            </button>
          </form>
          {status === "success" && <p className="text-green-400 text-xs tracking-widest font-bold animate-pulse">✨ Aramıza hoş geldin! Kaydın başarıyla alındı.</p>}
        </div>
      </div>

      {/* Main Links Section */}
      <div className="py-24 px-6 lg:px-24">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
          
          {/* Column 1: Bize Ulaşın */}
          <div className="space-y-8">
            <h4 className="text-xs font-black tracking-[0.3em] uppercase border-b-2 border-white/20 pb-4 inline-block text-white">MÜŞTERİ DESTEK</h4>
            <div className="space-y-6">
              <a href="tel:+900000000000" className="flex items-center space-x-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <Phone size={16} />
                </div>
                <span className="text-sm text-white/50 font-medium group-hover:text-white transition-colors tracking-widest">+90 000 000 00 00</span>
              </a>
              <a href="mailto:destek@odelink.shop" className="flex items-center space-x-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <Mail size={16} />
                </div>
                <span className="text-sm text-white/50 font-medium group-hover:text-white transition-colors tracking-wider">destek@odelink.shop</span>
              </a>
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <span className="text-sm text-white/50 font-medium leading-relaxed tracking-wide">Merkez Ofis / İstanbul, Türkiye</span>
              </div>
            </div>
          </div>

          {/* Column 2: Kurumsal */}
          <div className="space-y-8">
            <h4 className="text-xs font-black tracking-[0.3em] uppercase border-b-2 border-white/20 pb-4 inline-block text-white">KURUMSAL</h4>
            <ul className="space-y-4">
              {[
                { label: "Hakkımızda", href: "/about" },
                { label: "İletişim", href: "/contact" },
                { label: "Kullanıcı Sözleşmesi", href: "/policies/kvkk" },
                { label: "Gizlilik Politikası", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/30 hover:text-white hover:pl-2 transition-all duration-300 font-medium tracking-wide flex items-center">
                    <span className="w-0 h-[1px] bg-white group-hover:w-4 transition-all mr-0 group-hover:mr-2"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Önemli Bilgiler */}
          <div className="space-y-8">
            <h4 className="text-xs font-black tracking-[0.3em] uppercase border-b-2 border-white/20 pb-4 inline-block text-white">BİLGİ MERKEZİ</h4>
            <ul className="space-y-4">
              {[
                { label: "İptal & İade Koşulları", href: "/policies/returns" },
                { label: "Sıkça Sorulan Sorular", href: "/faq" },
                { label: "Teslimat ve Kargo", href: "#" },
                { label: "Güvenli Alışveriş", href: "#" },
                { label: "Blog Yazıları", href: "/blog" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/30 hover:text-white hover:pl-2 transition-all duration-300 font-medium tracking-wide">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Hızlı Erişim */}
          <div className="space-y-8">
            <h4 className="text-xs font-black tracking-[0.3em] uppercase border-b-2 border-white/20 pb-4 inline-block text-white">HIZLI ERİŞİM</h4>
            <ul className="space-y-4">
              {[
                "Yeni Sezon", "Çok Satanlar", "Koleksiyonlar", "İndirimli Ürünler", "Tüm Ürünler"
              ].map((item) => (
                <li key={item}>
                  <Link href="/shop" className="text-sm text-white/30 hover:text-white hover:pl-2 transition-all duration-300 font-medium tracking-wide">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Payment & App Section */}
      <div className="border-t border-white/5 py-12 px-6 lg:px-24 bg-white/[0.01]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          {/* App Stores */}
          <div className="flex items-center space-x-6">
             <a href="https://apple.com/app-store" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:bg-white hover:text-black transition-all duration-300 group shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2.01.76-3.27.82-1.31.05-2.31-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91 1.65.06 2.87.6 3.72 1.84a6.49 6.49 0 0 0-3.32 5.56c.03 2.15 1.1 3.51 2.39 4.26zM15.48 5.44c.75-.91 1.25-2.18 1.11-3.44-1.09.04-2.41.72-3.19 1.63-.7.81-1.31 2.11-1.15 3.34 1.22.09 2.48-.62 3.23-1.53z"/></svg>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold opacity-50 group-hover:opacity-80 transition-opacity">Download on</p>
                  <p className="text-sm font-black tracking-tight">App Store</p>
                </div>
             </a>
             <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:bg-white hover:text-black transition-all duration-300 group shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.25 3.125c-.121.121-.191.29-.191.472v16.811c0 .181.07.351.191.472l9.047-9.047-9.047-9.047zm.944-.944l9.22 5.32 2.99-2.99-12.21-7.05c-.171-.1-.384-.1-.555 0-.171.1-.285.281-.285.477v4.243zm12.21 6.264l-2.99 2.99 9.22 5.32c.171.1.384.1.555 0 .171-.1.285-.281.285-.477v-12.21c0-.196-.114-.377-.285-.477-.171-.1-.384-.1-.555 0l-6.23 3.593zM13.438 12.375l-9.22 5.32 12.21 7.05c.171.1.384.1.555 0 .171-.1.285-.281.285-.477v-4.243l-3.83-3.65z"/></svg>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold opacity-50 group-hover:opacity-80 transition-opacity">Get it on</p>
                  <p className="text-sm font-black tracking-tight">Google Play</p>
                </div>
             </a>
          </div>

          {/* Payment Icons */}
          <div className="flex items-center gap-4 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700 bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
             {/* Visa */}
             <svg width="40" height="25" viewBox="0 0 48 48" fill="none"><path d="M18.31 31.63L21.05 15H25.4l-2.74 16.63h-4.35zM38.89 15.4c-.81-.31-2.07-.64-3.61-.64-3.97 0-6.77 2.11-6.79 5.13-.03 2.23 2 3.47 3.52 4.21 1.56.76 2.08 1.25 2.08 1.93 0 1.04-1.25 1.51-2.4 1.51-1.6 0-2.46-.24-3.77-.82l-.53-.25-.56 3.49c.94.43 2.68.81 4.5 1.04l.11-.01.12.01c.26 0 .5-.01.73-.03 1.13-.07 2.14-.3 2.94-.74 2.87-1.37 3.99-3.23 3.99-4.8 0-1.87-1.12-3.28-3.58-4.45-1.49-.75-2.41-1.25-2.41-2.02 0-.71.77-1.47 2.45-1.47 1.38-.02 2.38.3 3.14.63l.37.18.57-3.36zm8.11-.4h-3.36c-1.04 0-1.82.3-2.27 1.39l-6.47 15.24h4.57l.91-2.52h5.58l.53 2.52h4.03L47 15zm-5.46 9.61l1.9-5.24 1.08 5.24h-2.98zM8.1 15L3.81 26.3c-.45 1.16-.76 1.54-1.74 2.06A17.9 17.9 0 0 1 0 29.17l.07.33h7.62c.96 0 1.83-.63 2.05-1.71l1.45-7.72L15.93 31.63h4.63L14 15H8.1z" fill="currentColor"/></svg>
             {/* Mastercard */}
             <svg width="40" height="25" viewBox="0 0 48 48" fill="none"><path d="M15.5 14C11.36 14 8 17.36 8 21.5c0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5c0-4.14-3.36-7.5-7.5-7.5z" fill="currentColor"/><path d="M32.5 14c-4.14 0-7.5 3.36-7.5 7.5 0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5c0-4.14-3.36-7.5-7.5-7.5z" fill="currentColor" opacity="0.8"/></svg>
             {/* Troy */}
             <span className="text-[10px] font-black tracking-tighter border border-white/20 px-2 py-1 rounded">TROY</span>
             {/* Maestro */}
             <svg width="40" height="25" viewBox="0 0 48 48" fill="none"><circle cx="16" cy="24" r="12" fill="currentColor" opacity="0.6"/><circle cx="32" cy="24" r="12" fill="currentColor" opacity="0.6"/></svg>
             {/* Amex */}
             <span className="text-[10px] font-black tracking-widest bg-white/10 px-2 py-1 rounded">AMEX</span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="bg-black py-16 px-6 lg:px-24">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center space-y-10 text-center">
          <div className="space-y-6">
            <p className="text-sm text-white/60 tracking-[0.2em] font-medium">
              Bu Site <Link href="/" className="text-white font-black hover:text-white/80 transition-colors border-b border-white/20 uppercase">{storeDisplayName}</Link> Tarafından Yönetilmektedir.
            </p>
            <div className="space-y-4">
              <p className="text-[11px] text-white/30 tracking-[0.25em] leading-loose max-w-4xl uppercase font-bold">
                Copyright© {year} {storeDisplayName} — Tüm Hakları Saklıdır. <br className="hidden md:block" />
                Ödemeleriniz <a href="https://www.shopier.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors underline decoration-white/20 underline-offset-4">Shopier</a> Güvencesiyle 256bit SSL Sertifikası Altında Korunmaktadır.
              </p>
            </div>
          </div>

          {/* Odelink Signature */}
          <div className="pt-12 border-t border-white/5 w-full flex flex-col items-center space-y-4">
             <a 
              href="https://www.odelink.shop" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center group"
             >
                <span className="text-2xl font-black tracking-tighter italic text-white/40 group-hover:text-white transition-all duration-500 transform group-hover:scale-105">ödelink</span>
                <p className="text-[9px] tracking-[0.6em] text-white/10 group-hover:text-white/30 uppercase font-black mt-2 transition-all">Digital Commerce Experience</p>
             </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
