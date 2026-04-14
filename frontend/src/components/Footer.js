import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, Instagram, Linkedin } from 'lucide-react';
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
    <footer className="bg-gray-900 text-white pt-8 pb-6 sm:py-12 cv-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <MotionDiv
            className="sm:col-span-2 md:col-span-1"
            {...(disableDesktopMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5 }
                })}
          >
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <BrandLogo withText textClassName="text-white" />
            </div>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              Shopier mağazanıza vitrin sayfası oluşturmanıza yardımcı olan bir yazılım aracıdır.
              Shopier, Ödelink tarafından işletilmeyen bağımsız bir üçüncü taraf platformdur.
            </p>
          </MotionDiv>

          <MotionDiv
            className="sm:col-span-1 md:col-span-1"
            {...(disableDesktopMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5, delay: 0.1 }
                })}
          >
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Hızlı Linkler</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <button type="button" onClick={() => goHomeHash('#features')} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Özellikler
                </button>
              </li>
              <li>
                <button type="button" onClick={() => goHomeHash('#pricing')} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Fiyatlandırma
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate(siteBuilderHref)} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Site Oluştur
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/support')} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Destek
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/links')} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Tüm Linkler
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/contact')} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  İletişim
                </button>
              </li>
            </ul>
          </MotionDiv>

          <MotionDiv
            className="sm:col-span-1 md:col-span-1"
            {...(disableDesktopMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5, delay: 0.2 }
                })}
          >
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Kaynaklar</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <button type="button" onClick={() => navigate('/blog')} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Blog
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/faq')} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  SSS
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/guide')} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Kullanım Kılavuzu
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/reviews')} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Müşteri Yorumları
                </button>
              </li>
            </ul>
          </MotionDiv>

          <MotionDiv
            className="sm:col-span-1 md:col-span-1"
            {...(disableDesktopMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5, delay: 0.3 }
                })}
          >
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Yasal</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <button type="button" onClick={() => navigate('/terms')} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Kullanım Şartları
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/privacy')} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Gizlilik Politikası
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/kvkk')} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  KVKK
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/cookies')} className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                  Çerez Politikası
                </button>
              </li>
            </ul>
          </MotionDiv>

          <MotionDiv
            className="sm:col-span-2 md:col-span-1"
            {...(disableDesktopMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5, delay: 0.3 }
                })}
          >
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">İletişim</h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-200 flex-shrink-0" />
                <a className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base break-all" href={gmailHref} target="_blank" rel="noreferrer">{supportEmail}</a>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-200 flex-shrink-0" />
                <button type="button" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base text-left" onClick={() => navigate('/contact')}>
                  İletişim sayfasına git
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
              <a
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
                href={instagramHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
                href={linkedInHref}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                className="text-gray-300 hover:text-white transition-colors font-semibold text-sm sm:text-base"
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
              >
                {whatsappPhoneLabel}
              </a>
            </div>
          </MotionDiv>
        </div>

        <MotionDiv
          className="border-t border-gray-800 pt-4 sm:pt-6 md:pt-8 text-center"
          {...(disableDesktopMotion
            ? {}
            : {
                initial: { opacity: 0 },
                whileInView: { opacity: 1 },
                viewport: { once: true },
                transition: { duration: 0.5, delay: 0.4 }
              })}
        >
          <p className="text-gray-400 text-sm sm:text-base">
            © 2024 Ödelink. Tüm hakları saklıdır.
          </p>
        </MotionDiv>
      </div>
    </footer>
  );
};

export default Footer;
