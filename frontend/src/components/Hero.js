import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Globe, Link2, Shield, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthSession from '../hooks/useAuthSession';
import BrandLogo from './BrandLogo';
import FeatureCard from './FeatureCard';
import useFeatures from '../hooks/useFeatures';

/**
 * Hero section component with advanced animations and responsive design
 * Features: Framer Motion animations, custom hooks, reusable components
 * @returns {React.ReactElement}
 */
const Hero = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthSession();
  const [pwaPrompt, setPwaPrompt] = useState(null);
  const [pwaInstalling, setPwaInstalling] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  const features = useFeatures();
  const disableDesktopMotion = false;

  const siteBuilderHref = useMemo(() => {
    try {
      return isLoggedIn ? '/site-builder' : '/auth';
    } catch (e) {
      return '/auth';
    }
  }, [isLoggedIn]);

  // Handle PWA install prompt
  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      try {
        e.preventDefault();
        setPwaPrompt(e);
      } catch (err) {
        void err;
      }
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    };
  }, []);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!pwaPrompt) {
      // PWA prompt yok - kullanıcıya manuel kurulum talimatı göster
      alert('Uygulamayı yüklemek için:\n\n1. Chrome menüsünü aç (⋮)\n2. "Ana ekrana ekle" seçeneğine tıkla\n3. Onaylayın ve uygulamayı kullanmaya başlayın!');
      return;
    }

    setPwaInstalling(true);
    try {
      await pwaPrompt.prompt();
      try {
        await pwaPrompt.userChoice;
      } catch (e) {
        void e;
      }
    } catch (e) {
      void e;
    } finally {
      setPwaInstalling(false);
      setPwaPrompt(null);
    }
  }, [pwaPrompt]);

  const handleNavigate = useCallback(() => {
    navigate(siteBuilderHref);
  }, [navigate, siteBuilderHref]);

  // Animation variants
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
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'backOut' },
    },
  };

  return (
    <section className="pt-16 sm:pt-20 md:pt-32 lg:pt-40 pb-16 sm:pb-20 md:pb-24 px-4 relative overflow-hidden bg-gray-900 text-white">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{
          backgroundImage: disableDesktopMotion
            ? 'none'
            : 'radial-gradient(1100px circle at 18% 22%, rgba(239,68,68,0.35), transparent 55%), radial-gradient(1100px circle at 85% 10%, rgba(255,255,255,0.10), transparent 60%), linear-gradient(to bottom, rgba(17,24,39,1), rgba(3,7,18,1))',
          backgroundColor: disableDesktopMotion ? 'rgb(17,24,39)' : undefined,
          contain: 'paint',
          transform: disableDesktopMotion ? undefined : 'translateZ(0)',
        }}
      />

      <div className="container mx-auto relative z-10">
        {/* Hero Header - EN ÜSTTE ORTADA */}
        <motion.div
          className="max-w-4xl mx-auto text-center mb-8 sm:mb-10 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-sm md:text-base font-semibold tracking-wide text-white/70 mb-3">
            Türkiye'nin En İyi Şirketsiz SaaS Platformu
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
            Mağazan için premium vitrin sayfası.
          </h1>
          <p className="text-base md:text-lg font-medium text-white/70">
            Tek link. Temiz tasarım. Dakikalar içinde yayında.
          </p>
        </motion.div>

        {/* Promo Banner - BAŞLIĞIN ALTINDA */}
        <motion.div
          className="max-w-3xl mx-auto mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <a
            href="/plans"
            className="block bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-4 sm:p-5 shadow-xl hover:shadow-red-500/40 transition-all duration-300 hover:scale-[1.02] border border-red-400/30"
            onClick={(e) => {
              e.preventDefault();
              navigate('/plans');
            }}
          >
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-sm sm:text-base md:text-lg font-bold text-white">
                  🎉 Yıllık Pakette %30 İndirim - Sadece ₺399/yıl
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg flex-shrink-0">
                <span className="text-sm sm:text-base font-bold text-white whitespace-nowrap">Hemen Al</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
          </a>
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
          {/* Left section - Content */}
          {disableDesktopMotion ? (
            <div className="lg:col-span-5 text-center sm:text-left">
              <MobileContentStatic
                siteBuilderHref={siteBuilderHref}
                handleNavigate={handleNavigate}
                triggerInstall={triggerInstall}
                pwaInstalling={pwaInstalling}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 text-center sm:text-left"
              style={{ willChange: 'transform' }}
            >
              <DesktopContent
                siteBuilderHref={siteBuilderHref}
                handleNavigate={handleNavigate}
                triggerInstall={triggerInstall}
                pwaInstalling={pwaInstalling}
              />
            </motion.div>
          )}

          {/* Desktop steps - Hidden on mobile */}
          <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
            <DesktopSteps />
          </div>

          {/* Right section - Preview - Hidden on mobile */}
          {disableDesktopMotion ? (
            <div className="hidden lg:block lg:col-span-5">
              <PreviewStatic />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hidden lg:block lg:col-span-5 relative"
              style={{ willChange: 'transform' }}
            >
              <PreviewAnimated />
            </motion.div>
          )}
        </div>

        {/* Desktop features section - Hidden on mobile */}
        <motion.div
          className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-6 mt-16"
          initial={disableDesktopMotion ? false : { opacity: 0, y: 24 }}
          animate={disableDesktopMotion ? undefined : { opacity: 1, y: 0 }}
          transition={disableDesktopMotion ? undefined : { duration: 0.8, delay: 0.15 }}
          style={{ willChange: 'transform' }}
        >
          <DesktopFeatureCards />
        </motion.div>
      </div>
    </section>
  );
};

