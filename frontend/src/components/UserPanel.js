import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Store, 
  BarChart3, 
  Layout, 
  ExternalLink, 
  Plus, 
  Crown, 
  Download, 
  Headphones, 
  Settings2,
  TrendingUp,
  CircleDot,
  Loader2,
  Globe,
  Zap,
  Lock,
  Monitor,
  ShoppingBag,
  ShoppingCart,
  Link,
  X,
  Sparkles,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiBase } from '../utils/apiBase';
import { getAuthHeaders, getAuthToken } from '../utils/authStorage';
import ProductManagement from './ProductManagement';
import OrderList from './OrderList';
import { Toaster, toast } from 'sonner';

const API_BASE = getApiBase();
const DASH_CACHE_KEY = 'odelink_cache_dashboard_v1';

const UserPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [me, setMe] = useState(null);
  const [sites, setSites] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [stats, setStats] = useState(null);
  const [capabilities, setCapabilities] = useState(null);
  const [reportError, setReportError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkLinks, setBulkLinks] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const cachedRaw = localStorage.getItem(DASH_CACHE_KEY);
      const cached = cachedRaw ? JSON.parse(cachedRaw) : null;
      if (cached && typeof cached === 'object') {
        setMe(cached.user || null);
        setSites(Array.isArray(cached.sites) ? cached.sites : []);
        setSubscription(cached.subscription || null);
        setStats(cached.stats || null);
        setLoading(false);
      }
    } catch (e) { void e; }

    const token = getAuthToken();
    if (!token) {
      navigate('/auth', { state: { from: location.pathname } });
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 401) {
          navigate('/auth', { state: { from: location.pathname } });
          return;
        }

        if (!res.ok) {
          setError(data?.error || 'Panel verileri alınamadı');
          return;
        }

        if (!res.ok) {
          setError(data?.error || 'Panel verileri alınamadı');
          return;
        }

        if (cancelled) return;
        setMe(data.user || null);
        setSites(Array.isArray(data.sites) ? data.sites : []);
        setSubscription(data.subscription || null);
        setStats(data.stats || null);

        localStorage.setItem(DASH_CACHE_KEY, JSON.stringify({
          at: Date.now(),
          user: data.user || null,
          sites: Array.isArray(data.sites) ? data.sites : [],
          subscription: data.subscription || null,
          stats: data.stats || null
        }));

        const capsRes = await fetch(`${API_BASE}/api/subscriptions/capabilities`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const capsData = await capsRes.json().catch(() => ({}));
        if (capsRes.ok) setCapabilities(capsData?.capabilities || null);

      } catch (e) {
        setError('Bağlantı hatası. Lütfen tekrar deneyin.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [navigate, location.pathname]);

  const openPublicSiteNewTab = (siteRow) => {
    const subdomain = (siteRow?.subdomain || '').toString().trim();
    if (!subdomain) return;
    window.open(`https://${encodeURIComponent(subdomain)}.odelink.shop`, '_blank', 'noopener,noreferrer');
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      setReportError('');
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/reports/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Rapor indirilemedi');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Nova_Stratejik_Rapor_${new Date().getTime()}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      setReportError(e.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBulkImport = async () => {
    const links = bulkLinks.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 5)
      .map(l => l.startsWith('http') ? l : 'https://' + l)
      .filter(l => l.includes('shopier.com'));

    if (links.length === 0) {
      toast.error('Lütfen en az bir geçerli Shopier ürün linki girin.');
      return;
    }

    setIsImporting(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/products/import-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ links })
      });

      const data = await res.json();
      if (res.ok) {
        const successes = data.results.filter(r => r.success);
        const failures = data.results.filter(r => !r.success);
        
        if (successes.length > 0) {
          toast.success(`${successes.length} ürün başarıyla eklendi.`);
        }
        
        if (failures.length > 0) {
          failures.forEach(f => {
             toast.error(`Hata (${f.link.split('/').pop()}): ${f.error || 'Veri çekilemedi'}`);
          });
        }
        
        setShowBulkModal(false);
        setBulkLinks('');
      } else {
        toast.error(data.error || 'İçe aktarma sırasında sistem hatası oluştu.');
      }
    } catch (e) {
      toast.error('Bağlantı hatası oluştu.');
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
         <Loader2 className="w-8 h-8 text-white animate-spin" />
         <p className="text-[10px] uppercase tracking-[0.4em] text-white font-bold">YÜKLENİYOR</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-[#F2EBE1] font-sans selection:bg-white/30 relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-0 w-[40%] h-[40%] bg-white/3 blur-[100px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-24 pb-32 relative">
        {/* Header Section: Reimagined for Mobile */}
        <div className="flex justify-between items-center mb-8 sm:mb-20 px-2 relative z-50">
          {/* Desktop Title */}
          <div className="hidden md:block text-left space-y-1">
            <h1 className="text-6xl font-serif tracking-tight text-[#F2EBE1] uppercase">Mağaza Paneli</h1>
            <div className="flex items-center justify-start gap-3 mt-2">
               <div className="h-px w-8 bg-white/20" />
               <p className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-black">Yönetim Paneli</p>
            </div>
          </div>
          
          {/* Mobile App Bar Title */}
          <div className="md:hidden flex items-center gap-3">
             <div className="w-10 h-10 bg-white/5 border border-white/10 text-white flex items-center justify-center rounded-sm">
                <Store size={18} />
             </div>
             <div className="flex flex-col">
                <span className="text-[14px] font-serif text-[#F2EBE1]">Mağaza Paneli</span>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Yönetim Paneli</span>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <motion.button 
               whileTap={{ scale: 0.98 }}
               onClick={() => {
                 if (sites.length >= (capabilities?.maxSites || 1)) {
                   toast.error(`Maksimum site limitinize ulaştınız (${capabilities?.maxSites || 1} site). Profesyonel pakete geçiş yapın.`);
                   return;
                 }
                 navigate('/site-builder');
               }}
               className="hidden md:flex items-center justify-center gap-3 bg-white text-[#0A0A0A] px-8 py-4 font-black uppercase tracking-[0.2em] text-[11px] hover:bg-[#F2EBE1] transition-all shadow-2xl shadow-white/5 rounded-sm"
             >
               <Plus size={18} strokeWidth={3} /> YENİ MAĞAZA OLUŞTUR
             </motion.button>
             
             {/* Mobile Hamburger Toggle */}
             <button 
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className="md:hidden flex items-center justify-center w-12 h-12 bg-white/5 border border-white/10 text-white rounded-sm hover:bg-white/10 transition-all shrink-0"
             >
               {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
        </div>
 
        {/* Tab Navigation: Corporate Precision */}
        <div className="relative mb-8 sm:mb-16">
          {/* DESKTOP TABS */}
          <div className="hidden md:flex items-center gap-1 border-b border-white/5 pb-px">
            {[
              { id: 'overview', label: 'GENEL BAKIŞ', icon: BarChart3 },
              { id: 'products', label: 'ÜRÜNLERİM', icon: ShoppingBag },
              { id: 'orders', label: 'SİPARİŞLERİM', icon: ShoppingCart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-8 py-5 text-[10px] shrink-0 font-black tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-white' : 'text-white/30 hover:text-white'}`}
              >
                <tab.icon size={15} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabDesktop"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t-full"
                  />
                )}
              </button>
            ))}
 
            {capabilities?.tier === 'profesyonel' && (
              <button 
                onClick={() => setShowBulkModal(true)}
                className={`flex items-center gap-2 px-8 py-5 text-[10px] shrink-0 font-black tracking-[0.2em] transition-all relative whitespace-nowrap ${showBulkModal ? 'text-white' : 'text-white/30 hover:text-white'}`}
              >
                <Link size={15} />
                TOPLU LİNK YÜKLE
              </button>
            )}
          </div>

          {/* MOBILE HAMBURGER DROPDOWN */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="md:hidden absolute top-0 left-2 right-2 z-50 bg-[#0D0D0D] border border-white/10 shadow-2xl p-4 flex flex-col gap-2 rounded-sm"
                >
                  {[
                    { id: 'overview', label: 'GENEL BAKIŞ', icon: BarChart3 },
                    { id: 'products', label: 'ÜRÜNLERİM', icon: ShoppingBag },
                    { id: 'orders', label: 'SİPARİŞLERİM', icon: ShoppingCart },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                      className={`flex items-center gap-4 px-6 py-5 text-[10px] font-black tracking-[0.2em] transition-all rounded-sm ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white bg-white/[0.02]'}`}
                    >
                      <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                      {tab.label}
                    </button>
                  ))}
                  
                  {capabilities?.tier === 'profesyonel' && (
                    <button 
                      onClick={() => { setShowBulkModal(true); setIsMobileMenuOpen(false); }}
                      className={`flex items-center gap-4 px-6 py-5 text-[10px] font-black tracking-[0.2em] transition-all rounded-sm text-white/40 hover:text-white bg-white/[0.02] mt-2`}
                    >
                      <Link size={16} />
                      TOPLU LİNK YÜKLE
                    </button>
                  )}

                  <div className="h-px bg-white/10 my-2" />

                  <button 
                    onClick={() => { 
                      if (sites.length >= (capabilities?.maxSites || 1)) {
                        toast.error(`Maksimum site limitinize ulaştınız (${capabilities?.maxSites || 1} site). Profesyonel pakete geçiş yapın.`);
                        setIsMobileMenuOpen(false);
                        return;
                      }
                      navigate('/site-builder'); 
                      setIsMobileMenuOpen(false); 
                    }}
                    className={`flex items-center justify-center gap-3 px-6 py-5 text-[10px] font-black tracking-[0.2em] transition-all text-[#0A0A0A] bg-white hover:bg-[#F2EBE1] rounded-sm`}
                  >
                    <Plus size={16} strokeWidth={3} />
                    YENİ MAĞAZA OLUŞTUR
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Stats: Corporate Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
              {[
                { label: 'Toplam Site', value: stats?.total_sites || 0, icon: Globe, sub: `${stats?.active_sites || 0} Aktif Vitrin` },
                { label: 'Üyelik Durumu', value: capabilities?.tier === 'profesyonel' ? 'PRO' : 'STANDART', icon: Crown, isPlan: true, sub: capabilities?.tier === 'profesyonel' ? 'Sınırsız Ayrıcalık' : 'Temel Özellikler' },
                { label: 'Son 30 Gün', value: stats?.recent_sites || 0, icon: TrendingUp, sub: 'Yeni Oluşturulan Siteler' }
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-white/[0.03] border p-5 sm:p-10 relative group transition-all rounded-sm flex flex-col ${stat.isPlan && capabilities?.tier === 'profesyonel' ? 'border-white/40 bg-white/10' : 'border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-start mb-5 sm:mb-8">
                    <div className={`w-8 h-8 sm:w-12 sm:h-12 border flex items-center justify-center rounded-sm ${stat.isPlan && capabilities?.tier === 'profesyonel' ? 'bg-white text-[#0A0A0A] border-transparent shadow-xl shadow-white/10' : 'bg-white/5 border-white/10 text-white/50'}`}>
                      <stat.icon size={14} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </div>
                    {stat.isPlan && capabilities?.tier !== 'profesyonel' && (
                      <button onClick={() => navigate('/premium')} className="px-4 py-1.5 bg-white text-[#0A0A0A] text-[9px] font-black uppercase tracking-tighter hover:bg-[#F2EBE1] transition-colors">YÜKSELT</button>
                    )}
                  </div>
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-white/40 font-black mb-1 sm:mb-2">{stat.label}</div>
                  <div className={`text-xl sm:text-4xl font-serif mb-1 sm:mb-2 ${stat.isPlan && capabilities?.tier === 'profesyonel' ? 'text-white' : 'text-[#F2EBE1]'}`}>{stat.value}</div>
                  <div className="text-[8px] sm:text-[9px] text-white/20 font-bold tracking-widest uppercase">{stat.sub}</div>
                </motion.div>
              ))}
            </div>
 
            {/* Pro Advantage Banner: High End */}
            {capabilities?.tier === 'profesyonel' && (
              <div className="bg-white/[0.04] border border-white/10 p-5 sm:p-12 mb-10 sm:mb-16 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 rounded-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5 hidden sm:block">
                   <Zap size={120} strokeWidth={1} />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full lg:w-auto text-center sm:text-left relative z-10">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white text-[#0A0A0A] flex items-center justify-center shadow-2xl shadow-white/10 shrink-0 rounded-sm">
                    <Zap size={18} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-3xl font-serif text-[#F2EBE1]">Avantajlar Aktif</h3>
                    <p className="text-[8px] sm:text-[11px] text-white/50 uppercase tracking-[0.2em] font-black">Öncelikli Destek & Stratejik Rapor Erişimi</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full lg:w-auto relative z-10">
                  <button onClick={() => navigate('/support')} className="px-3 sm:px-6 py-3 sm:py-5 border border-white/10 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-widest text-white/60 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-2 sm:gap-3 text-center leading-none">
                    <Headphones size={12} className="sm:w-[14px] sm:h-[14px]" /> DESTEK
                  </button>
                  <button onClick={handleDownloadReport} disabled={isDownloading} className="px-3 sm:px-6 py-3 sm:py-5 border border-white/10 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-widest text-white/60 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-2 sm:gap-3 text-center leading-none">
                    {isDownloading ? <Loader2 size={12} className="sm:w-[14px] sm:h-[14px] animate-spin" /> : <Download size={12} className="sm:w-[14px] sm:h-[14px]" />} RAPOR
                  </button>
                </div>
              </div>
            )}
 
            {/* Showcases Grid: Premium Mobile Display */}
            <div className="space-y-12">
               <div className="flex items-center gap-4 sm:gap-6">
                  <h2 className="text-lg sm:text-3xl font-serif text-[#F2EBE1] whitespace-nowrap">Aktif Vitrinleriniz</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
               </div>
               
               {sites.length === 0 ? (
                 <div className="py-20 sm:py-32 text-center border border-dashed border-white/10 bg-white/[0.01] rounded-sm group">
                   <div className="w-16 h-16 border border-white/5 bg-white/[0.02] flex items-center justify-center mx-auto mb-6 transition-all group-hover:border-white/20">
                      <Store className="w-8 h-8 text-white/10 group-hover:text-white/30 transition-all" />
                   </div>
                   <p className="text-[11px] text-white/30 uppercase tracking-[0.4em] font-black">Henüz bir vitrininiz bulunmuyor.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   {sites.map((site, i) => (
                     <motion.div 
                       key={site.id} 
                       initial={{ opacity: 0, scale: 0.98 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       viewport={{ once: true }}
                       className="bg-white/[0.03] border border-white/5 p-5 sm:p-12 relative group overflow-hidden rounded-sm hover:border-white/20 transition-all flex flex-col"
                     >
                       <div className="absolute -bottom-10 -right-10 text-[80px] sm:text-[120px] font-serif text-white/5 select-none pointer-events-none uppercase tracking-tighter italic opacity-0 group-hover:opacity-100 transition-opacity duration-1000">{site.subdomain}</div>
                       <div className="flex justify-between items-start mb-6 sm:mb-12 relative z-10 gap-3 sm:gap-4">
                          <div className="space-y-1 sm:space-y-3 flex-1 overflow-hidden">
                             <h3 className="text-lg sm:text-3xl font-serif text-[#F2EBE1] leading-tight truncate">{site.name}</h3>
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                <span className="text-[7px] sm:text-[9px] text-emerald-500/80 font-black tracking-[0.2em] uppercase">YAYINDA</span>
                             </div>
                          </div>
                          <button 
                            onClick={() => openPublicSiteNewTab(site)} 
                            className="w-8 h-8 sm:w-14 sm:h-14 bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white hover:text-black hover:border-white transition-all rounded-sm shadow-xl shrink-0"
                          >
                             <ExternalLink size={12} className="sm:w-5 sm:h-5" />
                          </button>
                       </div>
 
                       <div className="grid grid-cols-1 gap-2 sm:gap-4 relative z-10 mt-auto">
                          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-4">
                             <button 
                               onClick={() => {
                                 if (capabilities?.tier !== 'profesyonel') {
                                   toast.error('Profesyonel pakete geçiş yapın.');
                                   return;
                                 }
                                 navigate(`/sites/${encodeURIComponent(site.id)}/analytics`);
                               }} 
                               className={`w-full py-2.5 sm:py-4 border text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 sm:gap-3 rounded-sm ${capabilities?.tier === 'profesyonel' ? 'border-white/10 text-white/40 hover:bg-white hover:text-black hover:border-white' : 'border-white/5 bg-white/5 text-white/20'}`}
                             >
                               {capabilities?.tier === 'profesyonel' ? <BarChart3 size={12} className="sm:w-[14px] sm:h-[14px]" strokeWidth={2.5} /> : <Lock size={10} className="sm:w-[12px] sm:h-[12px]" />} ANALİTİK
                             </button>

                             <button onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}/settings/design`)} className="w-full py-2.5 sm:py-4 border border-white/10 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-2 sm:gap-3">
                               <Layout size={12} className="sm:w-[14px] sm:h-[14px]" strokeWidth={2.5} /> TASARIM
                             </button>
                          </div>
                          <button 
                            onClick={() => {
                              if (!capabilities?.allowCustomDomain) {
                                toast.error('Profesyonel pakete geçiş yapın.');
                                return;
                              }
                              navigate(`/sites/${encodeURIComponent(site.id)}/domain`);
                            }}
                            className={`w-full py-2.5 sm:py-4 border text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 sm:gap-3 rounded-sm ${!capabilities?.allowCustomDomain ? 'bg-white/5 border-white/5 text-white/20' : 'bg-white/5 border-white/20 text-white/80 hover:bg-white hover:text-black hover:border-white'}`}
                          >
                            {!capabilities?.allowCustomDomain ? <Lock size={10} className="sm:w-[12px] sm:h-[12px]" /> : <Globe size={12} className="sm:w-[14px] sm:h-[14px]" />} DOMAİN YÖNETİMİ
                          </button>
                        </div>
                     </motion.div>
                   ))}
                 </div>
               )}
            </div>

            <div className="mt-16 sm:mt-32 pt-10 sm:pt-20 border-t border-white/10">
               <div className="flex flex-col lg:flex-row justify-between items-start gap-6 sm:gap-12">
                  <div className="max-w-md w-full">
                     <h3 className="text-lg sm:text-xl font-serif text-[#F2EBE1] mb-2 sm:mb-4">Destek & Kaynaklar</h3>
                     <p className="text-[10px] sm:text-[12px] text-[#F2EBE1]/40 leading-relaxed font-medium tracking-wide">Nova SaaS platformunun dokümantasyonuna ve global kaynaklarına buradan erişebilirsiniz.</p>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-8 w-full lg:w-auto">
                     {[
                        { label: 'Domain Rehberi', icon: Globe, path: '/guide' },
                        { label: 'Kurulum (Windows)', icon: Monitor, path: '/download' },
                        { label: 'Eğitim Merkezi', icon: Zap, path: '/services' }
                      ].map((res, i) => (
                       <div key={i} onClick={() => navigate(res.path)} className="group cursor-pointer bg-white/[0.02] sm:bg-transparent border border-white/5 sm:border-0 hover:border-white/20 transition-all rounded-sm flex flex-row sm:flex-col items-center sm:items-start p-3 sm:p-0 gap-3 sm:gap-0">
                         <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:border-white/30 transition-all mb-0 sm:mb-4 rounded-sm shrink-0">
                           <res.icon size={14} className="sm:w-5 sm:h-5" />
                         </div>
                         <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-widest text-[#F2EBE1]/40 group-hover:text-white transition-colors text-left">{res.label}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <ProductManagement onOpenBulk={() => setShowBulkModal(true)} />
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <OrderList />
          </motion.div>
        )}

        <AnimatePresence>
          {showBulkModal && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-12 lg:p-24">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !isImporting && setShowBulkModal(false)}
                className="absolute inset-0 bg-[#0A0A0A]/98 backdrop-blur-3xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 40 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 40 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-3xl bg-[#0D0D0D] border-t sm:border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-10 border-b border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
                    <Sparkles size={120} />
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-6 relative z-10 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white text-[#0A0A0A] flex items-center justify-center shadow-2xl shadow-white/10 rounded-sm shrink-0">
                      <Link size={16} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1 sm:space-y-2 flex-1">
                      <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Hızlı Entegrasyon</span>
                      </div>
                      <h3 className="text-xl sm:text-3xl font-serif text-[#F2EBE1] tracking-tighter leading-none">Toplu Link Yükle</h3>
                      <p className="text-[10px] sm:text-[12px] text-white/40 font-medium max-w-md leading-relaxed">
                        Shopier ürün linklerini alt alta ekleyerek tek seferde sisteme aktarabilirsiniz.
                      </p>
                    </div>
                  </div>
                  
                  {!isImporting && (
                    <button 
                      onClick={() => setShowBulkModal(false)} 
                      className="w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center text-white/20 hover:text-white transition-all bg-white/5 border border-white/5 hover:border-white/20 rounded-sm shrink-0 ml-2"
                    >
                      <X size={20} className="sm:w-[32px] sm:h-[32px]" strokeWidth={1.5} />
                    </button>
                  )}
                </div>

                {/* Processing Core */}
                <div className="p-4 sm:p-10 gap-3 sm:gap-6 flex-1 overflow-y-auto no-scrollbar flex flex-col">
                  <div className="flex flex-col flex-1 space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-end px-1 shrink-0 gap-1 sm:gap-0">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">LİNKLER</label>
                       <div className="flex items-center">
                         <span className="text-[9px] font-black text-emerald-500/80 tracking-widest">{bulkLinks.split('\n').filter(l => l.trim()).length} LİNK TESPİT EDİLDİ</span>
                       </div>
                    </div>
                    
                    <div className="relative group flex-1 flex flex-col">
                      <div className="absolute -inset-1 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity rounded-sm pointer-events-none" />
                      <textarea 
                        value={bulkLinks} 
                        onChange={(e) => setBulkLinks(e.target.value)} 
                        disabled={isImporting}
                        placeholder="https://www.shopier.com/shop/..."
                        className="w-full flex-1 min-h-[120px] sm:min-h-[160px] max-h-[250px] bg-[#0A0A0A] border border-white/5 p-4 sm:p-6 text-[11px] sm:text-[13px] text-white/80 focus:border-white/20 focus:outline-none transition-all font-mono resize-none leading-relaxed rounded-sm shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex justify-end pt-2 shrink-0">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBulkImport} 
                      disabled={isImporting || !bulkLinks.trim()}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 sm:gap-4 bg-white text-[#0A0A0A] px-5 py-4 sm:px-8 font-black uppercase tracking-[0.2em] text-[10px] sm:text-[11px] hover:bg-[#F2EBE1] transition-all rounded-sm group overflow-hidden relative"
                    >
                      {isImporting && (
                        <motion.div 
                          initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-0 bg-black/5"
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                        {isImporting ? (
                          <><Loader2 className="animate-spin w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]" /> <span>İŞLENİYOR...</span></>
                        ) : (
                          <><Sparkles size={14} className="sm:w-[16px] sm:h-[16px] group-hover:rotate-12 transition-transform" /> <span>LİNKLERİ SİSTEME İŞLE</span></>
                        )}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <Toaster position="top-right" theme="dark" richColors />
      </main>
    </div>
  );
};

export default UserPanel;
