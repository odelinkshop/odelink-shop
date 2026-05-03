"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";
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
    <footer className="bg-secondary text-primary pt-24 pb-12 border-t border-white/5 px-6 lg:px-24">
      <div className="max-w-[1800px] mx-auto">
        
        {/* Newsletter Section */}
        <div className="text-center mb-24 max-w-2xl mx-auto">
          <h3 className="text-sm font-bold tracking-[0.3em] uppercase mb-12 text-accent">
            HABER BÜLTENİMİZE ABONE OL
          </h3>
          <form onSubmit={handleNewsletter} className="relative flex items-center border-b border-primary/20 pb-4">
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Posta adresinizi yazın.." 
              className="w-full bg-transparent outline-none text-xs tracking-widest uppercase placeholder:text-primary/30 text-primary"
            />
            <button 
              disabled={status === "loading"}
              className="text-[10px] font-bold tracking-widest uppercase hover:text-accent transition-colors text-primary"
            >
              {status === "loading" ? "Gönderiliyor..." : status === "success" ? "Teşekkürler!" : "Gönder"}
            </button>
          </form>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 mb-24">
          
          {/* Bize Ulaşın */}
          <div className="space-y-8">
            <h4 className="text-sm font-bold tracking-widest uppercase text-accent">Bize Ulaşın</h4>
            <div className="space-y-4">
              {contact.phone && (
                <div className="flex items-center space-x-4 group cursor-pointer">
                  <Phone size={18} strokeWidth={1.5} className="text-primary/60 group-hover:text-accent" />
                  <span className="text-xs font-bold">{contact.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-4 group cursor-pointer">
                <Mail size={18} strokeWidth={1.5} className="text-primary/60 group-hover:text-accent" />
                <span className="text-xs font-bold">{contact.email || `info@${subdomain}.odelink.shop`}</span>
              </div>
              <div className="flex items-center space-x-4 group cursor-pointer">
                <MapPin size={18} strokeWidth={1.5} className="text-primary/60 group-hover:text-accent" />
                <span className="text-xs font-bold">Türkiye</span>
              </div>
            </div>
          </div>

          {/* Kurumsal */}
          <div className="space-y-8">
            <h4 className="text-sm font-bold tracking-widest uppercase text-accent">Kurumsal</h4>
            <ul className="space-y-4">
              {[
                { name: "İletişim", href: "/contact" },
                { name: "Aydınlatma Metni", href: "/policies/kvkk" }
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-xs text-primary/60 hover:text-accent transition-colors font-medium">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Önemli Bilgiler */}
          <div className="space-y-8">
            <h4 className="text-sm font-bold tracking-widest uppercase text-accent">Önemli Bilgiler</h4>
            <ul className="space-y-4">
              {[
                { name: "İptal & İade Şartları", href: "/policies/returns" },
                { name: "Sıkça Sorulan Sorular", href: "/faq" },
                { name: "Blog", href: "/blog" }
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-xs text-primary/60 hover:text-accent transition-colors font-medium">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hızlı Erişim */}
          <div className="space-y-8">
            <h4 className="text-sm font-bold tracking-widest uppercase text-accent">Hızlı Erişim</h4>
            <ul className="space-y-4">
              {[
                { name: "Keten Koleksiyonu", href: "/shop/linen" },
                { name: "Akdeniz Essentials", href: "/shop/essentials" },
                { name: "Sartorial (Terzi İşi)", href: "/shop/sartorial" },
                { name: "Deri & Aksesuar", href: "/shop/accessories" },
                { name: "Yeni Gelenler", href: "/shop" }
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-xs text-primary/60 hover:text-accent transition-colors font-medium">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="pt-12 border-t border-primary/5 text-center space-y-4">
          <p className="text-[11px] text-primary/60">
            Bu Site 
            <a 
              href="https://www.odelink.shop/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent font-bold mx-1 hover:brightness-125 transition-all inline-block"
              style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.5), 2px 2px 0px rgba(197,160,89,0.3)" }}
            >
              Ödelink
            </a> 
            Tarafından Yönetilmektedir.
          </p>
          <p className="text-[10px] text-primary/40 leading-relaxed">
            Copyright© 2024 Ödelink All rights reserved. Kredi kartı bilgileriniz 
            <a 
              href="https://www.shopier.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent font-bold mx-1 hover:brightness-125 transition-all inline-block"
              style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.5), 2px 2px 0px rgba(197,160,89,0.3)" }}
            >
              Shopier
            </a> 
            Tarafından 256bit SSL sertifikası ile korunmaktadır.
          </p>
        </div>
        {/* Bottom Bar Branding */}
        <div className="pt-16 border-t border-primary/5 flex flex-col items-center justify-center space-y-6">
          <div className="relative group cursor-default">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex items-center justify-center"
            >
              {"ÖDELİNK".split("").map((char, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: { 
                      opacity: 0, 
                      y: index % 2 === 0 ? -50 : 50, 
                      x: (index - 3) * 20,
                      rotateX: 90,
                      rotateY: 45
                    },
                    visible: { 
                      opacity: 1, 
                      y: 0, 
                      x: 0, 
                      rotateX: 0, 
                      rotateY: 0,
                      transition: { 
                        type: "spring", 
                        damping: 15, 
                        stiffness: 100,
                        delay: index * 0.05 
                      }
                    }
                  }}
                  animate={{
                    y: [0, -5, 0],
                    transition: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2
                    }
                  }}
                  className="text-4xl md:text-5xl font-serif font-black text-accent tracking-tighter"
                  style={{ 
                    textShadow: "1.5px 1.5px 0px #8B7355, 3px 3px 0px rgba(0,0,0,0.3), 4px 4px 15px rgba(197,160,89,0.3)" 
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-primary/30 font-bold text-center"
          >
            Türkiye&apos;nin İlk Şirketsiz SaaS Platformu
          </motion.p>
        </div>

      </div>
    </footer>
  );
};


export default Footer;
