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
  Monitor
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getApiBase } from '../utils/apiBase';
import { getAuthHeaders, getAuthToken } from '../utils/authStorage';

const API_BASE = getApiBase();
const DASH_CACHE_KEY = 'odelink_cache_dashboard_v1';
const PUBLIC_SITE_CACHE_PREFIX = 'odelink_cache_public_site_v1:';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

  const didWarmPrefetchRef = useRef(false);

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
    } catch (e) {
      void e;
    }

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
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Rapor indirilemedi');
      }

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
      {/* Background Ornaments */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#C5A059]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-0 w-[40%] h-[40%] bg-[#C5A059]/3 blur-[100px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-32 relative">
        {/* Header Section */}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { 
              label: 'Toplam Site', 
              value: stats?.total_sites || 0, 
              icon: Globe, 
              sub: `${stats?.active_sites || 0} Aktif Vitrin` 
            },
            { 
              label: 'Üyelik Durumu', 
              value: capabilities?.tier === 'profesyonel' ? 'PRO' : 'STANDART', 
              icon: Crown, 
              isPlan: true,
              sub: capabilities?.tier === 'profesyonel' ? 'Sınırsız Ayrıcalık' : 'Temel Özellikler' 
            },
            { 
              label: 'Son 30 Gün', 
              value: stats?.recent_sites || 0, 
              icon: TrendingUp, 
              sub: 'Yeni Oluşturulan Siteler' 
            }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white/[0.02] border p-5 sm:p-8 relative group transition-all rounded-sm ${stat.isPlan && capabilities?.tier === 'profesyonel' ? 'border-[#C5A059]/40 bg-[#C5A059]/5' : 'border-white/5 hover:border-[#C5A059]/30'}`}
            >
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

        {/* Premium Benefits Banner */}
        {capabilities?.tier === 'profesyonel' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/[0.03] border border-white/5 p-5 sm:p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6"
          >
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
              <button 
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className="flex-1 px-4 py-3 border border-[#C5A059]/30 text-[8px] font-black uppercase tracking-widest text-[#C5A059] hover:bg-[#C5A059] hover:text-black transition-all flex items-center justify-center gap-2"
              >
                {isDownloading ? <Loader2 size={10} className="animate-spin" /> : <Download size={10} />} 
                RAPOR
              </button>
              <button 
                onClick={() => navigate('/vip-support')}
                className="flex-1 px-4 py-3 bg-[#F2EBE1] text-[#0A0A0A] text-[8px] font-black uppercase tracking-widest hover:bg-[#C5A059] transition-all flex items-center justify-center gap-2"
              >
                <Headphones size={10} /> DESTEK
              </button>
            </div>
          </motion.div>
        )}

        {/* Sites Section */}
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
                 <motion.div 
                   key={site.id}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.1 }}
                   className="bg-white/[0.02] border border-[#C5A059]/10 p-6 sm:p-10 relative group overflow-hidden"
                 >
                   {/* Background Subdomain Decor */}
                   <div className="absolute -bottom-8 -right-8 text-7xl font-serif text-[#C5A059]/5 select-none pointer-events-none uppercase">
                     {site.subdomain}
                   </div>

                   <div className="flex justify-between items-start mb-10 relative z-10">
                      <div>
                         <h3 className="text-xl sm:text-2xl font-serif text-[#F2EBE1] mb-1">{site.name}</h3>
                         <div className="flex items-center gap-2 text-[8px] text-[#C5A059] font-black tracking-widest uppercase">
                            <CircleDot size={8} className="animate-pulse" /> YAYINDA
                         </div>
                      </div>
                      <button 
                        onClick={() => openPublicSiteNewTab(site)}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 border border-white/10 flex items-center justify-center text-[#F2EBE1]/40 hover:text-[#C5A059] hover:border-[#C5A059]/40 transition-all"
                      >
                        <ExternalLink size={16} />
                      </button>
                   </div>

                   <div className="grid grid-cols-1 gap-3 relative z-10">
                       <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <button 
                            onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}/analytics`)}
                            className="py-3.5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-white/30 hover:text-[#C5A059] transition-all flex items-center justify-center gap-2"
                          >
                            <BarChart3 size={12} /> ANALİTİK
                          </button>
                          <button 
                            onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}/settings/design`)}
                            className="py-3.5 bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <Layout size={12} /> TASARIM
                          </button>
                       </div>
                      <button 
                        onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}/domain`)}
                        className={`py-3.5 border text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!capabilities?.allowCustomDomain ? 'bg-white/5 border-white/5 text-white/20' : 'bg-[#C5A059]/5 border-[#C5A059]/20 text-[#C5A059] hover:bg-[#C5A059] hover:text-black'}`}
                      >
                        {!capabilities?.allowCustomDomain ? <Lock size={10} /> : <Globe size={10} />} 
                        DOMAİN YÖNETİMİ
                        {!capabilities?.allowCustomDomain && <span className="ml-2 px-1.5 py-0.5 bg-[#C5A059] text-[#0A0A0A] text-[6px] font-black">PRO</span>}
                      </button>
                    </div>

                 </motion.div>
               ))}
             </div>
           )}
        </div>

        {/* Resources Section */}
        <div className="mt-32 pt-20 border-t border-[#C5A059]/10">
           <div className="flex flex-col md:flex-row justify-between items-start gap-12">
              <div className="max-w-md">
                 <h3 className="text-xl font-serif text-[#F2EBE1] mb-4">Siber Altyapı & Kaynaklar</h3>
                 <p className="text-[10px] sm:text-[11px] text-[#F2EBE1]/40 leading-relaxed font-bold uppercase tracking-[0.15em] sm:tracking-widest">
                   Nova SaaS İmparatorluğu'nun global kaynaklarına buradan erişebilirsiniz. Özel alan adı bağlantıları, SSL sertifikaları ve VIP teknik destek dökümantasyonları merkezidir.
                 </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                 {[
                    { label: 'Domain Rehberi', icon: Globe, path: '/guide' },
                    { label: 'Kurulum (Windows)', icon: Monitor, path: '/download' },
                    { label: 'VIP Akademi', icon: Zap, path: '/services' }
                  ].map((res, i) => (
                   <div 
                     key={i}
                     onClick={() => navigate(res.path)}
                     className="group cursor-pointer"
                   >
                     <div className="w-12 h-12 bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group-hover:text-[#C5A059] group-hover:border-[#C5A059]/30 transition-all mb-4">
                       <res.icon size={20} />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#F2EBE1]/40 group-hover:text-white transition-colors">{res.label}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

const ShieldCheck = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);

export default UserPanel;
