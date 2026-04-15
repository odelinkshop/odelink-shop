import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import useAuthSession from '../hooks/useAuthSession';
import useFooterLinks from '../hooks/useFooterLinks';
import FooterSection from './FooterSection';
import FooterContact from './FooterContact';
import BrandLogo from './BrandLogo';
import AdBanner from './AdBanner';

const Footer = () => {
  const { isLoggedIn } = useAuthSession();
  const { quickLinks, resourceLinks, legalLinks, handleNavigation } = useFooterLinks();

  const disableDesktopMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(min-width: 768px) and (pointer: fine)').matches;
  }, []);

  const MotionDiv = disableDesktopMotion ? 'div' : motion.div;

  const supportEmail = useMemo(() => {
    const v = process.env.REACT_APP_SUPPORT_EMAIL;
    return typeof v === 'string' && v.trim().length > 0 ? v.trim() : 'odelinkdestek@gmail.com';
  }, []);

  const whatsappPhone = '+639751982712';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const handleQuickLinkClick = (link) => {
    if (link.action === 'hash') {
      handleNavigation('hash', link.value);
    } else if (link.action === 'navigate') {
      handleNavigation('navigate', link.value);
    }
  };

  const handleResourceLinkClick = (link) => {
    handleNavigation('navigate', link.path);
  };

  const handleLegalLinkClick = (link) => {
    handleNavigation('navigate', link.path);
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white pt-20 pb-8 cv-auto border-t border-white/10 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header Section */}
        <MotionDiv
          className="text-center mb-16"
          {...(disableDesktopMotion
            ? {}
            : {
                variants: itemVariants,
                initial: 'hidden',
                whileInView: 'visible',
                viewport: { once: true },
              })}
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <BrandLogo withText textClassName="text-white text-2xl md:text-3xl" />
          </div>
          <p className="text-gray-400 max-w-3xl mx-auto text-base md:text-lg leading-relaxed font-medium">
            Shopier mağazanıza vitrin sayfası oluşturmanıza yardımcı olan bir yazılım aracıdır.
            Shopier, Ödelink tarafından işletilmeyen bağımsız bir üçüncü taraf platformdur.
          </p>
        </MotionDiv>

        {/* Main Grid - Mobile Optimized */}
        <MotionDiv
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 lg:gap-12 mb-12 sm:mb-16"
          {...(disableDesktopMotion
            ? {}
            : {
                variants: containerVariants,
                initial: 'hidden',
                whileInView: 'visible',
                viewport: { once: true },
              })}
        >
          {/* Quick Links */}
          <FooterSection
            title="Hızlı Linkler"
            links={quickLinks}
            onLinkClick={handleQuickLinkClick}
            disableMotion={disableDesktopMotion}
            delay={0}
          />

          {/* Resources */}
          <FooterSection
            title="Kaynaklar"
            links={resourceLinks}
            onLinkClick={handleResourceLinkClick}
            disableMotion={disableDesktopMotion}
            delay={0.1}
          />

          {/* Legal */}
          <FooterSection
            title="Yasal"
            links={legalLinks}
            onLinkClick={handleLegalLinkClick}
            disableMotion={disableDesktopMotion}
            delay={0.2}
          />

          {/* Contact */}
          <MotionDiv
            {...(disableDesktopMotion
              ? {}
              : {
                  variants: itemVariants,
                  initial: 'hidden',
                  whileInView: 'visible',
                  viewport: { once: true },
                  transition: { duration: 0.5, delay: 0.3 },
                })}
          >
            <h3 className="text-lg md:text-xl font-bold text-white mb-6 pb-3 border-b-2 border-gradient-to-r from-white/30 via-white/20 to-transparent">
              İletişim
            </h3>
            <FooterContact
              email={supportEmail}
              phone={whatsappPhone}
              disableMotion={disableDesktopMotion}
            />
          </MotionDiv>
        </MotionDiv>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

        {/* Footer Bottom */}
        <MotionDiv
          className="text-center"
          {...(disableDesktopMotion
            ? {}
            : {
                variants: itemVariants,
                initial: 'hidden',
                whileInView: 'visible',
                viewport: { once: true },
                transition: { duration: 0.5, delay: 0.4 },
              })}
        >
          <p className="text-gray-400 text-base font-medium">
            © 2024 Ödelink. Tüm hakları saklıdır.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Türkiye'nin En İyi Şirketsiz SaaS Platformu
          </p>
        </MotionDiv>
      </div>
    </footer>
  );
};

export default Footer;
