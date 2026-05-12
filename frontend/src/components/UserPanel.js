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
         <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
         <p className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-bold">YÜKLENİYOR</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2EBE1] font-sans selection:bg-[#C5A059]/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#C5A059]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-0 w-[40%] h-[40%] bg-[#C5A059]/3 blur-[100px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-32 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 px-2">
          <div className="text-center md:text-left">
            <h1 className="text-3xl sm:text-5xl font-serif tracking-tight text-[#F2EBE1] mb-1 sm:mb-2">Mağaza Paneli</h1>
            <p className="text-[7px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.4em] text-[#C5A059] font-black opacity-60">Komuta Merkezi & Aristokratik Kontrol</p>
          </div>
          <button 
            onClick={() => navigate('/site-builder')}
            className="flex items-center justify-center gap-2 bg-[#C5A059] text-[#0A0A0A] w-full md:w-auto px-6 py-4 font-black uppercase tracking-widest text-[9px] sm:text-[11px] hover:bg-[#F2EBE1] transition-all shadow-xl shadow-[#C5A059]/10"
          >
            <Plus size={16} /> YENİ MAĞAZA OLUŞTUR
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-12 border-b border-white/5 pb-px overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'GENEL BAKIŞ', icon: BarChart3 },
            { id: 'products', label: 'ÜRÜNLERİM', icon: ShoppingBag },
            { id: 'orders', label: 'SİPARİŞLERİM', icon: ShoppingCart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-[#C5A059]' : 'text-white/40 hover:text-white'}`}
            >
              <tab.icon size={14} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C5A059]"
                />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { label: 'Toplam Site', value: stats?.total_sites || 0, icon: Globe, sub: `${stats?.active_sites || 0} Aktif Vitrin` },
                { label: 'Üyelik Durumu', value: capabilities?.tier === 'profesyonel' ? 'PRO' : 'STANDART', icon: Crown, isPlan: true, sub: capabilities?.tier === 'profesyonel' ? 'Sınırsız Ayrıcalık' : 'Temel Özellikler' },
                { label: 'Son 30 Gün', value: stats?.recent_sites || 0, icon: TrendingUp, sub: 'Yeni Oluşturulan Siteler' }
              ].map((stat, i) => (
                <motion.div key={i} className={`bg-white/[0.02] border p-5 sm:p-8 relative group transition-all rounded-sm ${stat.isPlan && capabilities?.tier === 'profesyonel' ? 'border-[#C5A059]/40 bg-[#C5A059]/5' : 'border-white/5 hover:border-[#C5A059]/30'}`}>
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div className={`w-10 h-10 border flex items-center justify-center ${stat.isPlan && capabilities?.tier === 'profesyonel' ? 'bg-[#C5A059] text-[#0A0A0A] border-transparent' : 'bg-white/5 border-white/10 text-[#C5A059]'}`}>
                      <stat.icon size={18} />
                    </div>
                    {stat.isPlan && capabilities?.tier !== 'profesyonel' && (
                      <button onClick={() => navigate('/premium')} className="px-3 py-1 bg-[#C5A059] text-[#0A0A0A] text-[8px] font-black uppercase tracking-tighter">YÜKSELT</button>
                    )}
                  </div>
                  <div className="text-[8px] uppercase tracking-wider text-[#C5A059] font-black opacity-40 mb-1">{stat.label}</div>
                  <div className={`text-2xl font-serif mb-1 ${stat.isPlan && capabilities?.tier === 'profesyonel' ? 'text-[#C5A059]' : 'text-[#F2EBE1]'}`}>{stat.value}</div>
                  <div className="text-[8px] text-[#F2EBE1]/30 font-bold tracking-tight uppercase">{stat.sub}</div>
                </motion.div>
              ))}
            </div>

            {capabilities?.tier === 'profesyonel' && (
              <div className="bg-white/[0.03] border border-white/5 p-5 sm:p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto text-left">
                  <div className="w-12 h-12 bg-[#C5A059] flex items-center justify-center shadow-lg shrink-0 rounded-sm">
                    <Zap size={22} className="text-[#0A0A0A]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-xl font-serif text-[#F2EBE1]">Avantajlar Aktif</h3>
                    <p className="text-[7px] sm:text-[11px] text-[#C5A059] uppercase tracking-[0.1em] mt-0.5 font-black">Öncelikli Destek & Rapor Erişimi</p>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-2 w-full md:w-auto">
                  <button onClick={() => setShowBulkModal(true)} className="flex-1 px-4 py-3 bg-[#C5A059]/10 border border-[#C5A059]/30 text-[8px] font-black uppercase tracking-widest text-[#C5A059] hover:bg-[#C5A059] hover:text-black transition-all flex items-center justify-center gap-2">
                    <Link size={10} /> TOPLU LİNK YÜKLE
                  </button>
                  <button onClick={handleDownloadReport} disabled={isDownloading} className="flex-1 px-4 py-3 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center justify-center gap-2">
                    {isDownloading ? <Loader2 size={10} className="animate-spin" /> : <Download size={10} />} RAPOR
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-8">
               <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-serif text-[#F2EBE1]">Aktif Vitrinleriniz</h2>
                  <div className="flex-1 h-[1px] bg-[#C5A059]/10" />
               </div>
               {sites.length === 0 ? (
                 <div className="py-20 text-center border border-dashed border-[#C5A059]/20 bg-white/[0.01]">
                   <Store className="w-12 h-12 text-[#C5A059]/20 mx-auto mb-4" />
                   <p className="text-xs text-[#F2EBE1]/40 uppercase tracking-[0.3em] font-bold">Henüz bir vitrininiz bulunmuyor.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {sites.map((site, i) => (
                     <motion.div key={site.id} className="bg-white/[0.02] border border-[#C5A059]/10 p-6 sm:p-10 relative group overflow-hidden">
                       <div className="absolute -bottom-8 -right-8 text-7xl font-serif text-[#C5A059]/5 select-none pointer-events-none uppercase">{site.subdomain}</div>
                       <div className="flex justify-between items-start mb-10 relative z-10">
                          <div>
                             <h3 className="text-xl sm:text-2xl font-serif text-[#F2EBE1] mb-1">{site.name}</h3>
                             <div className="flex items-center gap-2 text-[8px] text-[#C5A059] font-black tracking-widest uppercase">
                                <CircleDot size={8} className="animate-pulse" /> YAYINDA
                             </div>
                          </div>
                          <button onClick={() => openPublicSiteNewTab(site)} className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 border border-white/10 flex items-center justify-center text-[#F2EBE1]/40 hover:text-[#C5A059] hover:border-[#C5A059]/40 transition-all">
                            <ExternalLink size={16} />
                          </button>
                       </div>
                       <div className="grid grid-cols-1 gap-3 relative z-10">
                           <div className="grid grid-cols-2 gap-2 sm:gap-3">
                              <button onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}/analytics`)} className="py-3.5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-white/30 hover:text-[#C5A059] transition-all flex items-center justify-center gap-2">
                                <BarChart3 size={12} /> ANALİTİK
                              </button>
                              <button onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}/settings/design`)} className="py-3.5 bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all flex items-center justify-center gap-2">
                                <Layout size={12} /> TASARIM
                              </button>
                           </div>
                          <button onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}/domain`)} className={`py-3.5 border text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!capabilities?.allowCustomDomain ? 'bg-white/5 border-white/5 text-white/20' : 'bg-[#C5A059]/5 border-[#C5A059]/20 text-[#C5A059] hover:bg-[#C5A059] hover:text-black'}`}>
                            {!capabilities?.allowCustomDomain ? <Lock size={10} /> : <Globe size={10} />} DOMAİN YÖNETİMİ
                          </button>
                        </div>
                     </motion.div>
                   ))}
                 </div>
               )}
            </div>

            <div className="mt-32 pt-20 border-t border-[#C5A059]/10">
               <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                  <div className="max-w-md">
                     <h3 className="text-xl font-serif text-[#F2EBE1] mb-4">Siber Altyapı & Kaynaklar</h3>
                     <p className="text-[10px] sm:text-[11px] text-[#F2EBE1]/40 leading-relaxed font-bold uppercase tracking-[0.15em] sm:tracking-widest">Nova SaaS İmparatorluğu'nun global kaynaklarına buradan erişebilirsiniz.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                     {[
                        { label: 'Domain Rehberi', icon: Globe, path: '/guide' },
                        { label: 'Kurulum (Windows)', icon: Monitor, path: '/download' },
                        { label: 'VIP Akademi', icon: Zap, path: '/services' }
                      ].map((res, i) => (
                       <div key={i} onClick={() => navigate(res.path)} className="group cursor-pointer">
                         <div className="w-12 h-12 bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group-hover:text-[#C5A059] group-hover:border-[#C5A059]/30 transition-all mb-4">
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !isImporting && setShowBulkModal(false)}
                className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-2xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-[#111] border border-white/5 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between p-10 border-b border-white/5 bg-white/[0.01]">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center">
                      <Link className="text-[#C5A059]" size={28} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-serif text-[#F2EBE1]">Link Canavarı</h3>
                      <p className="text-[10px] text-[#F2EBE1]/30 font-black uppercase tracking-[0.2em] mt-1">Shopier Linklerini Toplu İçe Aktar</p>
                    </div>
                  </div>
                  {!isImporting && (
                    <button onClick={() => setShowBulkModal(false)} className="w-12 h-12 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all"><X size={24} /></button>
                  )}
                </div>
                <div className="p-10 space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A059]">Ürün Linkleri</label>
                    <textarea 
                      value={bulkLinks} onChange={(e) => setBulkLinks(e.target.value)} disabled={isImporting}
                      placeholder="https://www.shopier.com/shop/6020521/46527715..."
                      className="w-full h-80 bg-white/[0.02] border border-white/5 p-8 text-[12px] text-white focus:border-[#C5A059]/40 focus:outline-none transition-all font-mono resize-none leading-relaxed"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-10">
                    <button 
                      onClick={handleBulkImport} disabled={isImporting || !bulkLinks.trim()}
                      className="flex items-center gap-6 bg-[#C5A059] text-[#0A0A0A] px-12 py-6 font-black uppercase tracking-widest text-[12px] hover:bg-[#F2EBE1] transition-all"
                    >
                      {isImporting ? <><Loader2 className="animate-spin" size={20} /><span>CANAVAR ÇALIŞIYOR...</span></> : <><Sparkles size={20} /><span>LİNKLERİ CANAVAR GİBİ ÇEK</span></>}
                    </button>
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
