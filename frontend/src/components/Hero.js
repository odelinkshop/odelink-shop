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
        {/* DESKTOP ONLY - Header */}
        {!isMobile && (
          <div className="max-w-5xl mx-auto text-center mb-6 sm:mb-8 md:mb-10">
            <div className="max-w-4xl mx-auto text-sm md:text-base font-semibold tracking-wide text-white/65 mb-2">
              Türkiye'nin En İyi Şirketsiz SaaS Platformu
            </div>
            <div className="text-xl sm:text-2xl md:text-4xl font-black tracking-tight text-white/95">
              Mağazan için premium vitrin sayfası.
            </div>
            <div className="mt-2 text-sm md:text-base font-semibold text-white/65">
              Tek link. Temiz tasarım. Dakikalar içinde yayında.
            </div>
          </div>
        )}

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
  <div>
    <div className="hidden sm:inline-flex flex-wrap items-center justify-center sm:justify-start gap-2 bg-white/10 border border-white/10 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6 md:mb-8 max-w-full">
      <span className="w-2 h-2 rounded-full bg-red-500" />
      <span className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide">
        Shopier mağazan için vitrin sitesi
      </span>
    </div>

    <h1 className="hidden sm:block text-[28px] sm:text-3xl md:text-4xl lg:text-6xl font-black mb-3 sm:mb-4 md:mb-6 leading-[1.06] tracking-tight">
      Ürünlerini tek linkte topla.
      <span className="block text-white/90">Modern vitrin sayfanı yayınla.</span>
    </h1>
    <p className="hidden sm:block text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 md:mb-10 max-w-xl leading-relaxed font-medium">
      Ödelink ile Shopier ürünlerini tek ekrandan sergile.
      Müşterilerine güven veren, hızlı açılan bir vitrin sayfası oluştur.
    </p>

    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
      <button
        type="button"
        onClick={handleNavigate}
        className="btn-primary text-base md:text-lg px-10 py-5 rounded-xl inline-flex items-center justify-center"
      >
        <span>Site Oluştur</span>
        <ArrowRight className="w-5 h-5 ml-3" />
      </button>

      <a
        href="#features"
        className="btn-secondary text-base md:text-lg px-10 py-5 rounded-xl inline-flex items-center justify-center w-full sm:w-[190px] md:w-[210px]"
      >
        <span className="whitespace-nowrap break-normal">Detaylı Bilgi</span>
      </a>

      <button
        type="button"
        onClick={triggerInstall}
        disabled={pwaInstalling}
        className="btn-secondary text-base md:text-lg px-10 py-5 rounded-xl items-center justify-center w-full sm:w-[190px] md:w-[210px] sm:hidden inline-flex"
      >
        <span className="whitespace-nowrap break-normal">{pwaInstalling ? 'Hazırlanıyor…' : 'Uygulamayı Yükle'}</span>
      </button>
    </div>

    <div className="mt-3 text-xs text-white/65 font-semibold sm:hidden text-center">
      Mobilde Chrome menüsünden "Ana ekrana ekle" ile kurulabilir.
    </div>

    <div className="mt-6 flex flex-col items-center gap-3 text-sm text-white/80">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-red-400" />
          <span>Hızlı kurulum</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-red-400" />
          <span>Temiz tasarım</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Check className="w-4 h-4 text-red-400" />
        <span>Tek link paylaşımı</span>
      </div>
    </div>
  </div>
);

/**
 * Desktop content - Animated version
 */
const DesktopContent = ({ siteBuilderHref, handleNavigate, triggerInstall, pwaInstalling }) => (
  <div>
    <motion.div
      className="hidden sm:inline-flex flex-wrap items-center justify-center sm:justify-start gap-2 bg-white/10 border border-white/10 text-white px-4 py-2 rounded-full mb-6 sm:mb-8 max-w-full"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'backOut' }}
    >
      <span className="w-2 h-2 rounded-full bg-red-500" />
      <span className="text-xs md:text-sm font-semibold tracking-wide">
        Shopier mağazan için vitrin sitesi
      </span>
    </motion.div>

    <motion.h1
      className="hidden sm:block text-[34px] sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 leading-[1.06] tracking-tight"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      style={{ textWrap: 'balance' }}
    >
      Ürünlerini tek linkte topla.
      <span className="block text-white/90">Modern vitrin sayfanı yayınla.</span>
    </motion.h1>

    <motion.p
      className="hidden sm:block text-lg md:text-xl text-white/80 mb-10 max-w-xl leading-relaxed font-medium"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      Shopier ürünlerini daha düzenli, daha hızlı ve daha güven veren bir vitrine dönüştür.
    </motion.p>

    <motion.div
      className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center sm:flex-nowrap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <motion.button
        type="button"
        onClick={handleNavigate}
        className="btn-primary text-base md:text-lg px-10 py-5 rounded-xl inline-flex items-center justify-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>Site Oluştur</span>
        <ArrowRight className="w-5 h-5 ml-3" />
      </motion.button>

      <motion.a
        href="#features"
        className="btn-secondary text-base md:text-lg px-8 md:px-9 py-5 rounded-xl inline-flex items-center justify-center w-full sm:w-[190px] md:w-[210px]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="whitespace-nowrap break-normal">Detaylı Bilgi</span>
      </motion.a>

      <motion.button
        type="button"
        onClick={triggerInstall}
        disabled={pwaInstalling}
        className="btn-secondary text-base md:text-lg px-8 md:px-9 py-5 rounded-xl items-center justify-center w-full sm:w-[190px] md:w-[210px] sm:hidden inline-flex"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="whitespace-nowrap break-normal">{pwaInstalling ? 'Hazırlanıyor…' : 'Uygulamayı Yükle'}</span>
      </motion.button>
    </motion.div>

    <motion.div
      className="mt-3 text-xs text-white/65 font-semibold sm:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      Mobilde Chrome menüsünden "Ana ekrana ekle" ile kurulabilir.
    </motion.div>

    <motion.div
      className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
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
