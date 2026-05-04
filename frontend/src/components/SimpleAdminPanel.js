import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Monitor, ShieldCheck, Settings, LogOut, 
  Search, RefreshCw, MoreHorizontal, ChevronRight, ArrowUpRight, 
  Zap, Globe, Activity, CheckCircle2, X, CreditCard, Clock, Trash2, 
  AlertTriangle, Server, Database, Lock, Terminal, MousePointer2,
  Megaphone, HardDrive, Cpu, BarChart3
} from 'lucide-react';
import io from 'socket.io-client';
import confetti from 'canvas-confetti';
import { Toaster, toast } from 'sonner';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';
import BrandLogo from './BrandLogo';
import { getAuthToken } from '../utils/authStorage';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5000'
    : '');

const SimpleAdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTick, setRefreshTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [adminOverview, setAdminOverview] = useState(null);
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminSites, setAdminSites] = useState([]);
  const [adminIpLogs, setAdminIpLogs] = useState([]);
  const [chartData, setChartData] = useState([]);
  
  // System States
  const [systemStats, setSystemStats] = useState({ cpu: 0, ram: 0, db: 0 });
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // Modals/Actions
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Socket.io for Real-time Matrix Feed
  const [liveFeed, setLiveFeed] = useState([]);
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    // Initialize Neural Bridge (Socket.io)
    const socket = io(API_BASE, {
      auth: { token },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('✅ Neural Bridge Connected');
      toast.info('Sinir Ağı Bağlantısı Kuruldu', { icon: <Zap className="text-blue-500" /> });
    });

    socket.on('new_visit', (data) => {
      setLiveFeed(prev => [{ ...data, type: 'visit', id: Date.now() }, ...prev].slice(0, 50));
      setActiveVisitors(v => v + 1);
    });

    socket.on('security_event', (data) => {
      setLiveFeed(prev => [{ ...data, type: 'security', id: Date.now() }, ...prev].slice(0, 50));
      toast.error(`Güvenlik Olayı: ${data.message}`);
    });

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        if (activeTab === 'dashboard') {
          const [overviewRes, visitorsRes, hourlyRes] = await Promise.all([
            fetch(`${API_BASE}/api/admin/overview`, { headers }),
            fetch(`${API_BASE}/api/metrics/active-visitors`, { headers }),
            fetch(`${API_BASE}/api/admin/hourly-stats`, { headers })
          ]);
          
          if (overviewRes.ok) {
            const data = await overviewRes.json();
            setAdminOverview(data?.overview);
          }
          if (visitorsRes.ok) {
            const data = await visitorsRes.json();
            setActiveVisitors(data?.activeVisitors || 0);
          }
          if (hourlyRes.ok) {
            const data = await hourlyRes.json();
            setChartData(data?.hourly || []);
          }
        }
        if (activeTab === 'users') {
          const res = await fetch(`${API_BASE}/api/admin/users`, { headers });
          const data = await res.json();
          if (res.ok) setAdminUsers(data?.users || []);
        }
        if (activeTab === 'sites') {
          const res = await fetch(`${API_BASE}/api/admin/sites`, { headers });
          const data = await res.json();
          if (res.ok) setAdminSites(data?.sites || []);
        }
        if (activeTab === 'ip') {
          const res = await fetch(`${API_BASE}/api/admin/ip-logs`, { headers });
          const data = await res.json();
          if (res.ok) setAdminIpLogs(data?.logs || []);
        }
      } catch (e) { void e; }
    };

    const fetchSystemStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/system-stats`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setSystemStats(await res.json());
      } catch (e) { void e; }
    };

    fetchData();
    fetchSystemStats();
    const interval = setInterval(fetchSystemStats, 10000); // System stats every 10s

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [activeTab, refreshTick]);

  // Actions
  const handleSiteStatus = async (siteId, currentStatus) => {
    const token = getAuthToken();
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/sites/${siteId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Mağaza ${newStatus === 'active' ? 'Aktifleştirildi' : 'Durduruldu'}`);
        setRefreshTick(t => t + 1);
      }
    } catch (e) { toast.error('Hata oluştu'); }
    finally { setActionLoading(false); }
  };

  const handleAssignPlan = async (userId, planTier, billingCycle) => {
    const token = getAuthToken();
    setActionLoading(true);
    try {
      const endpoint = planTier 
        ? `${API_BASE}/api/admin/users/${userId}/subscription`
        : `${API_BASE}/api/admin/users/${userId}/subscription/cancel`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: planTier ? JSON.stringify({ planName: planTier, billingCycle }) : JSON.stringify({})
      });
      if (res.ok) {
        toast.success(planTier ? 'Abonelik Planı Güncellendi' : 'Abonelik İptal Edildi');
        setIsPlanModalOpen(false);
        setRefreshTick(t => t + 1);
      } else {
        const err = await res.json();
        toast.error(err.error || 'İşlem başarısız');
      }
    } catch (e) { toast.error('Hata oluştu'); }
    finally { setActionLoading(false); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı ve tüm verilerini silmek istediğine emin misin CEO?')) return;
    const token = getAuthToken();
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Kullanıcı sistemden silindi');
        setRefreshTick(t => t + 1);
      }
    } catch (e) { toast.error('Silme işlemi başarısız'); }
    finally { setActionLoading(false); }
  };

  const handleDeleteSite = async (siteId) => {
    if (!window.confirm('DİKKAT: Bu mağaza siber yörüngeden KÖKTEN SİLİNECEK! Emin misin CEO?')) return;
    const token = getAuthToken();
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/sites/${siteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Mağaza Kökten Silindi');
        confetti();
        setRefreshTick(t => t + 1);
      }
    } catch (e) { toast.error('Silme işlemi başarısız'); }
    finally { setActionLoading(false); }
  };

  const toggleMaintenance = async () => {
    const next = !maintenanceMode;
    const token = getAuthToken();
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/maintenance/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled: next })
      });
      if (res.ok) {
        setMaintenanceMode(next);
        toast[next ? 'error' : 'success'](next ? 'Sistem Bakım Moduna Alındı' : 'Sistem Yayına Açıldı');
      }
    } catch (e) { toast.error('Bakım modu değiştirilemedi'); }
    finally { setActionLoading(false); }
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    const token = getAuthToken();
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: broadcastMsg })
      });
      if (res.ok) {
        toast.success('Küresel Duyuru Yayınlandı');
        setBroadcastMsg('');
        setIsBroadcastModalOpen(false);
      }
    } catch (e) { toast.error('Duyuru yayınlanamadı'); }
    finally { setActionLoading(false); }
  };

  const handleClearCache = async () => {
    const token = getAuthToken();
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/cache/clear`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) toast.success('Sistem Önbelleği Temizlendi');
    } catch (e) { toast.error('Önbellek temizlenemedi'); }
    finally { setActionLoading(false); }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Özet Panel', icon: LayoutDashboard },
    { id: 'users', label: 'Müşteriler', icon: Users },
    { id: 'sites', label: 'Vitrinler', icon: Monitor },
    { id: 'ip', label: 'Güvenlik & IP', icon: ShieldCheck },
    { id: 'settings', label: 'Sistem', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#08090A] text-[#E1E1E1] flex font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0C0D0E] border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center px-8 border-b border-white/5">
            <BrandLogo withText size={30} textClassName="text-white text-lg font-bold tracking-tight" />
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  activeTab === item.id 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                <item.icon size={18} className={activeTab === item.id ? 'text-blue-400' : ''} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/5">
            <button 
              onClick={() => { localStorage.removeItem('nova_ceo_session_v1'); window.location.reload(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-400 transition-colors text-sm font-medium"
            >
              <LogOut size={18} /> Oturumu Kapat
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col relative">
        <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#08090A]/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400"><MoreHorizontal size={24} /></button>
             <h1 className="text-lg font-bold text-white tracking-tight">{menuItems.find(i => i.id === activeTab)?.label}</h1>
             <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded border border-blue-500/20 uppercase tracking-widest">CEO</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
               <input 
                 type="text" 
                 placeholder="Sistemde ara..." 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 className="w-64 bg-white/5 border border-white/10 rounded-lg px-10 py-2 text-sm focus:outline-none focus:border-white/20 transition-all"
               />
               <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            <button 
              onClick={() => setRefreshTick(t => t + 1)}
              className="p-2 text-gray-500 hover:text-white transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-8 lg:p-12 space-y-6 sm:space-y-10 max-w-7xl mx-auto w-full overflow-hidden">
           {activeTab === 'dashboard' && (
             <div className="space-y-6 sm:space-y-10">
                {/* CYBER ANALYTICS HEADER */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   <DataCard title="Toplam Müşteri" value={adminOverview?.total_users || '0'} icon={Users} color="blue" trend="+12%" />
                   <DataCard title="Canlı Vitrinler" value={adminOverview?.total_sites || '0'} icon={Monitor} color="emerald" trend="+5%" />
                   <DataCard title="Abonelik Gücü" value={adminOverview?.active_subscriptions || '0'} icon={Zap} color="indigo" trend="Stabil" />
                   <DataCard title="Anlık Siber Trafik" value={activeVisitors} icon={Activity} color="rose" pulse trend="Live" />
                </div>

                <div className="bg-[#0C0D0E]/50 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 sm:mb-12">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-3">
                        <BarChart3 className="text-blue-500" />
                        Küresel Trafik Analizi
                      </h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Sistem genelindeki anlık etkileşim yoğunluğu</p>
                    </div>
                  </div>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{backgroundColor: '#0C0D0E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff'}}
                          itemStyle={{color: '#3b82f6', fontWeight: 'bold'}}
                        />
                        <Area type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* REAL-TIME COMMAND CENTER FEED */}
                <div className="grid lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 space-y-8">
                      <SectionBox title="Canlı Sinir Ağı (Live Feed)">
                         <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {liveFeed.length > 0 ? (
                              <AnimatePresence initial={false}>
                                {liveFeed.map(item => (
                                   <motion.div 
                                     initial={{ opacity: 0, y: -10, filter: 'blur(5px)' }} 
                                     animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                     key={item.id} 
                                     className={`flex items-center justify-between p-4 bg-white/5 rounded-2xl border ${item.type === 'security' ? 'border-red-500/30 bg-red-500/5' : 'border-white/5'} hover:bg-white/[0.08] transition-all`}
                                   >
                                      <div className="flex items-center gap-4">
                                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'security' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            {item.type === 'security' ? <ShieldCheck size={18} /> : <MousePointer2 size={18} />}
                                         </div>
                                         <div>
                                            <div className="text-[13px] font-bold text-white tracking-tight">
                                               {item.type === 'security' ? item.message : `${item.host} ziyaret edildi`}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-medium font-mono">{item.path || '/'}</div>
                                         </div>
                                      </div>
                                      <div className="text-right">
                                         <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Canlı</div>
                                         <div className="text-[8px] text-gray-700 font-mono mt-1">{new Date().toLocaleTimeString()}</div>
                                      </div>
                                   </motion.div>
                                ))}
                              </AnimatePresence>
                            ) : (
                               <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                                  <div className="w-12 h-12 rounded-full border-2 border-white/5 border-t-blue-500 animate-spin" />
                                  <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Sinir Ağı Veri Bekliyor...</span>
                               </div>
                            )}
                         </div>
                      </SectionBox>
                   </div>

                   <div className="space-y-8">
                      <SectionBox title="Sistem Kaynakları">
                         <div className="space-y-8 py-2">
                            <MiniChart label="CPU Sinyali" value={systemStats.cpu} color="blue" icon={Cpu} />
                            <MiniChart label="RAM Havuzu" value={systemStats.ram} color="emerald" icon={Server} />
                            <MiniChart label="DB Sağlığı" value={systemStats.db} color="indigo" icon={Database} />
                         </div>
                      </SectionBox>

                      <SectionBox title="CEO Aksiyon Merkezi">
                         <div className="grid grid-cols-1 gap-3">
                            <ActionButton icon={Megaphone} label="Genel Duyuru" onClick={() => setIsBroadcastModalOpen(true)} color="blue" />
                            <ActionButton icon={RefreshCw} label="Önbellekleri Sıfırla" onClick={handleClearCache} color="emerald" />
                            <ActionButton icon={AlertTriangle} label={maintenanceMode ? "Bakımı Sonlandır" : "Bakıma Al"} onClick={toggleMaintenance} color="rose" />
                         </div>
                      </SectionBox>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'users' && (
             <SectionBox title="Müşteri Portföyü">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                   {/* Desktop View Table */}
                   <table className="hidden md:table w-full text-left">
                      <thead className="border-b border-white/5">
                         <tr>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Kullanıcı</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Plan Bilgisi</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Mağazalar</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Yönetim</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {adminUsers.filter(u => {
                            const q = searchQuery.toLowerCase();
                            return q ? `${u.name} ${u.email}`.toLowerCase().includes(q) : true;
                         }).map(u => (
                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                               <td className="px-6 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 font-bold text-sm uppercase group-hover:text-white transition-colors">{u.email[0]}</div>
                                     <div>
                                        <div className="text-sm font-bold text-white">{u.name || 'İsimsiz Müşteri'}</div>
                                        <div className="text-[11px] text-gray-500 font-medium">{u.email}</div>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-6">
                                  <div className="flex flex-col gap-1">
                                     <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded w-fit ${u.subscription_name ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-500'}`}>
                                        {u.subscription_name ? (u.subscription_name === 'profesyonel' ? 'PRO ÜYE' : 'STANDART') : 'FREE'}
                                     </span>
                                     <span className="text-[9px] text-gray-600 font-medium uppercase tracking-tight">{u.billing_cycle === 'yearly' ? 'Yıllık Dönem' : 'Aylık Dönem'}</span>
                                  </div>
                               </td>
                               <td className="px-6 py-6">
                                  <span className="text-sm font-bold text-gray-400">{u.total_sites} Adet</span>
                               </td>
                               <td className="px-6 py-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                     <button 
                                       onClick={() => { setSelectedUser(u); setIsPlanModalOpen(true); }}
                                       className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest"
                                     >
                                        Plan Değiştir
                                     </button>
                                     <button 
                                       onClick={() => handleDeleteUser(u.id)}
                                       className="p-1.5 text-gray-700 hover:text-red-500 transition-colors"
                                     >
                                        <Trash2 size={16} />
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>

                   {/* Mobile View Cards */}
                   <div className="md:hidden space-y-4 px-4">
                      {adminUsers.filter(u => {
                         const q = searchQuery.toLowerCase();
                         return q ? `${u.name} ${u.email}`.toLowerCase().includes(q) : true;
                      }).map(u => (
                         <div key={u.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-5">
                            <div className="flex justify-between items-start">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm uppercase">{u.email[0]}</div>
                                  <div>
                                     <div className="text-sm font-bold text-white">{u.name || 'İsimsiz'}</div>
                                     <div className="text-[10px] text-gray-500 font-medium truncate max-w-[120px]">{u.email}</div>
                                  </div>
                               </div>
                               <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${u.subscription_name?.toLowerCase().includes('pro') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                  {u.subscription_name || 'FREE'}
                               </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold py-4 border-y border-white/5">
                               <div className="text-gray-500 uppercase tracking-widest">Mağazalar: <span className="text-white">{u.total_sites} ADET</span></div>
                               <div className="text-gray-500 uppercase tracking-widest">Dönem: <span className="text-white">{u.billing_cycle === 'yearly' ? 'YILLIK' : 'AYLIK'}</span></div>
                            </div>
                            <div className="flex gap-2 pt-1">
                               <button 
                                 onClick={() => { setSelectedUser(u); setIsPlanModalOpen(true); }}
                                 className="flex-1 py-3 bg-blue-600 rounded-xl text-[9px] font-black text-white uppercase tracking-widest shadow-lg shadow-blue-900/20"
                               >
                                  Plan Yönet
                                </button>
                               <button 
                                 onClick={() => handleDeleteUser(u.id)}
                                 className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center justify-center"
                               >
                                  <Trash2 size={16} />
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </SectionBox>
           )}

           {activeTab === 'sites' && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {adminSites.filter(s => {
                     const q = searchQuery.toLowerCase();
                     return q ? `${s.subdomain} ${s.owner_email}`.toLowerCase().includes(q) : true;
                  }).map(site => (
                     <div key={site.id} className="bg-[#0C0D0E]/50 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 hover:border-white/20 transition-all flex flex-col group relative overflow-hidden shadow-2xl">
                        <div className={`absolute -top-12 -right-12 w-24 h-24 blur-[40px] opacity-10 rounded-full ${site.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        
                        <div className="flex items-center justify-between mb-10 relative z-10">
                           <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center ${site.status === 'active' ? 'text-emerald-400' : 'text-rose-400'} shadow-inner`}>
                              <Monitor size={28} />
                           </div>
                           <div className="flex flex-col items-end gap-2">
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border flex items-center gap-2 ${site.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${site.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                                 {site.status === 'active' ? 'AKTİF' : 'DURDURULDU'}
                              </span>
                           </div>
                        </div>

                        <div className="flex-1 relative z-10">
                           <h3 className="text-xl font-bold text-white mb-1 tracking-tight group-hover:text-blue-400 transition-colors">{site.subdomain}</h3>
                           <p className="text-[12px] text-gray-500 font-medium truncate mb-8">{site.owner_email}</p>
                           
                           <div className="grid grid-cols-2 gap-6 py-6 border-y border-white/5 mb-10">
                              <div>
                                 <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-1">TEMA</div>
                                 <div className="text-[13px] font-bold text-white/80 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                                    {site.theme?.toUpperCase() || 'MODERN'}
                                 </div>
                              </div>
                              <div className="text-right">
                                 <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-1">GÖRÜNTÜLEME</div>
                                 <div className="text-[13px] font-bold text-white/80">0</div>
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-3 relative z-10 mt-auto">
                           <button 
                             onClick={() => window.open(`https://${site.subdomain}.odelink.shop`, '_blank')}
                             className="flex-1 py-4 bg-white/5 border border-white/5 rounded-2xl text-[11px] font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                           >
                              ÖNİZLE
                           </button>
                           <button 
                             onClick={() => handleSiteStatus(site.id, site.status)}
                             className={`flex-1 py-4 rounded-2xl text-[11px] font-bold transition-all uppercase tracking-widest border ${site.status === 'active' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'}`}
                           >
                              {site.status === 'active' ? 'DURDUR' : 'YAYINLA'}
                           </button>
                           <button 
                             onClick={() => handleDeleteSite(site.id)}
                             title="Mağazayı Kökten Sil"
                             className="w-14 h-14 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-900/10"
                           >
                              <Trash2 size={20} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}

           {activeTab === 'ip' && (
              <SectionBox title="Güvenlik Günlüğü">
                 <div className="overflow-x-auto -mx-4 sm:mx-0">
                    {/* Desktop View Table */}
                    <table className="hidden md:table w-full text-left">
                       <thead className="border-b border-white/5">
                          <tr>
                             <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Kullanıcı</th>
                             <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">IP Adresi</th>
                             <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Olay Tipi</th>
                             <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tarih</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {adminIpLogs.slice(0, 50).map(l => (
                             <tr key={l.id} className="hover:bg-white/[0.01] transition-colors">
                                <td className="px-6 py-4 text-xs font-bold text-white truncate max-w-[200px]">{l.email || 'Ziyaretçi'}</td>
                                <td className="px-6 py-4"><code className="text-[11px] text-blue-400 font-mono bg-blue-400/5 px-2 py-0.5 rounded">{l.ip}</code></td>
                                <td className="px-6 py-4"><span className="text-[9px] font-bold text-gray-500 uppercase px-1.5 py-0.5 bg-white/5 rounded border border-white/10">{l.event_type}</span></td>
                                <td className="px-6 py-4 text-[10px] text-gray-600 font-medium uppercase tracking-tight">{new Date(l.created_at).toLocaleString()}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>

                    {/* Mobile View Cards */}
                    <div className="md:hidden space-y-4 px-4">
                       {adminIpLogs.slice(0, 30).map(l => (
                          <div key={l.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-3">
                             <div className="flex justify-between items-center">
                                <div className="text-xs font-bold text-white truncate max-w-[150px]">{l.email || 'Ziyaretçi'}</div>
                                <span className="text-[8px] font-bold text-gray-500 uppercase px-1.5 py-0.5 bg-white/5 rounded border border-white/10">{l.event_type}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <code className="text-[10px] text-blue-400 font-mono bg-blue-400/5 px-2 py-0.5 rounded">{l.ip}</code>
                                <div className="text-[9px] text-gray-600 font-medium uppercase tracking-tight">{new Date(l.created_at).toLocaleDateString()}</div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </SectionBox>
           )}

           {activeTab === 'settings' && (
              <div className="space-y-8 max-w-4xl">
                 <SectionBox title="Sistem Kontrolü">
                    <div className="space-y-6">
                       <ControlRow 
                         title="Bakım Modu" 
                         desc="Tüm kullanıcı erişimini geçici olarak kısıtlar ve 'Bakım' sayfasını gösterir."
                         action={
                            <button 
                              onClick={toggleMaintenance}
                              className={`px-4 py-2 border rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${maintenanceMode ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'}`}
                            >
                               {maintenanceMode ? 'Yayına Al' : 'Aktifleştir'}
                            </button>
                         }
                       />
                       <ControlRow 
                         title="Sistem Önbelleği" 
                         desc="Tüm vitrin ve ürün önbelleklerini temizleyerek verileri tazeler."
                         action={<button onClick={handleClearCache} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest">Temizle</button>}
                       />
                       <ControlRow 
                         title="Küresel Duyuru" 
                         desc="Tüm kullanıcıların mağaza panellerinde görünecek bir bildirim yayınlar."
                         action={<button onClick={() => setIsBroadcastModalOpen(true)} className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Duyuru Yap</button>}
                       />
                    </div>
                 </SectionBox>
              </div>
           )}
        </div>
      </main>

      <AnimatePresence>
        {isBroadcastModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/90 backdrop-blur-md"
               onClick={() => setIsBroadcastModalOpen(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}
               className="relative w-full max-w-lg bg-[#0C0D0E] border border-white/10 rounded-2xl p-10 shadow-3xl"
             >
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
                      <Megaphone size={20} className="text-blue-500" />
                      Küresel Duyuru
                   </h3>
                   <button onClick={() => setIsBroadcastModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                </div>
                <textarea 
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  placeholder="Duyuru mesajını yazın... (Tüm kullanıcılara anlık iletilecek)"
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none mb-6"
                />
                <button 
                  onClick={sendBroadcast}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                >
                   YAYINLA VE GÖNDER
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPlanModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
               onClick={() => setIsPlanModalOpen(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}
               className="relative w-full max-w-2xl bg-[#0C0D0E] border border-white/10 rounded-2xl p-10 shadow-3xl"
             >
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Plan Yönetimi</h3>
                      <p className="text-[11px] text-gray-500 font-medium mt-1">{selectedUser.email}</p>
                   </div>
                   <button onClick={() => setIsPlanModalOpen(false)} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <PlanOption 
                     title="Standart Paket"
                     cycle="Aylık"
                     price="299 TL"
                     desc="Mağaza başına aylık ücretlendirme."
                     active={selectedUser.subscription_name?.toLowerCase() === 'standart'}
                     onClick={() => handleAssignPlan(selectedUser.id, 'standart', 'monthly')}
                   />
                   <PlanOption 
                     title="Profesyonel"
                     cycle="Yıllık"
                     price="399 TL"
                     desc="CEO Tavsiyesi: En popüler yıllık paket."
                     highlight
                     active={selectedUser.subscription_name?.toLowerCase() === 'profesyonel'}
                     onClick={() => handleAssignPlan(selectedUser.id, 'profesyonel', 'yearly')}
                   />
                </div>

                <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-between">
                   <p className="text-[10px] text-gray-600 font-medium flex items-center gap-2">
                      <Clock size={12} /> Seçim yapıldığı an yetkiler güncellenir.
                   </p>
                   <button 
                     onClick={() => handleAssignPlan(selectedUser.id, null, null)}
                     className="text-red-500 text-[11px] font-bold hover:underline transition-all"
                   >
                      Aboneliği Tamamen İptal Et
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Toaster position="top-right" theme="dark" richColors closeButton expand={false} />
    </div>
  );
};

const DataCard = ({ title, value, icon: Icon, color, pulse }) => {
  const colors = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400'
  };

  return (
    <div className="bg-[#0C0D0E] border border-white/5 p-8 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all">
       <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
                <Icon size={20} />
             </div>
             {pulse && <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shadow-[0_0_10px_rgba(244,63,94,0.5)]" />}
          </div>
          <div>
             <div className="text-3xl font-bold text-white tracking-tighter mb-0.5">{value}</div>
             <div className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">{title}</div>
          </div>
       </div>
       <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
          <Icon size={64} />
       </div>
    </div>
  );
};

const MiniChart = ({ label, value, color, icon: Icon }) => {
  const colors = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500'
  };
  return (
    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
       <div className="flex items-center gap-2 text-gray-500 mb-3">
          <Icon size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
       </div>
       <div className="flex items-end gap-2 mb-2">
          <span className="text-2xl font-bold text-white leading-none">%{value}</span>
       </div>
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full ${colors[color]} rounded-full`} style={{ width: `${value}%` }} />
       </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, onClick, color }) => {
  const colors = {
    blue: 'text-blue-400 hover:bg-blue-500/10 border-blue-500/10 hover:border-blue-500/20',
    emerald: 'text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-500/20',
    rose: 'text-rose-400 hover:bg-rose-500/10 border-rose-500/10 hover:border-rose-500/20'
  };
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between p-4 border rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest ${colors[color]}`}
    >
       <div className="flex items-center gap-3">
          <Icon size={16} />
          {label}
       </div>
       <ChevronRight size={14} />
    </button>
  );
};

const ProgressBar = ({ label, count, total, color }) => {
  const percent = Math.min(100, Math.round((count / total) * 100)) || 0;
  const colors = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    gray: 'bg-gray-600'
  };
  return (
    <div className="space-y-2">
       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
          <span className="text-gray-500">{label}</span>
          <span className="text-white">{count} ({percent}%)</span>
       </div>
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full ${colors[color]} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
       </div>
    </div>
  );
};

const SectionBox = ({ title, children }) => (
  <div className="bg-[#0C0D0E] border border-white/5 rounded-2xl p-8 overflow-hidden shadow-sm h-full flex flex-col">
     <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 border-l-2 border-blue-500 pl-4">{title}</h3>
     <div className="flex-1">{children}</div>
  </div>
);

const HealthRow = ({ label, status, color }) => {
  const colors = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500'
  };
  return (
    <div className="flex items-center justify-between">
       <span className="text-sm font-medium text-gray-500">{label}</span>
       <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-tight">{status}</span>
          <div className={`w-1.5 h-1.5 rounded-full ${colors[color]}`} />
       </div>
    </div>
  );
};

const ControlRow = ({ title, desc, action }) => (
  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
     <div>
        <div className="text-sm font-bold text-white mb-0.5">{title}</div>
        <div className="text-[11px] text-gray-500 font-medium">{desc}</div>
     </div>
     {action}
  </div>
);

const PlanOption = ({ title, cycle, price, desc, active, onClick, highlight }) => (
  <button 
    onClick={onClick}
    className={`p-8 rounded-xl border text-left transition-all relative group flex flex-col gap-4 ${active ? 'bg-blue-500/5 border-blue-500' : 'bg-white/[0.02] border-white/10 hover:border-white/20'} ${highlight && !active ? 'border-amber-500/30' : ''}`}
  >
     <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${highlight ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-500'}`}>
           {cycle} DÖNEM
        </span>
        {active && <CheckCircle2 size={18} className="text-blue-500" />}
     </div>
     <div>
        <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
        <div className="text-2xl font-bold text-white tracking-tight">{price}</div>
     </div>
     <p className="text-[11px] text-gray-600 font-medium leading-relaxed">{desc}</p>
     <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Seçimi Uygula <ArrowUpRight size={12} />
     </div>
  </button>
);

export default SimpleAdminPanel;