/**
 * Mobile content - Static version
 */
const MobileContentStatic = ({ siteBuilderHref, handleNavigate, triggerInstall, pwaInstalling }) => (
  <div className="sm:hidden">
    {/* Buttons - Professional & Mobile Optimized */}
    <div className="flex flex-col gap-3 mb-6">
      <motion.button
        type="button"
        onClick={handleNavigate}
        className="bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-base px-6 py-4 rounded-xl shadow-xl shadow-red-500/30 flex items-center justify-center gap-2 active:scale-95 transition-transform min-h-[48px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>Site Oluştur</span>
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      <motion.a
        href="#features"
        className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-semibold text-base px-6 py-4 rounded-xl flex items-center justify-center active:scale-95 transition-transform min-h-[48px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Detaylı Bilgi
      </motion.a>

      <motion.button
        type="button"
        onClick={triggerInstall}
        disabled={pwaInstalling}
        className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-semibold text-base px-6 py-4 rounded-xl flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 min-h-[48px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {pwaInstalling ? 'Hazırlanıyor…' : 'Uygulamayı Yükle'}
      </motion.button>
    </div>

    {/* PWA Info */}
    <motion.div
      className="text-center text-xs text-white/50 font-medium mb-6 px-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      Mobilde Chrome menüsünden "Ana ekrana ekle" ile kurulabilir.
    </motion.div>

    {/* Check Items - Professional & Mobile Optimized */}
    <motion.div
      className="flex flex-col gap-2 px-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      {[
        { text: 'Hızlı kurulum', delay: 0.8 },
        { text: 'Temiz tasarım', delay: 0.9 },
        { text: 'Tek link paylaşımı', delay: 1.0 },
      ].map((item, idx) => (
        <motion.div
          key={idx}
          className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 min-h-[48px]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: item.delay }}
        >
          <div className="w-5 h-5 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-red-400" />
          </div>
          <span className="text-sm font-semibold text-white">{item.text}</span>
        </motion.div>
      ))}
    </motion.div>
  </div>
);

/**
 * Desktop content - Animated version
 */
const DesktopContent = ({ siteBuilderHref, handleNavigate, triggerInstall, pwaInstalling }) => (
  <div>
    <motion.div
      className="hidden sm:inline-flex items-center gap-2 bg-white/10 border border-white/10 text-white px-4 py-2 rounded-full mb-6 sm:mb-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'backOut' }}
    >
      <span className="w-2 h-2 rounded-full bg-red-500" />
      <span className="text-xs md:text-sm font-semibold tracking-wide">
        Shopier mağazan için vitrin sitesi
      </span>
    </motion.div>

    <motion.h2
      className="hidden sm:block text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 leading-tight tracking-tight"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      Ürünlerini tek linkte topla.
      <span className="block text-white/90">Modern vitrin sayfanı yayınla.</span>
    </motion.h2>

    <motion.p
      className="hidden sm:block text-base md:text-lg text-white/75 mb-8 max-w-xl leading-relaxed font-medium"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      Shopier ürünlerini daha düzenli, daha hızlı ve daha güven veren bir vitrine dönüştür.
    </motion.p>

    <motion.div
      className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <motion.button
        type="button"
        onClick={handleNavigate}
        className="btn-primary text-base md:text-lg px-8 py-4 rounded-xl inline-flex items-center justify-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>Site Oluştur</span>
        <ArrowRight className="w-5 h-5 ml-2" />
      </motion.button>

      <motion.a
        href="#features"
        className="btn-secondary text-base md:text-lg px-8 py-4 rounded-xl inline-flex items-center justify-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Detaylı Bilgi
      </motion.a>
    </motion.div>

    <motion.div
      className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/75"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="flex items-center gap-2">
        <Check className="w-4 h-4 text-red-400" />
        <span>Hızlı kurulum</span>
      </div>
      <div className="flex items-center gap-2">
        <Check className="w-4 h-4 text-red-400" />
        <span>Temiz tasarım</span>
      </div>
      <div className="flex items-center gap-2">
        <Check className="w-4 h-4 text-red-400" />
        <span>Tek link paylaşımı</span>
      </div>
    </motion.div>
  </div>
);

