import React from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Apple, 
  Terminal, 
  Download, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Activity,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DownloadPage = () => {
  const navigate = useNavigate();

  const platforms = [
    {
      id: 'windows',
      name: 'Windows',
      icon: Monitor,
      ext: '.exe (Setup)',
      desc: 'En iyi deneyim için Windows 10/11 x64 önerilir.',
      link: '/downloads/Odelink-Setup-Windows.exe',
      comingSoon: false,
      color: '#00A4EF'
    },
    {
      id: 'mac',
      name: 'macOS',
      icon: Apple,
      ext: '.zip (Apple Silicon & Intel)',
      desc: 'macOS 12.0 Monterey ve üzeri sürümler için optimize edildi.',
      link: '/downloads/Odelink-MacOS.zip',
      comingSoon: false,
      color: '#FFFFFF'
    },
    {
      id: 'linux',
      name: 'Linux',
      icon: Terminal,
      ext: '.zip (x64)',
      desc: 'Ubuntu, Debian ve Fedora tabanlı dağıtımlar için kararlı sürüm.',
      link: '/downloads/Odelink-Linux.zip',
      comingSoon: false,
      color: '#FCC624'
    }
  ];

  const requirements = [
    { label: 'İşlemci', value: 'Intel Core i3 / M1 veya üstü' },
    { label: 'Bellek (RAM)', value: '4 GB (8 GB Önerilir)' },
    { label: 'Depolama', value: '500 MB Boş Alan' },
    { label: 'İnternet', value: 'Aktif Bağlantı Gerekli' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-4 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Geri Dön</span>
        </button>

        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
          >
            Ödelink Masaüstü <span className="text-blue-500">Uygulaması</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed"
          >
            İşletmenizi her an, her yerden kesintisiz yönetin. Gelişmiş analiz araçları, anlık bildirimler ve yüksek performans ile iş akışınızı hızlandırın.
          </motion.p>
        </div>

        {/* Platform Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {platforms.map((platform, idx) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative group"
            >
              <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 h-full flex flex-col items-center text-center backdrop-blur-xl hover:border-blue-500/50 transition-all duration-500 group-hover:-translate-y-2">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <platform.icon size={32} style={{ color: platform.color }} />
                </div>
                
                <h3 className="text-2xl font-black mb-2 uppercase italic tracking-tight">{platform.name}</h3>
                <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">{platform.ext}</div>
                
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  {platform.desc}
                </p>

                <div className="mt-auto w-full">
                  {platform.comingSoon ? (
                    <div className="px-6 py-4 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 border border-white/5">
                      Yakında Yayında
                    </div>
                  ) : (
                    <button
                      onClick={() => window.open(platform.link, '_blank')}
                      className="w-full group/btn relative px-6 py-4 bg-blue-600 rounded-xl font-black uppercase tracking-widest text-[11px] text-white shadow-lg hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-3 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                      <Download size={16} />
                      Hemen İndir
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Requirements & Info */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <Cpu className="text-blue-500" size={24} />
              <h4 className="text-xl font-black uppercase italic tracking-tight">SİSTEM GEREKSİNİMLERİ</h4>
            </div>
            
            <div className="space-y-6">
              {requirements.map((req, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-white/5">
                  <span className="text-gray-500 text-xs font-black uppercase tracking-widest">{req.label}</span>
                  <span className="text-sm font-bold text-gray-200">{req.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Feature Grid Mini */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              { icon: ShieldCheck, title: 'Güvenli Altyapı', desc: 'Uçtan uca şifrelenmiş veri iletimi.' },
              { icon: Zap, title: 'Yüksek Performans', desc: 'Native mimari ile sıfır gecikme.' },
              { icon: Activity, title: 'Anlık Bildirimler', desc: 'Masaüstü bildirimleriyle satışları takip edin.' },
              { icon: Monitor, title: 'Modern Arayüz', desc: 'Çoklu monitör ve yüksek çözünürlük desteği.' }
            ].map((f, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
                <f.icon className="text-blue-500 mb-4" size={24} />
                <div className="text-sm font-bold tracking-wide mb-2">{f.title}</div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-20 opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            &copy; 2026 ODELINK INTELLIGENCE SYSTEMS - HER HAKKI SAKLIDIR
          </p>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
