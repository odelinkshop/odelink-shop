import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Twitter, Mail, ArrowRight } from 'lucide-react';
import useFooterLinks from '../hooks/useFooterLinks';
import BrandLogo from './BrandLogo';

const Footer = () => {
  const { quickLinks, resourceLinks, legalLinks, handleNavigation } = useFooterLinks();
  const [email, setEmail] = useState('');

  const supportEmail = useMemo(() => {
    const v = process.env.REACT_APP_SUPPORT_EMAIL;
    return typeof v === 'string' && v.trim().length > 0 ? v.trim() : 'info@gmail.com';
  }, []);

  const handleLinkClick = (link, type) => {
    if (type === 'quick') {
      handleNavigation(link.action === 'hash' ? 'hash' : 'navigate', link.value);
    } else {
      handleNavigation('navigate', link.path);
    }
  };

  return (
    <footer className="bg-[#050505] text-white pt-24 pb-12 border-t border-white/5 font-sans">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* ————— TOP: NEWSLETTER ————— */}
        <div className="flex flex-col items-center text-center mb-24 space-y-8">
          <div className="space-y-3">
             <h3 className="text-[10px] md:text-[12px] tracking-[0.5em] text-[#C5A059] uppercase font-bold">BÜLTEN</h3>
             <p className="text-white/40 text-sm md:text-base font-light">Özel fırsatlar ve güncellemeler için aramıza katılın.</p>
          </div>
          <div className="w-full max-w-md relative group">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-POSTA ADRESİNİZ"
              className="w-full bg-transparent border-b border-white/10 py-4 px-2 text-[11px] tracking-widest focus:border-[#C5A059] outline-none transition-all placeholder:text-white/10"
            />
            <button className="absolute right-0 bottom-4 text-[10px] tracking-[0.3em] font-bold text-white/40 hover:text-white transition-all flex items-center gap-2 group">
              KAYIT <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* ————— MIDDLE: GRID ————— */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16 mb-24">
          
          {/* İLETİŞİM */}
          <div className="space-y-6">
            <h4 className="text-[10px] tracking-[0.3em] text-white/20 uppercase font-bold">İLETİŞİM</h4>
            <div className="space-y-4">
               <p className="text-[12px] md:text-sm text-white/60 font-light">+90 000 000 00 00</p>
               <p className="text-[12px] md:text-sm text-white/60 font-light underline underline-offset-4 decoration-white/10">{supportEmail}</p>
               <p className="text-[12px] md:text-sm text-white/30 font-light leading-relaxed">İSTANBUL / TÜRKİYE</p>
            </div>
          </div>

          {/* KURUMSAL */}
          <div className="space-y-6">
            <h4 className="text-[10px] tracking-[0.3em] text-white/20 uppercase font-bold">KURUMSAL</h4>
            <ul className="space-y-3">
               {quickLinks.map((link) => (
                 <li key={link.id}>
                   <button onClick={() => handleLinkClick(link, 'quick')} className="text-[12px] md:text-sm text-white/60 hover:text-[#C5A059] transition-colors uppercase tracking-widest md:tracking-normal md:capitalize font-light">
                     {link.label}
                   </button>
                 </li>
               ))}
            </ul>
          </div>

          {/* YARDIM */}
          <div className="space-y-6">
            <h4 className="text-[10px] tracking-[0.3em] text-white/20 uppercase font-bold">YARDIM</h4>
            <ul className="space-y-3">
               {legalLinks.map((link) => (
                 <li key={link.id}>
                   <button onClick={() => handleLinkClick(link, 'legal')} className="text-[12px] md:text-sm text-white/60 hover:text-[#C5A059] transition-colors uppercase tracking-widest md:tracking-normal md:capitalize font-light">
                     {link.label}
                   </button>
                 </li>
               ))}
            </ul>
          </div>

          {/* SOSYAL */}
          <div className="space-y-6">
            <h4 className="text-[10px] tracking-[0.3em] text-white/20 uppercase font-bold">SOSYAL</h4>
            <div className="flex items-center gap-6">
               <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">
                 <Instagram size={20} strokeWidth={1.5} />
               </a>
               <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">
                 <Linkedin size={20} strokeWidth={1.5} />
               </a>
               <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">
                 <Twitter size={20} strokeWidth={1.5} />
               </a>
            </div>
          </div>
        </div>

        {/* ————— BOTTOM: APPS & LEGAL ————— */}
        <div className="pt-12 border-t border-white/5 flex flex-col items-center space-y-12">
          
          <div className="flex items-center gap-4">
             <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">🚀</div>
                <div className="flex flex-col">
                   <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Download on the</span>
                   <span className="text-[12px] font-bold">App Store</span>
                </div>
             </div>
             <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">🔥</div>
                <div className="flex flex-col">
                   <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Get it on</span>
                   <span className="text-[12px] font-bold">Google Play</span>
                </div>
             </div>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[9px] tracking-[0.3em] text-white/10 uppercase font-bold">
             <span>VISA</span>
             <span>MASTER</span>
             <span>TROY</span>
             <span>AMEX</span>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-2">
               <BrandLogo withText textClassName="text-white/40 text-xl font-black tracking-tighter" />
            </div>
            <p className="text-[10px] tracking-[0.2em] text-white/20 font-light uppercase">
              © 2024 Ödelink. Tüm hakları saklıdır.
            </p>
            <p className="text-[9px] tracking-[0.5em] text-white/5 uppercase font-black">
              DIGITAL COMMERCE EXPERIENCE
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

export default Footer;
