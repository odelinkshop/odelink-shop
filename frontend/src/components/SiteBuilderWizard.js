import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ShieldCheck, Zap, Loader2, ExternalLink, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthSession from '../hooks/useAuthSession';
import { getApiBase } from '../utils/apiBase';

const API_BASE = getApiBase();

export default function SiteBuilderWizard() {
  const navigate = useNavigate();
  const { token, ready } = useAuthSession();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Progress State
  const [siteId, setSiteId] = useState(null);
  const [subdomain, setSubdomain] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [productCount, setProductCount] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');

  const handleApiCreate = async () => {
    if (!apiKey) {
      setErrorMsg('Lütfen Shopier API anahtarınızı girin.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/sites/create-from-api`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey })
      });
      
      const data = await res.json();

      if (res.ok) {
        setSiteId(data.siteId);
        setSubdomain(data.subdomain);
        setProductCount(data.productCount || 0);
        setSuccessMsg(data.message || 'Mağazanız başarıyla hazırlandı!');
        setIsCompleted(true);
      } else {
        setErrorMsg(data.error || 'API ile bağlanırken hata oluştu.');
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg('Bağlantı hatası oluştu.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2EBE1] font-sans selection:bg-[#C5A059]/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#C5A059]/10 blur-[120px] rounded-full" />
      </div>

      <header className="fixed top-0 inset-x-0 z-50 bg-black/40 backdrop-blur-md border-b border-[#C5A059]/10">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C5A059] flex items-center justify-center shadow-2xl shadow-[#C5A059]/20 rounded-lg">
              <Store className="w-5 h-5 text-[#0A0A0A]" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-[#F2EBE1]">ODELINK <span className="text-[#C5A059] font-serif font-normal italic">Studio</span></h1>
          </div>
          <button onClick={() => navigate('/panel')} className="text-[10px] uppercase tracking-widest font-bold text-[#F2EBE1]/40 hover:text-[#C5A059] transition-all">PANELE DÖN</button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-40 pb-20 relative text-center">
        <div className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl font-serif leading-tight text-[#F2EBE1]">Mağaza Kurulumu</h2>
            <p className="text-[#C5A059] uppercase tracking-[0.1em] sm:tracking-[0.4em] text-[7px] sm:text-[9px] font-black opacity-60">API ANAHTARINIZI GİRİN, SANİYELER İÇİNDE LÜKS MAĞAZANIZI CANLIYA ALALIM</p>
          </div>

          <AnimatePresence mode="wait">
            {!siteId ? (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-[#111] border border-[#C5A059]/20 p-10 rounded-3xl shadow-2xl">
                <div className="flex flex-col items-center space-y-8">
                  <div className="w-full space-y-6">
                     <div className="space-y-6">
                        <div className="text-left">
                          <label className="text-[10px] text-[#C5A059] font-black uppercase tracking-widest mb-4 block">Shopier API İle Güvenli Bağlantı</label>
                          <div className="relative group">
                            <input 
                              type="password"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              placeholder="Shopier API Anahtarınızı Buraya Yapıştırın"
                              className="w-full bg-white/5 border border-white/10 p-5 rounded-xl text-sm focus:border-[#C5A059] focus:outline-none transition-all pr-32"
                            />
                            <button 
                              onClick={handleApiCreate}
                              disabled={loading || !apiKey}
                              className="absolute right-2 top-2 bottom-2 px-6 bg-[#C5A059] text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#F2EBE1] disabled:opacity-50 transition-all"
                            >
                              {loading ? '...' : 'BAĞLAN VE KUR'}
                            </button>
                          </div>
                          <p className="text-[8px] text-white/30 mt-3 uppercase tracking-[0.2em] leading-relaxed">
                            Shopier Panel &gt; Entegrasyonlar &gt; API kısmından <a href="https://www.shopier.com/index.php?module=shop&page=shop_api_details" target="_blank" rel="noreferrer" className="text-[#C5A059] underline">buradan</a> alabilirsiniz.
                          </p>
                        </div>
                     </div>

                     {errorMsg && (
                      <div className="text-red-400 text-[11px] font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-left">
                        ⚠️ {errorMsg}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-8 pt-4 border-t border-white/5 w-full">
                    <div className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-wider">
                      <ShieldCheck size={14} className="text-[#C5A059]" /> Güvenli Aktarım
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-wider">
                      <Zap size={14} className="text-[#C5A059]" /> 1 Dakikada Canlıda
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="progress" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111] border border-[#C5A059]/20 p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="flex flex-col items-center space-y-8 text-center">
                  <div className={`w-24 h-24 ${productCount > 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'} rounded-full flex items-center justify-center border`}>
                    {productCount > 0 ? <ShieldCheck className="w-12 h-12 text-green-400" /> : <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-3xl font-serif text-[#F2EBE1]">{productCount > 0 ? 'Mağazanız Yayında!' : 'Hazırlanıyor...'}</h3>
                    <div className="space-y-1">
                      <p className="text-xs text-[#C5A059] font-black uppercase tracking-[0.2em]">{successMsg}</p>
                      <p className="text-[10px] text-white/40 max-w-sm mx-auto uppercase tracking-widest font-bold">
                        {subdomain}.odelink.shop
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full flex flex-col gap-3 pt-6">
                    <a href={`https://${subdomain}.odelink.shop`} target="_blank" rel="noreferrer" className="w-full py-5 bg-[#C5A059] text-black font-black uppercase text-[12px] tracking-widest rounded-xl hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-2 no-underline shadow-xl shadow-[#C5A059]/10">
                      MAĞAZAYI GÖRÜNTÜLE <ExternalLink size={18} />
                    </a>
                    <button onClick={() => navigate('/panel')} className="w-full py-5 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/5 transition-all">
                      YÖNETİM PANELİNE GİT
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