/**
 * Desktop steps section
 */
const DesktopSteps = () => (
  <div className="relative w-full max-w-[220px] overflow-hidden">
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {[
        { icon: Link2, title: 'Linki ekle', desc: 'Shopier mağaza URL\'ni yapıştır.' },
        { icon: Globe, title: 'Tasarımı seç', desc: 'Tema ve renklerini ayarla.' },
        { icon: TrendingUp, title: 'Yayınla', desc: 'Linkin hazır, paylaşmaya başla.', highlight: true },
      ].map((step, idx) => (
        <motion.div
          key={idx}
          className="flex items-start gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
        >
          <div
            className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center text-white ${
              step.highlight
                ? 'bg-red-500/20 border border-red-500/30'
                : 'bg-white/10 border border-white/10'
            }`}
          >
            <step.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-white">{step.title}</div>
            <div className="text-xs text-white/70 mt-1">{step.desc}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </div>
);

/**
 * Preview section - Static
 */
const PreviewStatic = () => (
  <div className="relative">
    <div className="rounded-2xl border border-white/10 shadow-2xl bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        </div>
        <div className="text-xs font-semibold text-gray-500">Önizleme</div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-gray-900">Mağaza vitrini</div>
            <div className="text-xs text-gray-500 mt-1">shopier.com/magaza</div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-semibold">
            <Link2 className="w-3.5 h-3.5" />
            <span>Tek link</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {[
            { icon: TrendingUp, title: 'Dönüşüm odaklı', desc: 'Ürünler net, satın alma akışı hızlı.' },
            { icon: Shield, title: 'Güven hissi', desc: 'Sade tasarım, profesyonel görünüm.' },
            { icon: Globe, title: 'Mobil uyum', desc: 'Her ekranda düzgün görünür.' },
            { title: 'Yayınla', desc: 'Dakikalar içinde linkin hazır.', progress: true },
          ].map((item, idx) => (
            <div key={idx} className="rounded-xl border border-gray-200 p-4">
              {item.icon && (
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <item.icon className="w-4 h-4 text-gray-900" />
                  <span className="text-sm leading-tight break-normal">{item.title}</span>
                </div>
              )}
              {!item.icon && <div className="text-sm font-semibold text-gray-900">{item.title}</div>}
              <div className="text-xs text-gray-600 mt-2">{item.desc}</div>
              {item.progress && (
                <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full w-2/3 bg-gray-900" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Preview section - Animated
 */
const PreviewAnimated = () => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
  >
    <PreviewStatic />
  </motion.div>
);

/**
 * Desktop feature cards
 */
const DesktopFeatureCards = () => {
  const features = [
    { icon: TrendingUp, title: '0 Komisyon', desc: 'Kazancın sende kalsın' },
    { icon: Shield, title: 'Güvenli', desc: 'Sade ve anlaşılır deneyim' },
    { icon: Globe, title: 'Hızlı Kurulum', desc: 'Dakikalar içinde yayında' },
    { title: '24/7', desc: 'Hızlı ve stabil altyapı', text: true },
  ];

  return (
    <>
      {features.map((feature, idx) => (
        <motion.div
          key={idx}
          className="bg-white rounded-2xl p-7 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
          whileHover={{ y: -4 }}
        >
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
            {feature.icon ? (
              <feature.icon className="w-5 h-5 text-white" />
            ) : (
              <span className="text-white text-base font-black">{feature.title}</span>
            )}
          </div>
          <h3 className="text-lg font-black mb-1 text-gray-900">{feature.title}</h3>
          <p className="text-gray-600 font-medium">{feature.desc}</p>
        </motion.div>
      ))}
    </>
  );
};

export default Hero;
