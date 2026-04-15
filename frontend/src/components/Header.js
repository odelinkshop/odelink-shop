import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Instagram, Linkedin, Mail, Menu, X } from 'lucide-react';
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
    const normalized = (typeof v === 'string' ? v : '').trim().toLowerCase();
    return normalized || 'muratbyrm3752@gmail.com';
  }, []);

  const supportEmail = useMemo(() => {
    const v = process.env.REACT_APP_SUPPORT_EMAIL;
    return typeof v === 'string' && v.trim().length > 0 ? v.trim() : 'odelinkdestek@gmail.com';
  }, []);
  const { isLoggedIn } = useAuthSession();

  const gmailHref = useMemo(() => {
    const to = encodeURIComponent(supportEmail);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}`;
  }, [supportEmail]);

  const linkedInHref = 'https://www.linkedin.com/in/murat-bayram-4a23083b5';
  const instagramHref = 'https://www.instagram.com/odelink.tr/';
  const whatsappPhoneLabel = '+63 (975) 198-2712';
  const whatsappHref = 'https://wa.me/639751982712';

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

  let siteBuilderHref = '/auth';
  let panelHref = '/auth';
  let showAdminUi = false;
  try {
    siteBuilderHref = isLoggedIn ? '/site-builder' : '/auth';
    panelHref = isLoggedIn ? '/panel' : '/auth';
    showAdminUi = isAdminUiEnabled(allowedAdminEmail);
  } catch (e) {
    void e;
  }

  const logout = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    await logoutAuthSession();
    navigate('/');
  };

  const goToLandingHash = (e, hash) => {
    e.preventDefault();
    const h = (hash || '').toString().startsWith('#') ? hash.toString() : `#${hash || ''}`;
    if (location?.pathname !== '/') {
      navigate('/');
      requestAnimationFrame(() => {
        window.location.hash = h;
      });
      return;
    }
    window.location.hash = h;
  };

  const HeaderTag = disableDesktopEffects ? 'header' : motion.header;
  const MotionA = disableDesktopEffects ? 'a' : motion.a;

  return (
    <HeaderTag
      className={`${disableDesktopEffects ? 'relative' : 'sticky top-0'} w-full z-50 ${disableDesktopEffects || isMobileMenuOpen ? '' : 'header-perf'} transition-transform duration-300`}
      {...(disableDesktopEffects
        ? {}
        : {
            initial: { y: -100 },
            animate: { y: 0 },
            transition: { duration: 0.5 }
          })}
    >
      <div className="hidden md:block bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="h-10 grid grid-cols-3 items-center text-sm">
            <div className="hidden md:flex items-center gap-6">
              <a className="text-white/80 hover:text-white transition-colors" href="/support" onClick={(e) => { e.preventDefault(); navigate('/support'); }}>Destek</a>
              <a className="text-white/80 hover:text-white transition-colors" href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>İletişim</a>
              <a className="text-white/80 hover:text-white transition-colors" href="/links" onClick={(e) => { e.preventDefault(); navigate('/links'); }}>Kaynaklar</a>
            </div>

            <div className="flex justify-center">
              <a
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-semibold"
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
              >
                {whatsappPhoneLabel}
              </a>
            </div>

            <div className="flex items-center justify-end gap-4 min-w-0">
              <div className="hidden md:flex items-center gap-2">
                <a
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 transition-colors duration-200 flex items-center justify-center"
                  href={instagramHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 transition-colors duration-200 flex items-center justify-center"
                  href={linkedInHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
              <a className="hidden md:flex items-center gap-2 text-white/80 hover:text-white transition-colors min-w-0" href={gmailHref} target="_blank" rel="noreferrer">
                <Mail className="w-4 h-4" />
                <span className="min-w-0 truncate max-w-[240px]">{supportEmail}</span>
              </a>
              {isLoggedIn ? (
                <a className="text-white/80 hover:text-white transition-colors" href="/" onClick={logout}>Çıkış</a>
              ) : (
                <a className="text-white/80 hover:text-white transition-colors" href="/auth" onClick={(e) => { e.preventDefault(); navigate('/auth'); }}>Giriş</a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`bg-gray-900/95 ${disableDesktopEffects ? '' : 'backdrop-blur-md'} ${disableDesktopEffects ? '' : 'shadow-lg'} border-b border-white/10`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <MotionA
              href="/"
              className="flex items-center space-x-2"
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
              {...(disableDesktopEffects ? {} : { whileHover: { scale: 1.02 }, transition: { duration: 0.2 } })}
            >
              <BrandLogo withText textClassName="text-white" />
            </MotionA>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" onClick={(e) => goToLandingHash(e, '#features')} className="text-white/80 hover:text-white transition-colors duration-200 font-medium">
                Özellikler
              </a>
              <a href="#pricing" onClick={(e) => goToLandingHash(e, '#pricing')} className="text-white/80 hover:text-white transition-colors duration-200 font-medium">
                Fiyatlandırma
              </a>
              <a href="/links" onClick={(e) => { e.preventDefault(); navigate('/links'); }} className="text-white/80 hover:text-white transition-colors duration-200 font-medium">
                Kaynaklar
              </a>
              {showAdminUi ? (
                <a href="/admin" onClick={(e) => { e.preventDefault(); navigate('/admin'); }} className="text-white/80 hover:text-white transition-colors duration-200 font-medium">
                  Admin
                </a>
              ) : null}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <button type="button" onClick={() => navigate(panelHref)} className="btn-secondary">Mağaza Paneli</button>
              <button type="button" onClick={() => navigate(siteBuilderHref)} className="btn-primary">Site Oluştur</button>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                aria-label={isMobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/55" onClick={() => setIsMobileMenuOpen(false)} />

            <motion.div
              className="absolute right-0 top-0 h-full w-[340px] max-w-[88vw] bg-gray-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl p-4 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center justify-between gap-3">
                <a
                  href="/"
                  className="flex items-center space-x-2"
                  onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); navigate('/'); }}
                >
                  <BrandLogo withText textClassName="text-white" />
                </a>
                <button
                  type="button"
                  className="p-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Menüyü kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-center gap-3">
                  <a
                    className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white inline-flex items-center justify-center"
                    href={instagramHref}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white inline-flex items-center justify-center"
                    href={linkedInHref}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a className="inline-flex items-center justify-center gap-2 text-xs text-white/80 hover:text-white text-center w-full" href={gmailHref} target="_blank" rel="noreferrer">
                    <Mail className="w-4 h-4" />
                    <span className="text-[11px] leading-snug break-all whitespace-normal">{supportEmail}</span>
                  </a>
                </div>
              </div>

              <div className="mt-5 flex-1 overflow-auto">
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={(e) => { setIsMobileMenuOpen(false); goToLandingHash(e, '#features'); }} className="text-left w-full px-3 py-3 rounded-xl text-white/90 hover:bg-white/10 font-semibold">
                    Özellikler
                  </button>
                  <button type="button" onClick={(e) => { setIsMobileMenuOpen(false); goToLandingHash(e, '#pricing'); }} className="text-left w-full px-3 py-3 rounded-xl text-white/90 hover:bg-white/10 font-semibold">
                    Fiyatlandırma
                  </button>
                  <button type="button" onClick={() => { setIsMobileMenuOpen(false); navigate('/links'); }} className="text-left w-full px-3 py-3 rounded-xl text-white/90 hover:bg-white/10 font-semibold">
                    Kaynaklar
                  </button>
                  {showAdminUi ? (
                    <button type="button" onClick={() => { setIsMobileMenuOpen(false); navigate('/admin'); }} className="text-left w-full px-3 py-3 rounded-xl text-white/90 hover:bg-white/10 font-semibold">
                      Admin Panel
                    </button>
                  ) : null}
                  <button type="button" onClick={() => { setIsMobileMenuOpen(false); navigate('/support'); }} className="text-left w-full px-3 py-3 rounded-xl text-white/90 hover:bg-white/10 font-semibold">
                    Destek
                  </button>
                  <button type="button" onClick={() => { setIsMobileMenuOpen(false); navigate('/contact'); }} className="text-left w-full px-3 py-3 rounded-xl text-white/90 hover:bg-white/10 font-semibold">
                    İletişim
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
                <button type="button" onClick={() => { setIsMobileMenuOpen(false); navigate(panelHref); }} className="btn-secondary w-full justify-center">Mağaza Paneli</button>
                <button type="button" onClick={() => { setIsMobileMenuOpen(false); navigate(siteBuilderHref); }} className="btn-primary w-full justify-center">Site Oluştur</button>
                {isLoggedIn ? (
                  <button type="button" onClick={(e) => { setIsMobileMenuOpen(false); logout(e); }} className="btn-secondary w-full justify-center">Çıkış</button>
                ) : (
                  <button type="button" onClick={() => { setIsMobileMenuOpen(false); navigate('/auth'); }} className="btn-secondary w-full justify-center">Giriş</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </HeaderTag>
  );
};

export default Header;
