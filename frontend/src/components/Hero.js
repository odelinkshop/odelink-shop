import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Globe, Link2, Shield, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthSession from '../hooks/useAuthSession';
import BrandLogo from './BrandLogo';

const Hero = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthSession();
  const [pwaPrompt, setPwaPrompt] = useState(null);
  const [pwaInstalling, setPwaInstalling] = useState(false);

  const disableDesktopMotion = false;

  let siteBuilderHref = '/auth';
  try {
    siteBuilderHref = isLoggedIn ? '/site-builder' : '/auth';
  } catch (e) {
    void e;
  }

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      try {
        e.preventDefault();
      } catch (err) {
        void err;
      }
      setPwaPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    };
  }, []);

  const triggerInstall = async () => {
    if (!pwaPrompt) {
      try {
        window.location.href = '/support';
      } catch (e) {
        void e;
      }
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
  };

  return (
    <section className="pt-20 sm:pt-32 md:pt-40 pb-24 sm:pb-20 px-4 relative overflow-hidden bg-gray-900 text-white">
      <div className="absolute inset-0 pointer-events-none opacity-80" style={{
        backgroundImage: disableDesktopMotion
          ? 'none'
          : 'radial-gradient(1100px circle at 18% 22%, rgba(239,68,68,0.35), transparent 55%), radial-gradient(1100px circle at 85% 10%, rgba(255,255,255,0.10), transparent 60%), linear-gradient(to bottom, rgba(17,24,39,1), rgba(3,7,18,1))',
        backgroundColor: disableDesktopMotion ? 'rgb(17,24,39)' : undefined,
        contain: 'paint',
        transform: disableDesktopMotion ? undefined : 'translateZ(0)'
      }} />

      <div className="container mx-auto relative z-10">
        <div className="sm:hidden text-center mb-10">
          <div className="inline-flex items-center justify-center gap-2">
            <BrandLogo size={22} className="opacity-95" textClassName="text-white" />
            <span className="text-[12px] font-extrabold tracking-wide text-white/85">Ödelink</span>
          </div>
          <div className="mt-4 max-w-[20rem] mx-auto">
            <div className="text-[24px] font-black tracking-tight text-white leading-[1.08]" style={{ textWrap: 'balance' }}>
              Türkiye'nin En İyi Şirketsiz SaaS Platformu
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto text-center mb-8 md:mb-10">
          <div className="hidden sm:block">
            <div className="max-w-4xl mx-auto text-sm md:text-base font-semibold tracking-wide text-white/65 mb-2" style={{ textWrap: 'balance' }}>
              Türkiye'nin En İyi Şirketsiz SaaS Platformu
            </div>
            <div className="text-2xl md:text-4xl font-black tracking-tight text-white/95">
              Mağazan için premium vitrin sayfası.
            </div>
            <div className="mt-2 text-sm md:text-base font-semibold text-white/65">
              Tek link. Temiz tasarım. Dakikalar içinde yayında.
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-10 items-center">
            {disableDesktopMotion ? (
              <div className="lg:col-span-5 text-center sm:text-left">
                <div className="inline-flex flex-wrap items-center justify-center sm:justify-start gap-2 bg-white/10 border border-white/10 text-white px-4 py-2 rounded-full mb-6 sm:mb-8 max-w-full">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs md:text-sm font-semibold tracking-wide">
                    Shopier mağazan için vitrin sitesi
                  </span>
                </div>

                <h1 className="text-[34px] sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 leading-[1.06] tracking-tight" style={{ textWrap: 'balance' }}>
                  Ürünlerini tek linkte topla.
                  <span className="block text-white/90">Modern vitrin sayfanı yayınla.</span>
                </h1>
                <p className="hidden sm:block text-lg md:text-xl text-white/80 mb-10 max-w-xl leading-relaxed font-medium">
                  Ödelink ile Shopier ürünlerini tek ekrandan sergile.
                  Müşterilerine güven veren, hızlı açılan bir vitrin sayfası oluştur.
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center">
                  <button
                    type="button"
                    onClick={() => navigate(siteBuilderHref)}
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

                <div className="mt-3 text-xs text-white/65 font-semibold sm:hidden">
                  Mobilde Chrome menüsünden “Ana ekrana ekle” ile kurulabilir.
                </div>

                <div className="sm:hidden mt-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
                      <div className="flex items-center gap-2 text-white">
                        <Shield className="w-4 h-4 text-red-300" />
                        <span className="text-xs font-extrabold tracking-wide whitespace-nowrap leading-none">Komisyonsuz</span>
                      </div>
                      <div className="text-[11px] text-white/70 mt-1 font-semibold">Kazancın sende kalsın</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
                      <div className="flex items-center gap-2 text-white">
                        <Link2 className="w-4 h-4 text-red-300" />
                        <span className="text-xs font-extrabold tracking-wide">Shopier uyumlu</span>
                      </div>
                      <div className="text-[11px] text-white/70 mt-1 font-semibold">Satış Shopier’de tamamlanır</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
                      <div className="flex items-center gap-2 text-white">
                        <Globe className="w-4 h-4 text-red-300" />
                        <span className="text-xs font-extrabold tracking-wide">SEO hazır</span>
                      </div>
                      <div className="text-[11px] text-white/70 mt-1 font-semibold">Google için düzenli vitrin</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
                      <div className="flex items-center gap-2 text-white">
                        <TrendingUp className="w-4 h-4 text-red-300" />
                        <span className="text-xs font-extrabold tracking-wide">Dakikalar içinde</span>
                      </div>
                      <div className="text-[11px] text-white/70 mt-1 font-semibold">Kur, yayınla, paylaş</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/80">
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
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-5 text-center sm:text-left"
                style={{ willChange: 'transform' }}
              >
              <div className="inline-flex flex-wrap items-center justify-center sm:justify-start gap-2 bg-white/10 border border-white/10 text-white px-4 py-2 rounded-full mb-6 sm:mb-8 max-w-full">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs md:text-sm font-semibold tracking-wide">
                  Shopier mağazan için vitrin sitesi
                </span>
              </div>

              <h1 className="text-[34px] sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 leading-[1.06] tracking-tight" style={{ textWrap: 'balance' }}>
                Ürünlerini tek linkte topla.
                <span className="block text-white/90">Modern vitrin sayfanı yayınla.</span>
              </h1>
              <p className="hidden sm:block text-lg md:text-xl text-white/80 mb-10 max-w-xl leading-relaxed font-medium">
                Shopier ürünlerini daha düzenli, daha hızlı ve daha güven veren bir vitrine dönüştür.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center sm:flex-nowrap">
                <motion.button
                  type="button"
                  onClick={() => navigate(siteBuilderHref)}
                  className="btn-primary text-base md:text-lg px-10 py-5 rounded-xl inline-flex items-center justify-center"
                  whileHover={disableDesktopMotion ? undefined : { scale: 1.02 }}
                  whileTap={disableDesktopMotion ? undefined : { scale: 0.98 }}
                >
                  <span>Site Oluştur</span>
                  <ArrowRight className="w-5 h-5 ml-3" />
                </motion.button>

                <motion.a
                  href="#features"
                  className="btn-secondary text-base md:text-lg px-8 md:px-9 py-5 rounded-xl inline-flex items-center justify-center w-full sm:w-[190px] md:w-[210px]"
                  whileHover={disableDesktopMotion ? undefined : { scale: 1.02 }}
                  whileTap={disableDesktopMotion ? undefined : { scale: 0.98 }}
                >
                  <span className="whitespace-nowrap break-normal">Detaylı Bilgi</span>
                </motion.a>

                <motion.button
                  type="button"
                  onClick={triggerInstall}
                  disabled={pwaInstalling}
                  className="btn-secondary text-base md:text-lg px-8 md:px-9 py-5 rounded-xl items-center justify-center w-full sm:w-[190px] md:w-[210px] sm:hidden inline-flex"
                  whileHover={disableDesktopMotion ? undefined : { scale: 1.02 }}
                  whileTap={disableDesktopMotion ? undefined : { scale: 0.98 }}
                >
                  <span className="whitespace-nowrap break-normal">{pwaInstalling ? 'Hazırlanıyor…' : 'Uygulamayı Yükle'}</span>
                </motion.button>
              </div>

              <div className="mt-3 text-xs text-white/65 font-semibold sm:hidden">
                Mobilde Chrome menüsünden “Ana ekrana ekle” ile kurulabilir.
              </div>

              <div className="sm:hidden mt-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
                    <div className="flex items-center gap-2 text-white">
                      <Shield className="w-4 h-4 text-red-300" />
                      <span className="text-xs font-extrabold tracking-wide whitespace-nowrap leading-none">Komisyonsuz</span>
                    </div>
                    <div className="text-[11px] text-white/70 mt-1 font-semibold">Kazancın sende kalsın</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
                    <div className="flex items-center gap-2 text-white">
                      <Link2 className="w-4 h-4 text-red-300" />
                      <span className="text-xs font-extrabold tracking-wide">Shopier uyumlu</span>
                    </div>
                    <div className="text-[11px] text-white/70 mt-1 font-semibold">Satış Shopier’de tamamlanır</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
                    <div className="flex items-center gap-2 text-white">
                      <Globe className="w-4 h-4 text-red-300" />
                      <span className="text-xs font-extrabold tracking-wide">SEO hazır</span>
                    </div>
                    <div className="text-[11px] text-white/70 mt-1 font-semibold">Google için düzenli vitrin</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
                    <div className="flex items-center gap-2 text-white">
                      <TrendingUp className="w-4 h-4 text-red-300" />
                      <span className="text-xs font-extrabold tracking-wide">Dakikalar içinde</span>
                    </div>
                    <div className="text-[11px] text-white/70 mt-1 font-semibold">Kur, yayınla, paylaş</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/80">
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
              </div>
              </motion.div>
            )}

            <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
              <div className="relative w-full max-w-[220px] overflow-hidden">
                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white">Linki ekle</div>
                      <div className="text-xs text-white/70 mt-1">Shopier mağaza URL’ni yapıştır.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white">Tasarımı seç</div>
                      <div className="text-xs text-white/70 mt-1">Tema ve renklerini ayarla.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-white">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white">Yayınla</div>
                      <div className="text-xs text-white/70 mt-1">Linkin hazır, paylaşmaya başla.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {disableDesktopMotion ? (
              <div className="relative lg:col-span-5">
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
                      <div className="rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                          <TrendingUp className="w-4 h-4 text-gray-900" />
                          <span className="text-sm leading-tight break-normal">Dönüşüm odaklı</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">Ürünler net, satın alma akışı hızlı.</div>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                          <Shield className="w-4 h-4 text-gray-900" />
                          <span className="text-sm leading-tight break-normal">Güven hissi</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">Sade tasarım, profesyonel görünüm.</div>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                          <Globe className="w-4 h-4 text-gray-900" />
                          <span className="text-sm leading-tight break-normal">Mobil uyum</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">Her ekranda düzgün görünür.</div>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <div className="text-sm font-semibold text-gray-900">Yayınla</div>
                        <div className="text-xs text-gray-600 mt-2">Dakikalar içinde linkin hazır.</div>
                        <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full w-2/3 bg-gray-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative lg:col-span-5"
                style={{ willChange: 'transform' }}
              >
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
                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 text-gray-900 font-semibold">
                        <TrendingUp className="w-4 h-4 text-gray-900" />
                        <span className="text-sm leading-tight break-normal">Dönüşüm odaklı</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">Ürünler net, satın alma akışı hızlı.</div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 text-gray-900 font-semibold">
                        <Shield className="w-4 h-4 text-gray-900" />
                        <span className="text-sm leading-tight break-normal">Güven hissi</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">Sade tasarım, profesyonel görünüm.</div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 text-gray-900 font-semibold">
                        <Globe className="w-4 h-4 text-gray-900" />
                        <span className="text-sm leading-tight break-normal">Mobil uyum</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">Her ekranda düzgün görünür.</div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="text-sm font-semibold text-gray-900">Yayınla</div>
                      <div className="text-xs text-gray-600 mt-2">Dakikalar içinde linkin hazır.</div>
                      <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full w-2/3 bg-gray-900" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </motion.div>
            )}
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16"
          initial={disableDesktopMotion ? false : { opacity: 0, y: 24 }}
          animate={disableDesktopMotion ? undefined : { opacity: 1, y: 0 }}
          transition={disableDesktopMotion ? undefined : { duration: 0.8, delay: 0.15 }}
          style={{ willChange: 'transform' }}
        >
          <div className="bg-white rounded-2xl p-7 border border-gray-200">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-black mb-1 text-gray-900">0 Komisyon</h3>
            <p className="text-gray-600 font-medium">Kazancın sende kalsın</p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-gray-200">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-black mb-1 text-gray-900">Güvenli</h3>
            <p className="text-gray-600 font-medium">Sade ve anlaşılır deneyim</p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-gray-200">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-black mb-1 text-gray-900">Hızlı Kurulum</h3>
            <p className="text-gray-600 font-medium">Dakikalar içinde yayında</p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-gray-200">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-base font-black">24/7</span>
            </div>
            <h3 className="text-lg font-black mb-1 text-gray-900">Stabil</h3>
            <p className="text-gray-600 font-medium">Hızlı ve stabil altyapı</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
