import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, ExternalLink, Home, Zap, CreditCard, Shield, Lock, 
  HelpCircle, UserCheck, ArrowLeft, BookOpen, Smartphone, Globe, Monitor
} from 'lucide-react';

const LinksPage = () => {
  const navigate = useNavigate();

  const firstPreviewSubdomain = useMemo(() => {
    try {
      const raw = localStorage.getItem('odelink_cache_dashboard_v1');
      const parsed = raw ? JSON.parse(raw) : null;
      const sites = Array.isArray(parsed?.sites) ? parsed.sites : [];
      const first = sites.find((s) => String(s?.subdomain || '').trim());
      return first?.subdomain || '';
    } catch { return ''; }
  }, []);

  const goHomeHash = (hash) => {
    navigate('/');
    setTimeout(() => { window.location.hash = hash; }, 0);
  };

  const supportEmail = useMemo(() => {
    return (process.env.REACT_APP_SUPPORT_EMAIL || 'odelinkdestek@gmail.com').trim();
  }, []);

  const linkSections = [
    {
      title: 'PLATFORM YÖNETİMİ',
      links: [
        { label: 'Mağaza Paneli', icon: LayoutGrid, onClick: () => navigate('/panel'), primary: true },
        { label: 'Mağaza Önizleme', icon: ExternalLink, onClick: () => firstPreviewSubdomain && window.open(`https://odelink.shop/s/${firstPreviewSubdomain}`, '_blank'), hidden: !firstPreviewSubdomain }
      ]
    },
    {
      title: 'KURUMSAL VE VİZYON',
      links: [
        { label: 'Hakkımızda', icon: UserCheck, onClick: () => navigate('/about') }
      ]
    },
    {
      title: 'UYGULAMALAR',
      links: [
        { label: 'Masaüstü Uygulamasını İndir', icon: Monitor, onClick: () => navigate('/download'), primary: true }
      ]
    },
    {
      title: 'HIZLI ERİŞİM',
      links: [
        { label: 'Ana Sayfa', icon: Home, onClick: () => navigate('/') },
        { label: 'Özellikler', icon: Zap, onClick: () => goHomeHash('#features') },
        { label: 'Fiyatlandırma', icon: CreditCard, onClick: () => goHomeHash('#pricing') }
      ]
    },
    {
      title: 'BİLGİ VE DESTEK',
      links: [
        { label: 'Destek Merkezi', icon: HelpCircle, onClick: () => navigate('/support') },
        { label: 'Resmi E-posta', icon: Globe, onClick: () => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}`, '_blank') }
      ]
    },
    {
      title: 'YASAL BELGELER',
      links: [
        { label: 'Kullanım Şartları', icon: FileTextIcon, onClick: () => navigate('/terms') },
        { label: 'Gizlilik Politikası', icon: Shield, onClick: () => navigate('/privacy') },
        { label: 'KVKK Metni', icon: Lock, onClick: () => navigate('/kvkk') },
        { label: 'Çerez Politikası', icon: Smartphone, onClick: () => navigate('/cookies') }
      ]
    },
  ];

  function FileTextIcon(props) { return <BookOpen {...props} /> }

  return (
    <div className="min-h-screen bg-[#050505] text-white py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-gray-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 uppercase tracking-widest text-[10px] font-bold"
          >
            <ArrowLeft size={14} /> GERİ DÖN
          </button>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">KAYNAK <span className="text-red-600">MERKEZİ</span></h1>
          <p className="text-gray-400 text-lg font-medium max-w-xl">
            İhtiyacınız olan tüm bağlantılar, dökümanlar ve yönetim araçları tek bir noktada. Hızlı erişim için tasarlanmış kurumsal dizin.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {linkSections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="space-y-4"
            >
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.25em] ml-1">{section.title}</h3>
              <div className="space-y-2">
                {section.links.filter(l => !l.hidden).map((link, lIdx) => (
                  <button
                    key={lIdx}
                    onClick={link.onClick}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                      link.primary 
                        ? 'bg-red-600 border-red-600 text-white hover:bg-red-700' 
                        : link.admin
                          ? 'bg-white/5 border-white/10 text-red-500 hover:bg-white/10 hover:border-white/20'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <link.icon size={18} className={link.primary ? 'text-white' : 'text-gray-500 group-hover:text-white transition-colors'} />
                      <span className="text-sm font-bold tracking-tight">{link.label}</span>
                    </div>
                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 p-8 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col md:flex-row items-center gap-6"
        >
          <div className="w-12 h-12 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-center justify-center shrink-0">
            <Shield className="text-red-600" size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-widest">YASAL BİLGİLENDİRME</h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Ödelink, Shopier ile resmi bir ortaklık veya temsil ilişkisi içinde değildir. Tüm bağlantılar sizi güvenli bir şekilde ilgili platformlara yönlendirmek amacıyla dizinlenmiştir.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LinksPage;
