import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Globe, 
  ChevronLeft, 
  ShieldCheck, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Loader2, 
  Zap,
  Lock,
  Server,
  RefreshCcw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthHeaders } from '../utils/authStorage';
import useCapabilities from '../hooks/useCapabilities';

const API_BASE = process.env.REACT_APP_API_URL || '';

export default function DomainManagementPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { capabilities } = useCapabilities();
  
  // States
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sites/${encodeURIComponent(id)}`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (res.ok) {
          setSite(data.site);
          setCustomDomain(data.site.custom_domain || '');
          if (data.site.custom_domain) {
            fetchStatus();
          }
        }
      } catch (e) {
        setError('Mağaza verileri alınamadı.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const fetchStatus = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/api/sites/${encodeURIComponent(id)}/domain-status`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveDomain = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/api/sites/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ customDomain: customDomain.trim().toLowerCase() })
      });
      
      if (res.ok) {
        setSuccess(true);
        fetchStatus();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Alan adı güncellenemedi.');
      }
    } catch (e) {
      setError('Bağlantı hatası.');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
       <Loader2 className="w-8 h-8 text-white animate-spin" />
       <p className="text-[10px] uppercase tracking-[0.4em] text-white font-bold">YÜKLENİYOR</p>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-[#F2EBE1] font-sans selection:bg-white/30 relative overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => navigate('/panel')} className="p-2 hover:bg-white/5 rounded-sm transition-all text-white/50 hover:text-white border border-transparent hover:border-white/5 group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="h-4 sm:h-5 w-px bg-white/10" />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/5 rounded-sm flex items-center justify-center text-white border border-white/10">
              <Globe size={14} className="sm:w-4 sm:h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-medium text-[#F2EBE1] leading-none tracking-tight">Alan Adı Merkezi</h1>
              <p className="text-[7px] sm:text-[8px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Domain Yönetimi</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href={`https://${site?.subdomain}.odelink.shop`} target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-[#0A0A0A] rounded-sm text-[8px] font-bold uppercase tracking-widest transition-all hover:bg-[#F2EBE1]">
            <ExternalLink size={12} /> Görüntüle
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          
          {/* LEFT: DOMAIN CONFIGURATION */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            
            {/* Input Card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-sm p-4 sm:p-6 relative overflow-hidden">
              <div className="relative z-10 space-y-4 sm:space-y-6">
                <div className="space-y-1">
                  <h2 className="text-sm sm:text-base font-medium text-[#F2EBE1] tracking-tight">Alan Adını Bağla</h2>
                  <p className="text-white/40 text-[9px] sm:text-[10px] font-medium max-w-md">
                    "magazam.com" gibi bir alan adını mağazanıza bağlayın.
                  </p>
                </div>

                {!capabilities?.allowCustomDomain ? (
                  <div className="p-4 sm:p-6 border border-white/10 bg-white/5 rounded-sm text-center space-y-3">
                    <div className="w-8 h-8 bg-white/10 text-white rounded-sm flex items-center justify-center mx-auto mb-1">
                      <Lock size={14} />
                    </div>
                    <h3 className="text-xs sm:text-sm font-medium text-white">Profesyonel Plana Özel</h3>
                    <p className="text-[9px] font-medium text-white/40">Özel alan adı özelliği yalnızca Profesyonel planda kullanılabilir.</p>
                    <button onClick={() => navigate('/premium')} className="mt-3 px-4 py-2 bg-white text-black text-[9px] font-bold uppercase tracking-wider rounded-sm hover:bg-[#F2EBE1] transition-colors">
                      Yükselt
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative group/input">
                      <input 
                        type="text" 
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="magazam.com"
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-sm px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-all"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                         {customDomain && (
                           <div className="px-2 py-1 bg-white/10 rounded-sm text-white text-[7px] font-bold uppercase tracking-wider">
                             HAZIR
                           </div>
                         )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-red-500 text-[9px] font-medium">
                          <AlertCircle size={12} /> {error}
                        </motion.div>
                      )}
                      {success && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-emerald-500 text-[9px] font-medium">
                          <CheckCircle2 size={12} /> Bağlandı!
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button 
                      onClick={handleSaveDomain}
                      disabled={saving}
                      className="w-full bg-white text-[#0A0A0A] hover:bg-[#F2EBE1] py-3 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                      MÜHÜRLE
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* DNS Instructions Card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
               <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm sm:text-base font-medium text-white tracking-tight">DNS Yönlendirme</h3>
                    <p className="text-[7px] sm:text-[8px] text-white/40 font-bold uppercase tracking-wider">Bağlantı Talimatları</p>
                  </div>
                  <div className="w-6 h-6 bg-white/5 rounded-sm flex items-center justify-center text-white border border-white/10 hidden sm:flex">
                     <Zap size={12} />
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-sm p-3 space-y-2 hover:border-white/20 transition-colors">
                     <div className="flex items-center justify-between">
                        <span className="text-[7px] text-white/40 font-bold uppercase tracking-wider">Kayıt Tipi</span>
                        <Copy size={10} className="text-white/40 hover:text-white cursor-pointer transition-colors" onClick={() => copyToClipboard('CNAME')} />
                     </div>
                     <p className="text-xs sm:text-sm font-medium text-white">CNAME</p>
                  </div>
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-sm p-3 space-y-2 hover:border-white/20 transition-colors">
                     <div className="flex items-center justify-between">
                        <span className="text-[7px] text-white/40 font-bold uppercase tracking-wider">Hedef (Value)</span>
                        <Copy size={10} className="text-white/40 hover:text-white cursor-pointer transition-colors" onClick={() => copyToClipboard('custom.odelink.shop')} />
                     </div>
                     <p className="text-xs sm:text-sm font-mono text-white">custom.odelink.shop</p>
                  </div>
               </div>

               <div className="p-3 sm:p-4 bg-white/5 rounded-sm border border-white/10 flex gap-3 items-start">
                  <div className="w-6 h-6 bg-white/10 rounded-sm flex items-center justify-center text-white shrink-0">
                     <RefreshCcw size={10} className="animate-spin-slow" />
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-[8px] font-bold text-white uppercase tracking-wider">Aktivasyon</p>
                     <p className="text-[8px] text-white/40">
                       Değişikliklerin algılanması dakikalar içinde aktif olur (maks. 24s).
                     </p>
                  </div>
               </div>
            </div>

            {/* Yonergeler */}
            <div className="bg-white/[0.02] border border-white/5 rounded-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
               <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-medium text-white tracking-tight">Nasıl Bağlanır?</h3>
               </div>

               <div className="space-y-4 sm:space-y-5">
                  {[
                    { step: '1', title: 'Sağlayıcınıza Girin', desc: 'DNS yönetim paneline (Hostinger vb.) giriş yapın.' },
                    { step: '2', title: 'Yeni Kayıt Oluşturun', desc: 'DNS ayarlarından "Yeni Kayıt" (Add Record) seçin.' },
                    { step: '3', title: 'Değerleri Girin', desc: 'Tür: CNAME, İsim: www, Hedef: custom.odelink.shop' },
                    { step: '4', title: 'Kaydedin', desc: 'Kaydedip panele dönerek işlemi tamamlayın.' }
                  ].map((s, i) => (
                    <div key={i} className="flex gap-3 sm:gap-4 group">
                       <div className="text-sm sm:text-base font-medium text-white/20 group-hover:text-white transition-colors">0{s.step}</div>
                       <div className="space-y-0.5">
                          <h4 className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">{s.title}</h4>
                          <p className="text-[8px] sm:text-[9px] text-white/40">{s.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="pt-4 border-t border-white/5">
                  <div className="bg-white/5 rounded-sm p-4 flex flex-col md:flex-row items-center justify-between gap-3">
                     <div className="space-y-0.5 text-center md:text-left">
                        <h4 className="text-[10px] font-medium text-white">Alan adınız yok mu?</h4>
                        <p className="text-[7px] text-white/40 font-bold uppercase tracking-wider">Hostinger altyapısını öneririz.</p>
                     </div>
                     <a 
                      href="https://www.hostinger.com/tr" 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-4 py-2.5 w-full md:w-auto text-center bg-white text-black rounded-sm text-[8px] font-bold uppercase tracking-wider hover:bg-[#F2EBE1] transition-all"
                     >
                        HOSTINGER
                     </a>
                  </div>
               </div>
            </div>

          </div>

          {/* RIGHT: STATUS & INTELLIGENCE */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
             
             {/* Live Status Panel */}
             <div className="bg-white/[0.02] border border-white/5 rounded-sm p-4 sm:p-6 space-y-4 sm:space-y-6 sticky top-20">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <h3 className="text-[9px] font-bold text-white uppercase tracking-wider">Durum</h3>
                   </div>
                   <button onClick={fetchStatus} className="p-1.5 hover:bg-white/5 rounded-sm text-white/40 transition-all">
                      <RefreshCcw size={12} className={refreshing ? 'animate-spin' : ''} />
                   </button>
                </div>

                <div className="space-y-2 sm:space-y-3">
                   <StatusCard label="Bağlantı" status={status?.status === 'active' ? 'Bağlantı Kuruldu' : status?.status ? 'Doğrulanıyor' : 'Beklemede'} icon={Server} active={status?.status === 'active'} color="text-white" />
                   <StatusCard label="SSL" status={status?.sslStatus === 'active' ? 'Aktif (HTTPS)' : status?.sslStatus ? 'Sertifika Hazırlanıyor' : 'Beklemede'} icon={Lock} active={status?.sslStatus === 'active'} color="text-white" />
                   <StatusCard label="Nova Shield" status="Aktif" icon={ShieldCheck} active={true} color="text-white" />
                </div>

                <div className="h-px bg-white/5" />

                <div className="space-y-2">
                   <p className="text-[7px] font-bold text-white/40 uppercase tracking-wider">Sistem</p>
                   <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-1 bg-white/5 rounded-sm text-[7px] font-bold text-white/50 uppercase tracking-wider border border-white/5">IP: 89.144.10.94</span>
                      <span className="px-2 py-1 bg-white/5 rounded-sm text-[7px] font-bold text-white/50 uppercase tracking-wider border border-white/5">CDN: Global Edge</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const StatusCard = ({ label, status, icon: Icon, active, color = "text-emerald-500" }) => (
  <div className="flex items-center gap-3 p-3 bg-[#0A0A0A] border border-white/5 rounded-sm hover:border-white/10 transition-all">
     <div className={`w-8 h-8 ${active ? color : 'text-white/20'} bg-white/5 rounded-sm flex items-center justify-center border border-white/5`}>
        <Icon size={12} />
     </div>
     <div className="flex-1">
        <p className="text-[7px] text-white/40 font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'text-white' : 'text-white/40'}`}>{status}</p>
     </div>
     {active && <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
  </div>
);
