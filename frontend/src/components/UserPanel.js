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
  Sparkles
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
    const links = bulkLinks.split('\n').map(l => l.trim()).filter(l => l.startsWith('http'));
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
        const successCount = data.results.filter(r => r.success).length;
        const failCount = data.results.filter(r => !r.success).length;
        
        toast.success(`İçe aktarma tamamlandı: ${successCount} başarılı, ${failCount} başarısız.`);
        
        setShowBulkModal(false);
        setBulkLinks('');
      } else {
        toast.error(data.error || 'İçe aktarma sırasında hata oluştu.');
      }
    } catch (e) {
      toast.error('Bağlantı hatası oluştu.');
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
         <Loader2 className="w-8 h-8 text-white animate-spin" />
         <p className="text-[10px] uppercase tracking-[0.4em] text-white font-bold">YÜKLENİYOR</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2EBE1] font-sans selection:bg-white/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-0 w-[40%] h-[40%] bg-white/3 blur-[100px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-24 pb-32 relative">
        {/* Header Section: Reimagined for Mobile */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 sm:mb-20 px-2">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl sm:text-6xl font-serif tracking-tight text-[#F2EBE1]">Mağaza Paneli</h1>
            <div className="flex items-center justify-center md:justify-start gap-3">
               <div className="h-px w-8 bg-white/20 hidden sm:block" />
               <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/50 font-black">Komuta Merkezi & Aristokratik Kontrol</p>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/site-builder')}
            className="flex items-center justify-center gap-3 bg-white text-[#0A0A0A] w-full md:w-auto px-8 py-5 sm:py-4 font-black uppercase tracking-[0.2em] text-[10px] sm:text-[11px] hover:bg-[#F2EBE1] transition-all shadow-2xl shadow-white/5 rounded-sm"
          >
            <Plus size={18} strokeWidth={3} /> YENİ MAĞAZA OLUŞTUR
          </motion.button>
        </div>
 
        {/* Tab Navigation: Corporate Precision */}
        <div className="relative mb-12 sm:mb-16">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-white/5 pb-px mask-fade-right">
            {[
              { id: 'overview', label: 'GENEL BAKIŞ', icon: BarChart3 },
              { id: 'products', label: 'ÜRÜNLERİM', icon: ShoppingBag },
              { id: 'orders', label: 'SİPARİŞLERİM', icon: ShoppingCart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-6 sm:px-8 py-5 text-[10px] font-black tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-white' : 'text-white/30 hover:text-white'}`}
              >
                <tab.icon size={15} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t-full"
                  />
                )}
              </button>
            ))}
 
            {capabilities?.tier === 'profesyonel' && (
              <button 
                onClick={() => setShowBulkModal(true)}
                className={`flex items-center gap-2.5 px-6 sm:px-8 py-5 text-[10px] font-black tracking-[0.2em] transition-all relative whitespace-nowrap ${showBulkModal ? 'text-white' : 'text-white/30 hover:text-white'}`}
              >
                <Link size={15} />
                TOPLU LİNK YÜKLE
              </button>
            )}
          </div>
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
                  className={`bg-white/[0.03] border p-8 sm:p-10 relative group transition-all rounded-sm flex flex-col ${stat.isPlan && capabilities?.tier === 'profesyonel' ? 'border-white/40 bg-white/10' : 'border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className={`w-12 h-12 border flex items-center justify-center rounded-sm ${stat.isPlan && capabilities?.tier === 'profesyonel' ? 'bg-white text-[#0A0A0A] border-transparent shadow-xl shadow-white/10' : 'bg-white/5 border-white/10 text-white/50'}`}>
                      <stat.icon size={20} strokeWidth={2.5} />
                    </div>
                    {stat.isPlan && capabilities?.tier !== 'profesyonel' && (
                      <button onClick={() => navigate('/premium')} className="px-4 py-1.5 bg-white text-[#0A0A0A] text-[9px] font-black uppercase tracking-tighter hover:bg-[#F2EBE1] transition-colors">YÜKSELT</button>
                    )}
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-black mb-2">{stat.label}</div>
                  <div className={`text-3xl sm:text-4xl font-serif mb-2 ${stat.isPlan && capabilities?.tier === 'profesyonel' ? 'text-white' : 'text-[#F2EBE1]'}`}>{stat.value}</div>
                  <div className="text-[9px] text-white/20 font-bold tracking-widest uppercase">{stat.sub}</div>
                </motion.div>
              ))}
            </div>
 
            {/* Pro Advantage Banner: High End */}
            {capabilities?.tier === 'profesyonel' && (
              <div className="bg-white/[0.04] border border-white/10 p-8 sm:p-12 mb-16 flex flex-col lg:flex-row items-center justify-between gap-10 rounded-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                   <Zap size={120} strokeWidth={1} />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto text-center sm:text-left relative z-10">
                  <div className="w-16 h-16 bg-white text-[#0A0A0A] flex items-center justify-center shadow-2xl shadow-white/10 shrink-0 rounded-sm">
                    <Zap size={28} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-3xl font-serif text-[#F2EBE1]">Avantajlar Aktif</h3>
                    <p className="text-[9px] sm:text-[11px] text-white/50 uppercase tracking-[0.2em] font-black">Öncelikli Destek & Stratejik Rapor Erişimi</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full lg:w-auto relative z-10">
                  <button onClick={() => navigate('/support')} className="px-6 py-5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-3">
                    <Headphones size={14} /> DESTEK
                  </button>
                  <button onClick={handleDownloadReport} disabled={isDownloading} className="px-6 py-5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-3">
                    {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} RAPOR
                  </button>
                </div>
              </div>
            )}
 
            {/* Showcases Grid: Premium Mobile Display */}
            <div className="space-y-12">
               <div className="flex items-center gap-6">
                  <h2 className="text-2xl sm:text-3xl font-serif text-[#F2EBE1] whitespace-nowrap">Aktif Vitrinleriniz</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
               </div>
               
               {sites.length === 0 ? (
                 <div className="py-32 text-center border border-dashed border-white/10 bg-white/[0.01] rounded-sm group">
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
                       className="bg-white/[0.03] border border-white/5 p-8 sm:p-12 relative group overflow-hidden rounded-sm hover:border-white/20 transition-all"
                     >
                       <div className="absolute -bottom-10 -right-10 text-[120px] font-serif text-white/5 select-none pointer-events-none uppercase tracking-tighter italic opacity-0 group-hover:opacity-100 transition-opacity duration-1000">{site.subdomain}</div>
                       
                       <div className="flex justify-between items-start mb-12 relative z-10">
                          <div className="space-y-3">
                             <h3 className="text-2xl sm:text-3xl font-serif text-[#F2EBE1] leading-tight">{site.name}</h3>
                             <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                <span className="text-[9px] text-emerald-500/80 font-black tracking-[0.2em] uppercase">YAYINDA</span>
                             </div>
                          </div>
                          <button 
                            onClick={() => openPublicSiteNewTab(site)} 
                            className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white hover:text-black hover:border-white transition-all rounded-sm shadow-xl"
                          >
                             <ExternalLink size={20} />
                          </button>
                       </div>
 
                       <div className="grid grid-cols-1 gap-4 relative z-10">
                            <div className="grid grid-cols-2 gap-4">
                               <button onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}/analytics`)} className="py-4 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-3">
                                 <BarChart3 size={14} strokeWidth={2.5} /> ANALİTİK
                               </button>
                               <button onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}/settings/design`)} className="py-4 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-3">
                                 <Layout size={14} strokeWidth={2.5} /> TASARIM
                               </button>
                            </div>
                            <button 
                              onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}/domain`)} 
                              className={`py-4 border text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 rounded-sm ${!capabilities?.allowCustomDomain ? 'bg-white/5 border-white/5 text-white/20' : 'bg-white/5 border-white/20 text-white/80 hover:bg-white hover:text-black hover:border-white'}`}
                            >
                              {!capabilities?.allowCustomDomain ? <Lock size={12} /> : <Globe size={14} />} DOMAİN YÖNETİMİ
                            </button>
                        </div>
                     </motion.div>
                   ))}
                 </div>
               )}
            </div>

            <div className="mt-32 pt-20 border-t border-white/10">
               <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                  <div className="max-w-md">
                     <h3 className="text-xl font-serif text-[#F2EBE1] mb-4">Siber Altyapı & Kaynaklar</h3>
                     <p className="text-[10px] sm:text-[11px] text-[#F2EBE1]/40 leading-relaxed font-bold uppercase tracking-[0.2em] sm:tracking-widest">Nova SaaS İmparatorluğu'nun global kaynaklarına ve dökümantasyonuna buradan erişebilirsiniz.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                     {[
                        { label: 'Domain Rehberi', icon: Globe, path: '/guide' },
                        { label: 'Kurulum (Windows)', icon: Monitor, path: '/download' },
                        { label: 'VIP Akademi', icon: Zap, path: '/services' }
                      ].map((res, i) => (
                       <div key={i} onClick={() => navigate(res.path)} className="group cursor-pointer">
                         <div className="w-12 h-12 bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:border-white/30 transition-all mb-4">
                           <res.icon size={20} />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-[#F2EBE1]/40 group-hover:text-white transition-colors">{res.label}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <ProductManagement />
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <OrderList />
          </motion.div>
        )}

        <AnimatePresence>
          {showBulkModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-12">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !isImporting && setShowBulkModal(false)}
                className="absolute inset-0 bg-[#0A0A0A]/98 backdrop-blur-3xl"
              />
              <motion.div 
                initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                className="relative w-full h-full sm:h-auto sm:max-w-4xl bg-[#0F0F0F] border-t sm:border border-white/10 shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-8 sm:p-12 border-b border-white/5 bg-white/[0.01]">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white text-[#0A0A0A] flex items-center justify-center shadow-2xl shadow-white/5 rounded-sm">
                      <Link size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-4xl font-serif text-[#F2EBE1]">Link Canavarı</h3>
                      <p className="text-[9px] sm:text-[11px] text-white/30 font-black uppercase tracking-[0.3em] mt-2">Shopier Linklerini Toplu İçe Aktar</p>
                    </div>
                  </div>
                  {!isImporting && (
                    <button onClick={() => setShowBulkModal(false)} className="w-12 h-12 flex items-center justify-center text-white/30 hover:text-white transition-all"><X size={28} /></button>
                  )}
                </div>
                <div className="p-8 sm:p-12 space-y-10 flex-1 overflow-y-auto">
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Ürün Linkleri (Her satıra bir link)</label>
                       <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Shopier Altyapısı</span>
                    </div>
                    <textarea 
                      value={bulkLinks} onChange={(e) => setBulkLinks(e.target.value)} disabled={isImporting}
                      placeholder="https://www.shopier.com/shop/..."
                      className="w-full h-64 sm:h-96 bg-white/[0.03] border border-white/10 p-6 sm:p-10 text-[13px] text-white focus:border-white focus:outline-none transition-all font-mono resize-none leading-relaxed rounded-sm"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-4">
                    <button 
                      onClick={handleBulkImport} disabled={isImporting || !bulkLinks.trim()}
                      className="w-full sm:w-auto flex items-center justify-center gap-6 bg-white text-[#0A0A0A] px-12 py-6 font-black uppercase tracking-[0.2em] text-[12px] hover:bg-[#F2EBE1] transition-all shadow-xl shadow-white/5 rounded-sm"
                    >
                      {isImporting ? <><Loader2 className="animate-spin" size={20} /><span>CANAVAR ÇALIŞIYOR...</span></> : <><Sparkles size={20} /><span>LİNKLERİ ÇEK</span></>}
                    </button>
                    <p className="text-[9px] text-white/20 font-medium uppercase tracking-[0.3em] text-center sm:text-right leading-relaxed">Toplu link yükleme işlemi arka planda<br/>saniyeler içinde tamamlanır.</p>
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
