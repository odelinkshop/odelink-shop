import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Instagram, Linkedin, Mail, Menu, MessageCircle, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthSession from '../hooks/useAuthSession';
import { isAdminUiEnabled, logoutAuthSession } from '../utils/authStorage';
import BrandLogo from './BrandLogo';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const disableDesktopEffects =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(min-width: 768px) and (pointer: fine)').matches;

  const allowedAdminEmail = useMemo(() => {
    const v = process.env.REACT_APP_ADMIN_EMAIL;
    return (v || 'muratbyrm3752@gmail.com').trim().toLowerCase();
  }, []);

  const supportEmail = useMemo(() => {
    const v = process.env.REACT_APP_SUPPORT_EMAIL;
    return (v || 'odelinkdestek@gmail.com').trim();
  }, []);
  const { isLoggedIn } = useAuthSession();

  const gmailHref = useMemo(() => {
    const to = encodeURIComponent(supportEmail);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}`;
  }, [supportEmail]);

  const linkedInHref = 'https://www.linkedin.com/in/%C3%B6delink';
  const instagramHref = 'https://www.instagram.com/odelink.shop';

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location?.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document?.body?.style?.overflow;
    if (document?.body?.style) document.body.style.overflow = 'hidden';
    return () => {
      if (document?.body?.style) document.body.style.overflow = prev || '';
    };
  }, [isMobileMenuOpen]);

  let siteBuilderHref = isLoggedIn ? '/site-builder' : '/auth';
  let panelHref = isLoggedIn ? '/panel' : '/auth';
  let showAdminUi = false;
  try {
    showAdminUi = isAdminUiEnabled(allowedAdminEmail);
  } catch (e) { void e; }

  const logout = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    await logoutAuthSession();
    navigate('/');
  };

  const goToLandingHash = (e, hash) => {
    e.preventDefault();
    const h = hash.startsWith('#') ? hash : `#${hash}`;
    if (location?.pathname !== '/') {
      navigate('/');
      requestAnimationFrame(() => { window.location.hash = h; });
      return;
    }
    window.location.hash = h;
  };

  const HeaderTag = disableDesktopEffects ? 'header' : motion.header;
  const MotionA = disableDesktopEffects ? 'a' : motion.a;

  return (
    <HeaderTag
      className={`${disableDesktopEffects ? 'relative' : 'sticky top-0'} w-full z-50 transition-transform duration-300`}
      {...(disableDesktopEffects
        ? {}
        : {
            initial: { y: -100 },
            animate: { y: 0 },
            transition: { duration: 0.5 }
          })}
    >
      <div className="hidden md:block bg-[#0A0A0A] text-white border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="h-10 grid grid-cols-3 items-center text-[12px] font-medium">
            <div className="hidden md:flex items-center gap-6">
              <a className="text-gray-400 hover:text-white transition-colors" href="/support" onClick={(e) => { e.preventDefault(); navigate('/support'); }}>Destek</a>
              <a className="text-gray-400 hover:text-white transition-colors" href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>İletişim</a>
              <a className="text-gray-400 hover:text-white transition-colors" href="/links" onClick={(e) => { e.preventDefault(); navigate('/links'); }}>Kaynaklar</a>
              <a className="text-blue-400 hover:text-blue-300 font-bold transition-colors" href="/download" onClick={(e) => { e.preventDefault(); navigate('/download'); }}>İndirme</a>
            </div>

            <div className="flex justify-center">
              {/* WhatsApp Removed */}
            </div>

            <div className="flex items-center justify-end gap-5">
              <div className="flex items-center gap-3">
                <a className="hover:opacity-80 transition-opacity" href={instagramHref} target="_blank" rel="noreferrer"><Instagram size={14} style={{ color: '#E1306C' }} /></a>
                <a className="hover:opacity-80 transition-opacity" href={linkedInHref} target="_blank" rel="noreferrer"><Linkedin size={14} style={{ color: '#0A66C2' }} /></a>
              </div>
              <a className="flex items-center gap-2 text-gray-400 hover:text-white truncate max-w-[200px]" href={gmailHref} target="_blank" rel="noreferrer">
                <Mail size={14} />
                <span className="truncate">{supportEmail}</span>
              </a>
              {isLoggedIn ? (
                <button className="text-red-500 hover:text-red-400 font-bold uppercase tracking-tighter" onClick={logout}>ÇIKIŞ</button>
              ) : (
                <button className="text-gray-400 hover:text-white font-bold" onClick={() => navigate('/auth')}>Giriş</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <MotionA
              href="/"
              className="flex items-center"
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
              {...(disableDesktopEffects ? {} : { whileHover: { scale: 1.02 } })}
            >
              <BrandLogo withText textClassName="text-white text-2xl font-bold" />
            </MotionA>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" onClick={(e) => goToLandingHash(e, '#features')} className="text-white/80 hover:text-white transition-colors font-semibold text-sm">
                Özellikler
              </a>
              <a href="#pricing" onClick={(e) => goToLandingHash(e, '#pricing')} className="text-white/80 hover:text-white transition-colors font-semibold text-sm">
                Fiyatlandırma
              </a>
              <a href="/links" onClick={(e) => { e.preventDefault(); navigate('/links'); }} className="text-white/80 hover:text-white transition-colors font-semibold text-sm">
                Kaynaklar
              </a>
              <a href="/download" onClick={(e) => { e.preventDefault(); navigate('/download'); }} className="text-white/80 hover:text-white transition-colors font-semibold text-sm">
                İndirme
              </a>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <button 
                type="button" 
                onClick={() => navigate(panelHref)} 
                className="px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
              >
                Mağaza Paneli
              </button>
              <button 
                type="button" 
                onClick={() => navigate(siteBuilderHref)} 
                className="px-6 py-2.5 rounded-lg bg-[#E31E24] text-white font-bold text-sm hover:bg-[#B3151A] transition-all shadow-lg shadow-red-900/20"
              >
                Site Oluştur
              </button>
            </div>

            <button
              className="md:hidden p-2 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden bg-[#0A0A0A]/98 backdrop-blur-2xl p-8 flex flex-col"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Background Decor */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#E31E24]/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between mb-12 relative z-10">
              <BrandLogo withText textClassName="text-white text-2xl font-bold" />
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white border border-white/10"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col gap-8 relative z-10">
              {[
                { label: 'ÖZELLİKLER', onClick: (e) => goToLandingHash(e, '#features') },
                { label: 'FİYATLANDIRMA', onClick: (e) => goToLandingHash(e, '#pricing') },
                { label: 'KAYNAKLAR', onClick: () => navigate('/links') },
                { label: 'İNDİRME', onClick: () => navigate('/download') },
                { label: 'DESTEK MERKEZİ', onClick: () => navigate('/support') }
              ].map((link, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={(e) => { setIsMobileMenuOpen(false); link.onClick(e); }}
                  className="text-left text-2xl font-black italic tracking-tighter text-white/90 hover:text-[#E31E24] transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
            </div>

            <div className="mt-12 flex items-center gap-6 relative z-10">
              <a href={instagramHref} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href={linkedInHref} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors"><Linkedin size={20} /></a>
            </div>

            <div className="mt-auto space-y-4 relative z-10">
              <button 
                onClick={() => { setIsMobileMenuOpen(false); navigate(panelHref); }} 
                className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-widest text-[11px] text-white"
              >
                MAĞAZA PANELİ
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); navigate(siteBuilderHref); }} 
                className="w-full py-5 rounded-2xl bg-[#E31E24] font-black uppercase tracking-widest text-[11px] text-white shadow-xl shadow-red-900/30"
              >
                YENİ SİTE OLUŞTUR
              </button>
              {isLoggedIn && (
                <button 
                  onClick={(e) => { setIsMobileMenuOpen(false); logout(e); }} 
                  className="w-full py-4 font-black uppercase tracking-widest text-[10px] text-gray-500"
                >
                  OTURUMU KAPAT
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </HeaderTag>
  );
};

export default Header;
