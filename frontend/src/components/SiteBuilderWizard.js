import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Shield, Activity, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthSession from '../hooks/useAuthSession';
import { getApiBase } from '../utils/apiBase';

const API_BASE = getApiBase();

export default function SiteBuilderWizard() {
  const navigate = useNavigate();
  const { token } = useAuthSession();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [siteId, setSiteId] = useState(null);
  const [subdomain, setSubdomain] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSimpleCreate = async () => {
    if (!subdomain || subdomain.length < 3) {
      setErrorMsg('Lütfen geçerli bir mağaza adı (en az 3 karakter) belirleyin.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/sites/create-simple`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subdomain })
      });
      
      const data = await res.json();

      if (res.ok) {
        setSiteId(data.siteId);
        setIsCompleted(true);
      } else {
        setErrorMsg(data.error || 'Yapılandırma sırasında bir hata oluştu.');
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg('Ağ bağlantısı doğrulanamadı.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans selection:bg-[#38BDF8]/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#1E293B 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0F172A] flex items-center justify-center rounded-md">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-[#0F172A]">ODELINK <span className="text-slate-400 font-medium">Enterprise</span></h1>
          </div>
          <button 
            onClick={() => navigate('/panel')} 
            className="text-[11px] font-bold tracking-widest text-slate-500 hover:text-[#0F172A] transition-colors uppercase"
          >
            Panele Dön
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-40 pb-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
                <Activity size={12} className="text-[#38BDF8]" />
                <span className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider">Sistem Aktif v2.6</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0F172A] leading-[1.1]">
                Dijital Mağaza <br /> Altyapısı.
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed max-w-md">
                Kurumsal standartlarda mağaza yapılandırmanızı saniyeler içinde tamamlayın ve ticari faaliyetlerinize başlayın.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {[
                { icon: Shield, text: 'SSL & Güvenli Veri Katmanı' },
                { icon: Globe, text: 'Global CDN Yönlendirmesi' },
                { icon: CheckCircle2, text: 'Kurumsal Ödeme Gateway Entegrasyonu' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                    <item.icon size={10} className="text-slate-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isCompleted ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-slate-200 p-8 sm:p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
              >
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mağaza Adresi (Subdomain)</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="magazaadi"
                        className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl text-lg font-bold text-[#0F172A] focus:border-[#38BDF8] focus:ring-4 focus:ring-[#38BDF8]/5 outline-none transition-all pr-32"
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        .odelink.shop
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Sadece küçük harf, rakam ve tire kullanabilirsiniz.</p>
                  </div>

                  {errorMsg && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <p className="text-[11px] font-bold text-red-600 uppercase tracking-tight">{errorMsg}</p>
                    </motion.div>
                  )}

                  <button 
                    onClick={handleSimpleCreate}
                    disabled={loading || subdomain.length < 3}
                    className="w-full bg-[#0F172A] text-white p-5 rounded-2xl font-bold text-sm tracking-widest hover:bg-[#38BDF8] disabled:bg-slate-100 disabled:text-slate-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>YAPILANDIRMAYI BAŞLAT <ArrowRight size={16} /></>}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0F172A] p-12 rounded-3xl shadow-2xl text-center space-y-8"
              >
                <div className="w-20 h-20 bg-[#38BDF8]/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-[#38BDF8]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Aktivasyon Başarılı</h3>
                  <p className="text-slate-400 text-sm">Dijital mağaza altyapınız global ağlara başarıyla yansıtıldı.</p>
                </div>
                
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[11px] font-bold text-[#38BDF8] tracking-widest uppercase mb-1">Erişim Adresi</p>
                  <p className="text-white font-mono text-sm">{subdomain}.odelink.shop</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <a 
                    href={`https://${subdomain}.odelink.shop`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full bg-white text-[#0F172A] p-4 rounded-xl font-bold text-[11px] tracking-widest uppercase hover:bg-[#38BDF8] hover:text-white transition-all no-underline"
                  >
                    Vitrini Görüntüle
                  </a>
                  <button 
                    onClick={() => navigate('/panel')} 
                    className="w-full bg-white/5 text-white/40 p-4 rounded-xl font-bold text-[10px] tracking-widest uppercase hover:bg-white/10 transition-all"
                  >
                    Kontrol Paneli
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
