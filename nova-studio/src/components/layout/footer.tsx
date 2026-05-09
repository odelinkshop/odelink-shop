"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Globe } from "lucide-react";
import { useStoreData } from "@/store/useStoreData";

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

  return (
    <footer className="bg-secondary text-primary pt-40 pb-20 px-6 lg:px-24 border-t border-primary/5 relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/[0.02] -skew-x-12 translate-x-1/2 pointer-events-none" />

      <div className="max-w-[1800px] mx-auto relative z-10">
        
        {/* Upper Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-20 mb-40">
           <div className="xl:col-span-7 space-y-12 overflow-hidden pr-4">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-light tracking-tighter uppercase leading-none truncate w-full">{siteName.split('|')[0].trim()}</h2>
                <div className="h-px w-20 bg-accent/40" />
              </div>
              <p className="text-[11px] md:text-[13px] tracking-[0.15em] text-primary/60 uppercase max-w-md font-light leading-relaxed">
                Modern aristokrasinin sessiz lüksü ile tanışın. <br />
                Sadelik en üstün sofistikasyondur. <br />
                Her parça, zamansız bir hikayenin mirasıdır.
              </p>
           </div>

           <div className="xl:col-span-4 xl:col-start-9 space-y-10">
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-accent">İmza Listesi</h3>
                <p className="text-[9px] tracking-[0.2em] text-primary/40 uppercase font-light">Koleksiyon güncellemeleri ve özel davetler için.</p>
              </div>
              <form onSubmit={handleNewsletter} className="group relative">
                <input 
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-POSTA ADRESİNİZ" 
                  className="w-full bg-transparent border-b border-primary/20 pb-4 outline-none text-[10px] tracking-[0.3em] uppercase placeholder:text-primary/20 text-primary font-light transition-all focus:border-accent"
                />
                <button 
                  disabled={status === "loading"}
                  className="absolute right-0 bottom-4 text-[10px] font-medium tracking-[0.3em] uppercase hover:text-accent transition-all transform hover:translate-x-1"
                >
                  {status === "loading" ? "..." : "KAYDOL"}
                </button>
              </form>
           </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-40">
          <div className="space-y-10">
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-accent/80">KEŞFET</h4>
            <ul className="space-y-4">
              {["Koleksiyonlar", "En Çok Satanlar", "Yeni Gelenler", "Outlet"].map((item) => (
                <li key={item}>
                  <Link href="/shop" className="text-[10px] text-primary/40 hover:text-accent transition-all tracking-[0.2em] font-light uppercase">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-10">
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-accent/80">KURUMSAL</h4>
            <ul className="space-y-4">
              {["Hakkımızda", "Atölye", "Sürdürülebilirlik", "Editorial"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[10px] text-primary/40 hover:text-accent transition-all tracking-[0.2em] font-light uppercase">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-10">
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-accent/80">YARDIM</h4>
            <ul className="space-y-4">
              {["İade & İptal", "Kargo Takip", "S.S.S", "Beden Rehberi"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[10px] text-primary/40 hover:text-accent transition-all tracking-[0.2em] font-light uppercase">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-10">
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-accent/80">İLETİŞİM</h4>
            <div className="space-y-5">
              <div className="flex flex-col space-y-1">
                <span className="text-[8px] text-primary/20 tracking-widest uppercase">E-Posta</span>
                <Link href={`mailto:${contact.email || `info@${subdomain}.shop`}`} className="text-[10px] tracking-widest font-light hover:text-accent transition-colors">
                  {contact.email || `info@${subdomain}.shop`}
                </Link>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-[8px] text-primary/20 tracking-widest uppercase">Sosyal</span>
                <Link href="#" className="text-[10px] tracking-widest font-light hover:text-accent transition-colors">
                  INSTAGRAM / TIKTOK
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-12 opacity-20 grayscale scale-90">
             <span className="text-[8px] tracking-[0.4em] font-light">VISA</span>
             <span className="text-[8px] tracking-[0.4em] font-light">MASTERCARD</span>
             <span className="text-[8px] tracking-[0.4em] font-light">AMEX</span>
          </div>

          <p className="text-[9px] tracking-[0.4em] text-primary/30 uppercase font-light text-center md:text-right">
            © {new Date().getFullYear()} {siteName}. RESMİ WEB SİTESİ. <br className="md:hidden" />
            <span className="text-primary/10 ml-2">POWERED BY NOVA ENGINE</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
