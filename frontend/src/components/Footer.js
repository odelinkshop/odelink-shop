import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, Instagram, Linkedin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthSession from '../hooks/useAuthSession';
import BrandLogo from './BrandLogo';

const Footer = () => {
  const disableDesktopMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(min-width: 768px) and (pointer: fine)').matches;

  const MotionDiv = disableDesktopMotion ? 'div' : motion.div;

  const navigate = useNavigate();
  const { isLoggedIn } = useAuthSession();
  const supportEmail = useMemo(() => {
    const v = process.env.REACT_APP_SUPPORT_EMAIL;
    return typeof v === 'string' && v.trim().length > 0 ? v.trim() : 'odelinkdestek@gmail.com';
  }, []);

  const goHomeHash = (hash) => {
    navigate('/');
    try {
      setTimeout(() => {
        try {
          window.location.hash = hash;
        } catch (e) {
          void e;
        }
      }, 0);
    } catch (e) {
      void e;
    }
  };

  const gmailHref = useMemo(() => {
    const to = encodeURIComponent(supportEmail);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}`;
  }, [supportEmail]);

  const linkedInHref = 'https://www.linkedin.com/in/murat-bayram-4a23083b5';
  const instagramHref = 'https://www.instagram.com/odelink.tr/';
  const whatsappPhoneLabel = '+63 (975) 198-2712';
  const whatsappHref = 'https://wa.me/639751982712';

  let siteBuilderHref = '/auth';
  try {
    siteBuilderHref = isLoggedIn ? '/site-builder' : '/auth';
  } catch (e) {
    void e;
  }

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white pt-16 pb-8 cv-auto border-t border-white/10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top Section - Logo & Description */}
        <MotionDiv
          className="text-center mb-12"
          {...(disableDesktopMotion
            ? {}
            : {
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { duration: 0.5 }
              })}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BrandLogo withText textClassName="text-white text-2xl" />
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
            Shopier mağazanıza vitrin sayfası oluşturmanıza yardımcı olan bir yazılım aracıdır.
            Shopier, Ödelink tarafından işletilmeyen bağımsız bir üçüncü taraf platformdur.
          </p>
        </MotionDiv>

        {/* Main Grid - 3 Columns on Desktop, Stack on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          {/* Column 1: Quick Links */}
          <MotionDiv
            {...(disableDesktopMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5, delay: 0.1 }
                })}
          >
            <h4 className="text-xl font-bold mb-6 text-white border-b border-white/20 pb-3">Hızlı Linkler</h4>
            <ul className="space-y-3">
              <li>
                <button type="button" onClick={() => goHomeHash('#features')} className="text-gray-300 hover:text-white transition-colors duration-200 text-base font-medium hover:translate-x-1 inline-block">
                  → Özellikler
                </button>
              </li>
              <li>
                <button type="button" onClick={() => goHomeHash('#pricing')} className="text-gray-300 hover:text-white transition-colors duration-200 text-base font-medium hover:translate-x-1 inline-block">
                  → Fiyatlandırma
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate(siteBuilderHref)} className="text-gray-300 hover:text-white transition-colors duration-200 text-base font-medium hover:translate-x-1 inline-block">
                  → Site Oluştur
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/support')} className="text-gray-300 hover:text-white transition-colors duration-200 text-base font-medium hover:translate-x-1 inline-block">
                  → Destek
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/contact')} className="text-gray-300 hover:text-white transition-colors duration-200 text-base font-medium hover:translate-x-1 inline-block">
                  → İletişim
                </button>
              </li>
            </ul>
          </MotionDiv>

          {/* Column 2: Resources & Legal */}
          <MotionDiv
            {...(disableDesktopMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5, delay: 0.2 }
                })}
          >
            <h4 className="text-xl font-bold mb-6 text-white border-b border-white/20 pb-3">Kaynaklar</h4>
            <ul className="space-y-3 mb-8">
              <li>
                <button type="button" onClick={() => navigate('/blog')} className="text-gray-300 hover:text-white transition-colors duration-200 text-base font-medium hover:translate-x-1 inline-block">
                  → Blog
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/faq')} className="text-gray-300 hover:text-white transition-colors duration-200 text-base font-medium hover:translate-x-1 inline-block">
                  → SSS
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/guide')} className="text-gray-300 hover:text-white transition-colors duration-200 text-base font-medium hover:translate-x-1 inline-block">
                  → Kullanım Kılavuzu
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/reviews')} className="text-gray-300 hover:text-white transition-colors duration-200 text-base font-medium hover:translate-x-1 inline-block">
                  → Müşteri Yorumları
                </button>
              </li>
            </ul>

            <h4 className="text-xl font-bold mb-6 text-white border-b border-white/20 pb-3">Yasal</h4>
            <ul className="space-y-3">
              <li>
                <button type="button" onClick={() => navigate('/terms')} className="text-gray-300 hover:text-white transition-colors duration-200 text-base font-medium hover:translate-x-1 inline-block">
                  → Kullanım Şartları
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/privacy')} className="text-gray-300 hover:text-white transition-colors duration-200 text-base font-medium hover:translate-x-1 inline-block">
                  → Gizlilik Politikası
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/kvkk')} className="text-gray-300 hover:text-white transition-colors duration-200 text-base font-medium hover:translate-x-1 inline-block">
                  → KVKK
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/cookies')} className="text-gray-300 hover:text-white transition-colors duration-200 text-base font-medium hover:translate-x-1 inline-block">
                  → Çerez Politikası
                </button>
              </li>
            </ul>
          </MotionDiv>

          {/* Column 3: Contact */}
          <MotionDiv
            {...(disableDesktopMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5, delay: 0.3 }
                })}
          >
            <h4 className="text-xl font-bold mb-6 text-white border-b border-white/20 pb-3">İletişim</h4>
            <div className="space-y-4 mb-8">
              <a 
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group" 
                href={gmailHref} 
                target="_blank" 
                rel="noreferrer"
              >
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-base font-medium break-all">{supportEmail}</span>
              </a>
              
              <a 
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group" 
                href={whatsappHref} 
                target="_blank" 
                rel="noreferrer"
              >
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-base font-medium">{whatsappPhoneLabel}</span>
              </a>
            </div>

            <h4 className="text-xl font-bold mb-6 text-white border-b border-white/20 pb-3">Sosyal Medya</h4>
            <div className="flex items-center gap-4">
              <a
                className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:scale-110"
                href={instagramHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:scale-110"
                href={linkedInHref}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </MotionDiv>
        </div>

        {/* Bottom Section - Copyright */}
        <MotionDiv
          className="border-t border-white/10 pt-8 text-center"
          {...(disableDesktopMotion
            ? {}
            : {
                initial: { opacity: 0 },
                whileInView: { opacity: 1 },
                viewport: { once: true },
                transition: { duration: 0.5, delay: 0.4 }
              })}
        >
          <p className="text-gray-400 text-base">
            © 2024 Ödelink. Tüm hakları saklıdır.
          </p>
        </MotionDiv>
      </div>
    </footer>
  );
};

export default Footer;
