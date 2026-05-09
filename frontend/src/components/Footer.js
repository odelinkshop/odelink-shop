import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import useAuthSession from '../hooks/useAuthSession';
import useFooterLinks from '../hooks/useFooterLinks';
import FooterSection from './FooterSection';
import FooterContact from './FooterContact';
import BrandLogo from './BrandLogo';

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
    <footer className="relative bg-[#0A0A0A] text-white pt-20 pb-10 border-t border-white/10 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
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
          <div className="flex items-center justify-center mb-6">
            <BrandLogo withText textClassName="text-white text-2xl md:text-3xl font-bold tracking-tight" />
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto text-base leading-relaxed">
            Shopier mağazanıza profesyonel bir vitrin kazandıran bağımsız bir teknoloji platformudur.
          </p>
        </MotionDiv>

        {/* Main Grid */}
        <MotionDiv
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16"
          {...(disableDesktopMotion
            ? {}
            : {
                variants: containerVariants,
                initial: 'hidden',
                whileInView: 'visible',
                viewport: { once: true },
              })}
        >
          <FooterSection
            title="Hızlı Linkler"
            links={quickLinks}
            onLinkClick={handleQuickLinkClick}
            disableMotion={disableDesktopMotion}
            delay={0}
          />

          <FooterSection
            title="Kaynaklar"
            links={resourceLinks}
            onLinkClick={handleResourceLinkClick}
            disableMotion={disableDesktopMotion}
            delay={0.1}
          />

          <FooterSection
            title="Yasal"
            links={legalLinks}
            onLinkClick={handleLegalLinkClick}
            disableMotion={disableDesktopMotion}
            delay={0.2}
          />

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
            <FooterSection
              title="İletişim"
              isContactSection={true}
              disableMotion={disableDesktopMotion}
              delay={0.3}
            >
              <FooterContact
                email={supportEmail}
                disableMotion={disableDesktopMotion}
              />
            </FooterSection>
          </MotionDiv>
        </MotionDiv>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-8"></div>

        {/* Footer Bottom */}
        <MotionDiv
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm"
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
          <p>© 2024 Ödelink. Tüm hakları saklıdır.</p>
          <p className="font-medium">Türkiye'nin En İyi Şirketsiz SaaS Platformu</p>
        </MotionDiv>
      </div>
    </footer>
  );
};

export default Footer;
