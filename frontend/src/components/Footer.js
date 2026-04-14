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
    <footer className="bg-gray-900 text-white pt-10 pb-6 sm:py-12 cv-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          <MotionDiv
            {...(disableDesktopMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5 }
                })}
          >
            <div className="flex items-center space-x-2 mb-4">
              <BrandLogo withText textClassName="text-white" />
            </div>
            <p className="text-gray-300 leading-relaxed">
              Shopier mağazanıza vitrin sayfası oluşturmanıza yardımcı olan bir yazılım aracıdır.
              Shopier, Ödelink tarafından işletilmeyen bağımsız bir üçüncü taraf platformdur.
            </p>
          </MotionDiv>

          <MotionDiv
            {...(disableDesktopMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5, delay: 0.1 }
                })}
          >
            <h4 className="text-lg font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={() => goHomeHash('#features')} className="text-gray-300 hover:text-white transition-colors duration-200">
                  Özellikler
                </button>
              </li>
              <li>
                <button type="button" onClick={() => goHomeHash('#pricing')} className="text-gray-300 hover:text-white transition-colors duration-200">
                  Fiyatlandırma
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate(siteBuilderHref)} className="text-gray-300 hover:text-white transition-colors duration-200">
                  Site Oluştur
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/support')} className="text-gray-300 hover:text-white transition-colors duration-200">
                  Destek
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/links')} className="text-gray-300 hover:text-white transition-colors duration-200">
                  Tüm Linkler
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/contact')} className="text-gray-300 hover:text-white transition-colors duration-200">
                  İletişim
                </button>
              </li>
            </ul>
          </MotionDiv>

          <MotionDiv
            {...(disableDesktopMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5, delay: 0.2 }
                })}
          >
            <h4 className="text-lg font-semibold mb-4">Kaynaklar</h4>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={() => navigate('/blog')} className="text-gray-300 hover:text-white transition-colors duration-200">
                  Blog
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/faq')} className="text-gray-300 hover:text-white transition-colors duration-200">
                  SSS
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/guide')} className="text-gray-300 hover:text-white transition-colors duration-200">
                  Kullanım Kılavuzu
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/reviews')} className="text-gray-300 hover:text-white transition-colors duration-200">
                  Müşteri Yorumları
                </button>
              </li>
            </ul>
          </MotionDiv>

          <MotionDiv
            {...(disableDesktopMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5, delay: 0.3 }
                })}
          >
            <h4 className="text-lg font-semibold mb-4">Yasal</h4>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={() => navigate('/terms')} className="text-gray-300 hover:text-white transition-colors duration-200">
                  Kullanım Şartları
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/privacy')} className="text-gray-300 hover:text-white transition-colors duration-200">
                  Gizlilik Politikası
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/kvkk')} className="text-gray-300 hover:text-white transition-colors duration-200">
                  KVKK
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/cookies')} className="text-gray-300 hover:text-white transition-colors duration-200">
                  Çerez Politikası
                </button>
              </li>
            </ul>
          </MotionDiv>

          <MotionDiv
            {...(disableDesktopMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5, delay: 0.3 }
                })}
          >
            <h4 className="text-lg font-semibold mb-4">İletişim</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-200" />
                <a className="text-gray-300 hover:text-white transition-colors" href={gmailHref} target="_blank" rel="noreferrer">{supportEmail}</a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-200" />
                <button type="button" className="text-gray-300 hover:text-white transition-colors" onClick={() => navigate('/contact')}>
                  İletişim sayfasına git
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <a
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
                href={instagramHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
                href={linkedInHref}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                className="text-gray-300 hover:text-white transition-colors font-semibold"
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
          className="border-t border-gray-800 pt-6 sm:pt-8 text-center"
          {...(disableDesktopMotion
            ? {}
            : {
                initial: { opacity: 0 },
                whileInView: { opacity: 1 },
                viewport: { once: true },
                transition: { duration: 0.5, delay: 0.4 }
              })}
        >
          <p className="text-gray-400">
            © 2024 Ödelink. Tüm hakları saklıdır.
          </p>
        </MotionDiv>
      </div>
    </footer>
  );
};

export default Footer;
