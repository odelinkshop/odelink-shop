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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
  const year = mounted ? new Date().getFullYear() : 2026;
  const storeDisplayName = mounted ? siteName.split('|')[0].trim() : "MAĞAZA";

  return (
    <footer className="bg-black text-white border-t border-white/10 font-sans overflow-hidden">
      {/* Newsletter Section - Ultra Minimalist */}
      <div className="py-12 px-6 border-b border-white/5">
        <div className="max-w-2xl mx-auto flex flex-col items-center space-y-6">
          <div className="text-center">
            <h3 className="text-xs font-black tracking-[0.4em] uppercase mb-2">BÜLTEN</h3>
            <p className="text-[10px] text-white/60 tracking-wider font-light">Özel fırsatlar için aramıza katılın.</p>
          </div>
          <form onSubmit={handleNewsletter} className="w-full flex border-b border-white/20 pb-2">
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-POSTA ADRESİNİZ" 
              className="flex-1 bg-transparent outline-none text-[10px] tracking-widest placeholder:text-white/20 uppercase"
            />
            <button 
              disabled={status === "loading"}
              className="text-[10px] font-black tracking-[0.2em] hover:opacity-50 transition-opacity"
            >
              {status === "loading" ? "..." : "KAYIT"}
            </button>
          </form>
          {status === "success" && <p className="text-green-400 text-[9px] tracking-widest font-bold">KAYIT TAMAMLANDI.</p>}
        </div>
      </div>

      {/* Main Grid - Tight and Elegant */}
      <div className="py-16 px-6 lg:px-24">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          
          <div className="space-y-4">
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">İLETİŞİM</h4>
            <div className="flex flex-col space-y-2 text-[11px] font-light tracking-wide">
              <a href={`tel:${contact.phone || "+90 000 000 00 00"}`} className="hover:opacity-50 transition-opacity">{mounted ? (contact.phone || "+90 000 000 00 00") : "..."}</a>
              <a href={`mailto:${contact.email || "info@gmail.com"}`} className="hover:opacity-50 transition-opacity">{mounted ? (contact.email || "info@gmail.com") : "..."}</a>
              <p className="opacity-60 text-[10px] uppercase">{mounted ? (contact.address || "İSTANBUL / TÜRKİYE") : "..."}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">KURUMSAL</h4>
            <ul className="flex flex-col space-y-2 text-[11px] font-light tracking-wide">
              <li><Link href="/about" className="hover:opacity-50 transition-opacity">HAKKIMIZDA</Link></li>
              <li><Link href="/contact" className="hover:opacity-50 transition-opacity">İLETİŞİM</Link></li>
              <li><Link href="/policies/terms" className="hover:opacity-50 transition-opacity">SÖZLEŞMELER</Link></li>
              <li><Link href="/policies/privacy" className="hover:opacity-50 transition-opacity">GİZLİLİK</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">YARDIM</h4>
            <ul className="flex flex-col space-y-2 text-[11px] font-light tracking-wide">
              <li><Link href="/policies/returns" className="hover:opacity-50 transition-opacity">İADE KOŞULLARI</Link></li>
              <li><Link href="/faq" className="hover:opacity-50 transition-opacity">KARGO TAKİP</Link></li>
              <li><Link href="/faq" className="hover:opacity-50 transition-opacity">SIKÇA SORULANLAR</Link></li>
              <li><Link href="/faq" className="hover:opacity-50 transition-opacity">BLOG</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">SOSYAL</h4>
            <div className="flex space-x-4">
               {settings.social_links?.instagram && (
                 <a href={settings.social_links.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity"><InstagramIcon /></a>
               )}
               {settings.social_links?.facebook && (
                 <a href={settings.social_links.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity"><FacebookIcon /></a>
               )}
               {settings.social_links?.x && (
                 <a href={settings.social_links.x} target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity"><TwitterIcon /></a>
               )}
            </div>
          </div>

        </div>
      </div>

      {/* Payment & Stores - Scaled Down */}
      <div className="border-t border-white/5 py-8 px-6 lg:px-24">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-4">
             <a 
               href="https://www.apple.com/" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all"
             >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2.01.76-3.27.82-1.31.05-2.31-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91 1.65.06 2.87.6 3.72 1.84a6.49 6.49 0 0 0-3.32 5.56c.03 2.15 1.1 3.51 2.39 4.26zM15.48 5.44c.75-.91 1.25-2.18 1.11-3.44-1.09.04-2.41.72-3.19 1.63-.7.81-1.31 2.11-1.15 3.34 1.22.09 2.48-.62 3.23-1.53z"/></svg>
                <div className="text-[10px] font-black tracking-tight leading-none">App Store</div>
             </a>
             <a 
               href="https://play.google.com/" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all"
             >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M3.25 3.125c-.121.121-.191.29-.191.472v16.811c0 .181.07.351.191.472l9.047-9.047-9.047-9.047zm.944-.944l9.22 5.32 2.99-2.99-12.21-7.05c-.171-.1-.384-.1-.555 0-.171.1-.285.281-.285.477v4.243zm12.21 6.264l-2.99 2.99 9.22 5.32c.171.1.384.1.555 0 .171-.1.285-.281.285-.477v-12.21c0-.196-.114-.377-.285-.477-.171-.1-.384-.1-.555 0l-6.23 3.593zM13.438 12.375l-9.22 5.32 12.21 7.05c.171.1.384.1.555 0 .171-.1.285-.281.285-.477v-4.243l-3.83-3.65z"/></svg>
                <div className="text-[10px] font-black tracking-tight leading-none">Google Play</div>
             </a>
          </div>

          <div className="flex items-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all">
             <span className="text-[8px] font-black tracking-widest border border-white/20 px-1.5 py-0.5 rounded uppercase">Visa</span>
             <span className="text-[8px] font-black tracking-widest border border-white/20 px-1.5 py-0.5 rounded uppercase">Master</span>
             <span className="text-[8px] font-black tracking-widest border border-white/20 px-1.5 py-0.5 rounded uppercase">Troy</span>
             <span className="text-[8px] font-black tracking-widest border border-white/20 px-1.5 py-0.5 rounded uppercase">Amex</span>
          </div>
        </div>
      </div>

      {/* Final Bottom Bar - Premium Dark */}
      <div className="bg-black pt-12 pb-8 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          
          {/* Ödelink Branding - Centered Hero */}
          {!settings?.branding?.hide_odelink_credit && (
            <div className="flex justify-center mb-10">
              <a 
                href="https://www.odelink.shop" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex flex-col items-center"
              >
                <span 
                  className="text-[2.2rem] font-black text-white/85 group-hover:text-white transition-colors duration-500"
                  style={{ fontStyle: 'italic', letterSpacing: '-0.04em', fontFamily: 'Georgia, serif' }}
                >
                  Ödelink
                </span>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-6 h-px bg-white/15" />
                  <span className="text-[8px] tracking-[0.4em] font-semibold text-white/40 group-hover:text-white/70 transition-colors duration-500 uppercase">
                    Türkiye'nin En İyi E-Ticaret Vitrin Platformu
                  </span>
                  <div className="w-6 h-px bg-white/15" />
                </div>
              </a>
            </div>
          )}

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

          {/* Bottom Strip - Horizontal Professional Layout */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left - Site Management */}
            <p className="text-[10px] tracking-[0.1em] text-white/50 font-light order-2 md:order-1">
              <Link href="/" className="font-semibold text-white/70 hover:text-white transition-colors duration-300">{storeDisplayName}</Link>
              <span className="mx-1.5 text-white/20">|</span>
              Özenle yönetilmektedir
            </p>

            {/* Center - Copyright */}
            <p className="text-[10px] tracking-[0.15em] text-white/40 font-light order-1 md:order-2">
              © {year} Tüm hakları saklıdır.
            </p>

            {/* Right - Payment Security */}
            <div className="flex items-center gap-1.5 text-[10px] text-white/50 order-3">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span className="font-light tracking-[0.08em]">
                Bütün ödemeler{" "}
                <a href="https://www.shopier.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-white/70 hover:text-white transition-colors duration-300">
                  Shopier
                </a>
                {" "}güvencesindedir
              </span>
            </div>

          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
