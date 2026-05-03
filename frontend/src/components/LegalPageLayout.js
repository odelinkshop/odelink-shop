import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  Cookie, 
  RefreshCcw, 
  Truck, 
  Scale, 
  ShieldAlert, 
  Accessibility,
  Printer,
  Share2,
  ChevronRight,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

const legalLinks = [
  { name: 'Kullanım Şartları', path: '/terms', icon: FileText },
  { name: 'Gizlilik Politikası', path: '/privacy', icon: Lock },
  { name: 'KVKK Metni', path: '/kvkk', icon: ShieldCheck },
  { name: 'Çerez Politikası', path: '/cookies', icon: Cookie },
  { name: 'İptal ve İade', path: '/refund-policy', icon: RefreshCcw },
  { name: 'Mesafeli Satış', path: '/distance-sales', icon: Truck },
  { name: 'Fikri Mülkiyet', path: '/intellectual-property', icon: Scale },
  { name: 'Güvenlik Politikası', path: '/security-policy', icon: ShieldAlert },
  { name: 'Erişilebilirlik', path: '/accessibility', icon: Accessibility },
];

const LegalPageLayout = ({ title, children, lastUpdated = '21.04.2026' }) => {
  const location = useLocation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 relative overflow-hidden">
      {/* Optimized Mesh Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[80px] rounded-full will-change-transform" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-red-500/5 blur-[80px] rounded-full will-change-transform" />
      </div>

      <div className="container mx-auto px-4 max-w-[1400px] relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Sidebar - Desktop Only Navigation */}
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">HUKUKİ BELGELER</h3>
                <nav className="space-y-1">
                  {legalLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) => `
                        group flex items-center justify-between p-4 rounded-2xl transition-all duration-300
                        ${isActive 
                          ? 'bg-white/10 text-white shadow-xl border border-white/10' 
                          : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] border border-transparent'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <link.icon size={18} className={location.pathname === link.path ? 'text-blue-500' : 'text-gray-600 group-hover:text-gray-400'} />
                        <span className="text-sm font-bold tracking-tight">{link.name}</span>
                      </div>
                      {location.pathname === link.path && <ChevronRight size={14} className="text-blue-500" />}
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* Sidebar Action Box */}
              <div className="p-8 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 rounded-[2.5rem]">
                <h4 className="text-sm font-bold mb-2">Desteğe mi ihtiyacınız var?</h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">Yasal süreçlerle ilgili sorularınız için hukuk birimimiz her zaman burada.</p>
                <a href="/contact" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors">
                  İLETİŞİME GEÇİN <ChevronRight size={12} />
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            {/* Header / Breadcrumb Area */}
            <div className="mb-12">
              <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-2xl">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <span className="hover:text-blue-500 cursor-pointer transition-colors">YASAL</span>
                      <ChevronRight size={10} />
                      <span className="text-white">BELGE</span>
                    </div>
                    <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">SON GÜNCELLEME: {lastUpdated}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={handlePrint}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
                    title="Yazdır"
                  >
                    <Printer size={18} />
                  </button>
                  <button 
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
                    title="Paylaş"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 italic uppercase">
                {title.split(' ').map((word, i) => (
                  <span key={i} className={i === 0 ? 'text-white' : 'text-blue-500'}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              <div className="h-1 w-24 bg-blue-600 rounded-full" />
            </div>

            {/* Document Body */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-8 md:p-16 backdrop-blur-md shadow-2xl relative overflow-hidden will-change-transform"
            >
              {/* Optimized Decorative Corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="prose prose-invert prose-blue max-w-none">
                <style jsx>{`
                  .prose h2 {
                    color: #fff;
                    font-weight: 900;
                    font-size: 2rem;
                    margin-top: 4rem;
                    margin-bottom: 1.5rem;
                    letter-spacing: -0.02em;
                    text-transform: uppercase;
                    font-style: italic;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding-bottom: 1rem;
                  }
                  .prose h3 {
                    color: #3b82f6;
                    font-weight: 800;
                    font-size: 1.25rem;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                  }
                  .prose p {
                    color: #9ca3af;
                    margin-bottom: 1.5rem;
                    line-height: 1.8;
                    font-size: 1.1rem;
                    font-weight: 500;
                  }
                  .prose strong {
                    color: #fff;
                    font-weight: 700;
                  }
                  .prose ul {
                    margin-top: 1.5rem;
                    margin-bottom: 2rem;
                    list-style: none;
                    padding-left: 0;
                  }
                  .prose li {
                    margin-bottom: 1rem;
                    padding-left: 1.5rem;
                    position: relative;
                    color: #9ca3af;
                    font-weight: 500;
                  }
                  .prose li::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0.65rem;
                    width: 0.5rem;
                    height: 0.5rem;
                    background: #3b82f6;
                    border-radius: 99px;
                  }
                  .prose button {
                    color: #3b82f6;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-size: 0.8rem;
                    text-decoration: none;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    transition: all 0.2s;
                  }
                  .prose button:hover {
                    color: #fff;
                    letter-spacing: 0.15em;
                  }
                `}</style>
                <div className="relative z-10">
                  {children}
                </div>
              </div>

              {/* Bottom Verification Section */}
              <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">RESMİ BELGE</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ÖDELINK HUKUK BİRİMİ TARAFINDAN ONAYLANMIŞTIR</p>
                  </div>
                </div>
                <div className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] italic">
                  NOVA SAAS PLATFORM 2026
                </div>
              </div>
            </motion.div>

            {/* Mobile Navigation (Bottom) */}
            <div className="lg:hidden mt-12 grid grid-cols-1 gap-3">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2 text-center">DİĞER YASAL BELGELER</h3>
              {legalLinks.filter(l => l.path !== location.pathname).slice(0, 3).map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400"
                >
                  <span className="text-xs font-bold uppercase tracking-widest">{link.name}</span>
                  <ChevronRight size={14} />
                </NavLink>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LegalPageLayout;
