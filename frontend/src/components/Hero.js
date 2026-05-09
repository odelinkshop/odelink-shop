import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Check, 
  Globe, 
  Link2, 
  Shield, 
  TrendingUp, 
  Headphones, 
  Zap, 
  Sparkles, 
  MousePointer2,
  Rocket,
  Layout,
  BarChart3,
  Store,
  Monitor,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthSession from '../hooks/useAuthSession';

const Hero = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthSession();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigate = () => {
    navigate(isLoggedIn ? '/site-builder' : '/auth');
  };

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-24 pb-20 overflow-hidden bg-[#020202]">
      {/* --- DYNAMIC BACKGROUND ENGINE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Animated Mesh Gradients */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full will-change-transform" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full will-change-transform" 
        />
        
        {/* Particle System Effect */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
        
        {/* --- HYPER LIGHT SPEED METEOR ENGINE --- */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-1">
          {/* Diagonal Shooting Stars (Top-Left to Bottom-Right) */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`diag-${i}`}
              initial={{ x: '-20%', y: '-20%', opacity: 0 }}
              animate={{ 
                x: '150%', 
                y: '150%', 
                opacity: [0, 1, 0] 
              }}
              transition={{ 
                duration: 0.8 + Math.random() * 1.2, 
                repeat: Infinity, 
                delay: Math.random() * 5,
                ease: "easeOut"
              }}
              className="absolute h-[1px] w-[200px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[1px] rotate-45"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * -20}%`,
                boxShadow: '0 0 15px rgba(34, 211, 238, 0.8)'
              }}
            />
          ))}
          
          {/* Vertical Rain (Top to Bottom) */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`vert-${i}`}
              initial={{ y: '-20%', opacity: 0 }}
              animate={{ 
                y: '120vh', 
                opacity: [0, 0.8, 0] 
              }}
              transition={{ 
                duration: 1 + Math.random() * 1.5, 
                repeat: Infinity, 
                delay: Math.random() * 6,
                ease: "linear"
              }}
              className="absolute w-[1px] h-[150px] bg-gradient-to-b from-transparent via-blue-500 to-transparent blur-[1px]"
              style={{
                left: `${Math.random() * 100}%`,
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
              }}
            />
          ))}

          {/* Rapid Horizontal Pulse (Left to Right) */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`horiz-${i}`}
              initial={{ x: '-20%', opacity: 0 }}
              animate={{ 
                x: '120vw', 
                opacity: [0, 0.6, 0] 
              }}
              transition={{ 
                duration: 0.5 + Math.random() * 0.8, 
                repeat: Infinity, 
                delay: Math.random() * 4,
                ease: "linear"
              }}
              className="absolute h-[1px] w-[300px] bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[1px]"
              style={{
                top: `${Math.random() * 100}%`,
                boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)'
              }}
            />
          ))}
        </div>

        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        {/* Promo Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center lg:justify-start mb-8"
        >
          <div 
            onClick={() => navigate('/plans')}
            className="group flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full cursor-pointer hover:bg-white/10 transition-all"
          >
            <Sparkles size={14} className="text-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Yıllık Pakette %85 Tasarruf</span>
            <ArrowRight size={14} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-16 items-center">
          {/* Left Column: Content */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h4 className="text-blue-500 text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4">
                TÜRKİYE'NİN EN İYİ ŞİRKETSİZ SAAS PLATFORMU
              </h4>
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-black italic tracking-tighter text-white mb-6 uppercase leading-[1.1] md:leading-none">
                Mağazan İçin <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  Premium Vitrin
                </span>
              </h1>
              <p className="text-gray-400 text-base md:text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed mb-10 px-4 md:px-0">
                Shopier ürünlerini tek linkte topla, profesyonel vitrin sayfanı dakikalar içinde yayına al. Şirket gerektirmez, %0 ek komisyon, maksimum hız.
              </p>
 
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 px-6 sm:px-0">
                <button
                  onClick={handleNavigate}
                  className="w-full sm:w-auto group relative px-10 py-5 bg-blue-600 rounded-2xl font-black uppercase tracking-widest text-[11px] text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-blue-500/60 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Rocket size={18} />
                  Ücretsiz Başla
                </button>
                <button
                  onClick={() => navigate('/download')}
                  className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[11px] text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                >
                  <Monitor size={18} className="group-hover:text-blue-500 transition-colors" />
                  Uygulamayı İndir
                  <Download size={14} className="opacity-40 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all" />
                </button>
              </div>
            </motion.div>

              {/* Trust Items */}
              <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-6 opacity-60">
                {[
                  { icon: Shield, text: 'Şirket Gerekmez' },
                  { icon: Zap, text: 'Anında Kurulum' },
                  { icon: Headphones, text: '7/24 VIP Destek' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <item.icon size={16} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.text}</span>
                  </div>
                ))}
              </div>
          </div>

          {/* Right Column: Visual Dashboard */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative z-10 preserve-3d"
            >
              {/* Main Dashboard Preview Card */}
              <div className="relative bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 backdrop-blur-xl shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Browser Header Decor */}
                <div className="flex items-center gap-2 mb-4 px-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  <div className="ml-4 h-4 w-32 bg-white/5 rounded-full" />
                </div>

                {/* Dashboard Content Mock */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 relative overflow-hidden group/card">
                      <div className="absolute top-2 right-2 flex gap-1">
                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <BarChart3 size={18} className="text-blue-500 mb-2" />
                      <div className="h-2 w-12 bg-white/10 rounded mb-1" />
                      <div className="h-4 w-20 bg-white/20 rounded" />
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 relative overflow-hidden group/card">
                      <TrendingUp size={18} className="text-green-500 mb-2" />
                      <div className="h-2 w-12 bg-white/10 rounded mb-1" />
                      <div className="h-4 w-20 bg-white/20 rounded" />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-6 h-52 border border-white/5 flex flex-col justify-end gap-3 relative overflow-hidden">
                     <div className="absolute top-4 left-6 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Real-time Data Stream</span>
                     </div>
                     <div className="flex items-end gap-2.5 h-32">
                        {[40, 70, 45, 90, 65, 80, 55, 75, 50].map((h, i) => (
                          <motion.div 
                            key={i}
                            animate={{ 
                              height: [`${h}%`, `${Math.min(100, h + 20)}%`, `${Math.max(20, h - 15)}%`, `${h}%`] 
                            }}
                            transition={{ 
                              duration: 3 + Math.random() * 2, 
                              repeat: Infinity, 
                              ease: "easeInOut",
                              delay: i * 0.1
                            }}
                            className="flex-1 bg-gradient-to-t from-blue-600 via-purple-500 to-pink-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" 
                          />
                        ))}
                     </div>
                     <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                        <div className="flex gap-1">
                           {[1,2,3,4].map(i => <div key={i} className="w-3 h-1 bg-white/10 rounded-full" />)}
                        </div>
                        <div className="text-[8px] font-black text-blue-500/50 uppercase tracking-tighter">Nova Analytics Engine</div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Floating Element 1: Shopier Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-6 md:-right-10 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
                    <Store size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shopier Sync</div>
                    <div className="text-xs font-black text-gray-900">Aktif & Kararlı</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Element 2: Visitor Badge */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-6 md:-left-10 bg-blue-600 p-4 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.5)] z-20"
              >
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white">
                    <MousePointer2 size={16} />
                   </div>
                   <div className="text-white">
                      <div className="text-[9px] font-black uppercase opacity-60">Ziyaretçiler</div>
                      <div className="text-xs font-black">1.4k Bugün</div>
                   </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Glowing Backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30 hidden lg:block"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-white rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
