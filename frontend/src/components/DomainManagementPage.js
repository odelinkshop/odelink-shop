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
    <div className="min-h-screen bg-[#08090A] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Globe className="text-blue-500 w-8 h-8 animate-pulse" />
        </div>
      </div>
      <div className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500">Domain Command Center</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#08090A] text-[#E1E1E1] font-sans selection:bg-blue-500/30">
      
      {/* HEADER SECTION */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0C0D0E]/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/panel')} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-gray-500 hover:text-white border border-transparent hover:border-white/5 group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.15)]">
              <Globe size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-white leading-none tracking-tight">Özel Alan Adı Merkezi</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">{site?.name} • Elite Domain Management</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a href={`https://${site?.subdomain}.odelink.shop`} target="_blank" rel="noreferrer" className="hidden md:flex items-center gap-2.5 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all">
            <ExternalLink size={14} /> Mağazayı Gör
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: DOMAIN CONFIGURATION */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Input Card */}
            <div className="bg-[#0C0D0E] border border-white/5 rounded-[40px] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                <Globe size={180} className="rotate-12" />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-white tracking-tight">Kendi Alan Adını Bağla</h2>
                  <p className="text-gray-500 text-sm font-medium max-w-md leading-relaxed">
                    Markanı Nova'nın siber altyapısıyla buluştur. "magazam.com" gibi bir alan adını saniyeler içinde mağazana mühürle.
                  </p>
                </div>

                {!capabilities?.allowCustomDomain ? (
                  <div className="p-8 border border-amber-500/20 bg-amber-500/5 rounded-3xl text-center space-y-4">
                    <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Lock size={28} />
                    </div>
                    <h3 className="text-lg font-black text-white">Profesyonel Plana Özel</h3>
                    <p className="text-xs font-bold text-gray-400">Özel alan adı mühürleme özelliği yalnızca Profesyonel planda kullanılabilir.</p>
                    <button onClick={() => navigate('/premium')} className="mt-4 px-6 py-3 bg-amber-500 text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-colors">
                      Planı Yükselt
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative group/input">
                      <input 
                        type="text" 
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="magazam.com"
                        className="w-full bg-black/40 border-2 border-white/5 rounded-3xl px-8 py-6 text-lg font-black text-white placeholder-gray-800 focus:outline-none focus:border-blue-600/50 transition-all shadow-inner"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                         {customDomain && (
                           <div className="px-4 py-2 bg-blue-500/10 rounded-xl text-blue-500 text-[10px] font-black uppercase tracking-widest">
                             Nova Verified
                           </div>
                         )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold">
                          <AlertCircle size={16} /> {error}
                        </motion.div>
                      )}
                      {success && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-xs font-bold">
                          <CheckCircle2 size={16} /> Alan adı başarıyla mühürlendi!
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button 
                      onClick={handleSaveDomain}
                      disabled={saving}
                      className="w-full bg-white text-black hover:bg-blue-600 hover:text-white py-6 rounded-3xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.05)] active:scale-[0.98] disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                      ALAN ADINI MÜHÜRLE VE YAYINLA
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* DNS Instructions Card */}
            <div className="bg-[#0C0D0E] border border-white/5 rounded-[40px] p-10 space-y-8">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white tracking-tight">DNS Yönlendirme Protokolü</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Bağlantı Talimatları</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                     <Zap size={20} />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/40 border border-white/5 rounded-3xl p-6 space-y-4 hover:border-blue-500/20 transition-colors group/dns">
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Kayıt Tipi</span>
                        <Copy size={12} className="text-gray-700 group-hover/dns:text-blue-500 cursor-pointer transition-colors" onClick={() => copyToClipboard('CNAME')} />
                     </div>
                     <p className="text-xl font-serif text-white">CNAME</p>
                     <p className="text-[9px] text-gray-500 font-bold uppercase">En güvenli ve önerilen yöntem</p>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-3xl p-6 space-y-4 hover:border-blue-500/20 transition-colors group/dns">
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Hedef (Value)</span>
                        <Copy size={12} className="text-gray-700 group-hover/dns:text-blue-500 cursor-pointer transition-colors" onClick={() => copyToClipboard('custom.odelink.shop')} />
                     </div>
                     <p className="text-xl font-mono text-blue-500 font-bold">custom.odelink.shop</p>
                     <p className="text-[9px] text-gray-500 font-bold uppercase">DNS Hedef Adresi</p>
                  </div>
               </div>

               <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 flex gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                     <RefreshCcw size={18} className="animate-spin-slow" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Aktivasyon Süreci</p>
                     <p className="text-[10px] text-blue-500/60 leading-relaxed font-bold">
                       DNS ayarlarını yaptıktan sonra global sistemlerin bu değişikliği tanıması 24 saat kadar sürebilir. Genellikle saniyeler içinde aktif olur.
                     </p>
                  </div>
               </div>
            </div>

            {/* Elite Step-by-Step Guide */}
            <div className="bg-[#0C0D0E] border border-white/5 rounded-[40px] p-10 space-y-8">
               <div className="space-y-2">
                  <h3 className="text-lg font-black text-white tracking-tight">Nasıl Bağlanır? (Siber Protokol)</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Adım Adım Kurulum Rehberi</p>
               </div>

               <div className="space-y-6">
                  {[
                    { step: '01', title: 'Alan Adı Sağlayıcınıza Girin', desc: 'Hostinger, GoDaddy veya hangi platformu kullanıyorsanız DNS yönetim paneline giriş yapın.' },
                    { step: '02', title: 'Yeni Kayıt Oluşturun', desc: 'DNS ayarları bölümünden "Yeni Kayıt" (Add Record) butonuna tıklayın.' },
                    { step: '03', title: 'Değerleri Mühürleyin', desc: 'Tür olarak CNAME seçin, isim (Name) kısmına "www" veya domain adınızı, hedef (Value) kısmına "custom.odelink.shop" yazın.' },
                    { step: '04', title: 'Değişiklikleri Kaydedin', desc: 'Kaydı onaylayın ve Nova paneline dönüp "Mühürle" butonuna basın.' }
                  ].map((s, i) => (
                    <div key={i} className="flex gap-6 group">
                       <div className="text-xl font-serif text-blue-500/30 group-hover:text-blue-500 transition-colors">{s.step}</div>
                       <div className="space-y-1 pt-1">
                          <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{s.title}</h4>
                          <p className="text-[10px] text-gray-500 font-bold leading-relaxed">{s.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="pt-8 border-t border-white/5">
                  <div className="bg-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="space-y-2 text-center md:text-left">
                        <h4 className="text-sm font-black text-white">Henüz bir alan adınız yok mu?</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Nova, Hostinger altyapısını önerir.</p>
                     </div>
                     <a 
                      href="https://www.hostinger.com/tr" 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-8 py-4 bg-[#673DE6] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(103,61,230,0.2)]"
                     >
                        HOSTINGER'DAN ALAN ADI AL
                     </a>
                  </div>
               </div>
            </div>

          </div>

          {/* RIGHT: STATUS & INTELLIGENCE */}
          <div className="lg:col-span-5 space-y-8">
             
             {/* Live Status Panel */}
             <div className="bg-[#0C0D0E] border border-white/5 rounded-[40px] p-8 space-y-8 sticky top-28">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Siber Durum</h3>
                   </div>
                   <button onClick={fetchStatus} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-all hover:rotate-180">
                      <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
                   </button>
                </div>

                <div className="space-y-4">
                   <StatusCard label="Bağlantı Durumu" status={status?.status === 'active' ? 'Bağlantı Kuruldu' : status?.status ? 'Doğrulanıyor' : 'Beklemede'} icon={Server} active={status?.status === 'active'} />
                   <StatusCard label="SSL Güvenlik Katmanı" status={status?.sslStatus === 'active' ? 'Mühürlendi (HTTPS)' : status?.sslStatus ? 'Sertifika Hazırlanıyor' : 'Beklemede'} icon={Lock} active={status?.sslStatus === 'active'} color="text-blue-500" />
                   <StatusCard label="Nova Shield Koruması" status="Aktif" icon={ShieldCheck} active={true} color="text-purple-500" />
                </div>

                <div className="h-px bg-white/5" />

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sistem Bilgisi</p>
                   <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-widest">IP: 89.144.10.94</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-widest">CDN: Global Edge</span>
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
  <div className="flex items-center gap-5 p-5 bg-black/40 border border-white/5 rounded-[24px] hover:border-white/10 transition-all">
     <div className={`w-12 h-12 ${active ? color : 'text-gray-700'} bg-black rounded-2xl flex items-center justify-center border border-white/5 shadow-inner`}>
        <Icon size={20} />
     </div>
     <div className="flex-1">
        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-xs font-black uppercase tracking-widest ${active ? 'text-white' : 'text-gray-500'}`}>{status}</p>
     </div>
     {active && <CheckCircle2 size={16} className="text-emerald-500" />}
  </div>
);
