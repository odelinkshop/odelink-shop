import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Zap, ShieldCheck, Sparkles, Send, CheckCircle2, Link as LinkIcon, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthSession from '../hooks/useAuthSession';
import { getApiBase } from '../utils/apiBase';

const API_BASE = getApiBase();

export default function SiteBuilderWizard() {
  const navigate = useNavigate();
  const { token, ready } = useAuthSession();

  const [shopierUrl, setShopierUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Progress State
  const [siteId, setSiteId] = useState(null);
  const [subdomain, setSubdomain] = useState('');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [creationMode, setCreationMode] = useState('link'); // 'link' or 'excel'

  const pollInterval = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!ready) return;
    if (!token) navigate('/auth');
  }, [navigate, ready, token]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  const startPolling = (id) => {
    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sites/${id}/build-status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setProgress(data.progress || 0);
          setStatusText(data.text || 'İşleniyor...');
          
          if (data.status === 'completed' || data.progress >= 100) {
            clearInterval(pollInterval.current);
            setProgress(100);
            setStatusText('Mağazanız Hazır!');
            setIsCompleted(true);
          } else if (data.status === 'error') {
            clearInterval(pollInterval.current);
            setErrorMsg(data.error || 'Tarama sırasında bir hata oluştu.');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2500); // Check every 2.5 seconds
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!shopierUrl || !shopierUrl.includes('shopier.com/')) {
      setErrorMsg('Lütfen geçerli bir Shopier mağaza linki giriniz. (Örn: https://www.shopier.com/MAGAZA)');
      return;
    }

    setLoading(true);
    setProgress(5);
    setStatusText('Talebiniz alınıyor...');

    try {
      const res = await fetch(`${API_BASE}/api/sites/create-automated`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shopierUrl })
      });

      const result = await res.json();

      if (res.ok) {
        setSiteId(result.siteId);
        setSubdomain(result.subdomain);
        startPolling(result.siteId);
      } else {
        setErrorMsg(result.error || 'Talep oluşturulurken bir hata oluştu.');
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      setLoading(false);
    }
  };

  const handleExcelCreate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg('');
    setProgress(20);
    setStatusText('Excel dosyası işleniyor...');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/sites/create-from-excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();

      if (res.ok) {
        setSiteId(data.siteId);
        setSubdomain(data.subdomain);
        setProgress(100);
        setStatusText('Mağazanız Hazır!');
        setIsCompleted(true);
      } else {
        setErrorMsg(data.error || 'Mağaza oluşturulurken bir hata oluştu.');
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg('Bağlantı hatası oluştu.');
      setLoading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
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

      <main className="max-w-xl mx-auto px-6 pt-32 pb-20 relative text-center">
        <div className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-serif leading-tight text-[#F2EBE1]">Otomize Mağaza Kurulumu</h2>
            <p className="text-[#C5A059] uppercase tracking-[0.1em] sm:tracking-[0.4em] text-[7px] sm:text-[9px] font-black opacity-60">SİZ LİNKİ BIRAKIN, YAPAY ZEKA İNŞA ETSİN</p>
          </div>

          <AnimatePresence mode="wait">
            {!siteId ? (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-[#111] border border-[#C5A059]/20 p-8 rounded-3xl shadow-2xl">
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-16 h-16 bg-[#C5A059] rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-black" />
                  </div>

                  <div className="text-center mb-4 px-2">
                    <h3 className="text-lg font-serif text-[#F2EBE1] mb-2">1 Dakikada Hazır</h3>
                    <p className="text-[11px] text-white/40 leading-relaxed max-w-sm mx-auto">
                      Shopier linkinizi bırakın veya Excel dosyanızı yükleyin. Robotlarımız mağazanızı saniyeler içinde eksiksiz kursun.
                    </p>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex bg-white/5 p-1 rounded-xl w-full">
                    <button 
                      onClick={() => setCreationMode('link')}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${creationMode === 'link' ? 'bg-[#C5A059] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                      Link ile Kur
                    </button>
                    <button 
                      onClick={() => setCreationMode('excel')}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${creationMode === 'excel' ? 'bg-[#C5A059] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                      Excel ile Kur (Hızlı)
                    </button>
                  </div>

                  {creationMode === 'link' ? (
                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <LinkIcon className="h-5 w-5 text-white/30" />
                        </div>
                        <input
                          type="url"
                          required
                          value={shopierUrl}
                          onChange={(e) => setShopierUrl(e.target.value)}
                          placeholder="https://www.shopier.com/MAGAZANIZ"
                          className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059] transition-colors text-sm"
                        />
                      </div>

                      {errorMsg && (
                        <div className="text-red-400 text-[11px] font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-left">
                          ⚠️ {errorMsg}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#C5A059] text-black font-black uppercase text-[11px] tracking-widest rounded-xl hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
                        {loading ? 'HAZIRLANIYOR...' : 'MAĞAZAMI KUR'}
                      </button>
                    </form>
                  ) : (
                    <div className="w-full space-y-4">
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         onChange={handleExcelCreate} 
                         accept=".xlsx, .xls" 
                         className="hidden" 
                       />
                       <button
                         onClick={() => fileInputRef.current?.click()}
                         disabled={loading}
                         className="w-full py-12 border-2 border-dashed border-[#C5A059]/20 hover:border-[#C5A059]/50 rounded-2xl flex flex-col items-center justify-center gap-4 group transition-all"
                       >
                          <div className="w-12 h-12 bg-[#C5A059]/10 rounded-full flex items-center justify-center text-[#C5A059] group-hover:scale-110 transition-transform">
                             <Download size={24} />
                          </div>
                          <div className="text-center">
                             <p className="text-[11px] font-black uppercase tracking-widest text-[#F2EBE1]">Excel Dosyasını Seç</p>
                             <p className="text-[9px] text-white/30 mt-1 uppercase tracking-widest">Shopier Export Dosyası (.xlsx)</p>
                          </div>
                       </button>

                       {errorMsg && (
                        <div className="text-red-400 text-[11px] font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-left">
                          ⚠️ {errorMsg}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-[9px] text-white/30 font-bold uppercase tracking-wider">
                      <ShieldCheck size={12} className="text-[#C5A059]" /> Şifre Gerekmez
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-white/30 font-bold uppercase tracking-wider">
                      <Zap size={12} className="text-[#C5A059]" /> Anında Kurulum
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="progress" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111] border border-[#C5A059]/20 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#C5A059]/0 via-[#C5A059] to-[#C5A059]/0" />
                
                <div className="flex flex-col items-center space-y-8">
                  
                  {isCompleted ? (
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30">
                      <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center">
                       <svg className="w-24 h-24 transform -rotate-90">
                          <circle cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                          <circle cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="4" fill="transparent"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * progress) / 100}
                            className="text-[#C5A059] transition-all duration-500 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-black text-[#F2EBE1]">{progress}%</span>
                        </div>
                    </div>
                  )}

                  <div className="text-center space-y-2 w-full">
                    <h3 className="text-2xl font-serif text-[#F2EBE1]">
                      {isCompleted ? 'Mağazanız Hazır!' : 'Yapay Zeka Çalışıyor'}
                    </h3>
                    <p className="text-sm text-[#C5A059] font-medium h-6 transition-all">
                      {statusText}
                    </p>
                  </div>
                  
                  {/* Fake log lines for visual effect */}
                  {!isCompleted && (
                    <div className="w-full bg-black/40 rounded-lg p-4 border border-white/5 text-left space-y-2">
                      <p className="text-[10px] text-white/40 font-mono flex items-center gap-2">
                        <CheckCircle2 size={10} className="text-green-500" /> Alt domain tahsis edildi: {subdomain}.odelink.shop
                      </p>
                      <p className="text-[10px] text-white/40 font-mono flex items-center gap-2">
                        {progress > 20 ? <CheckCircle2 size={10} className="text-green-500" /> : <Loader2 size={10} className="animate-spin text-[#C5A059]" />} 
                        {progress > 20 ? 'Vitrin iskeleti oluşturuldu.' : 'Vitrin altyapısı çözümleniyor...'}
                      </p>
                      <p className="text-[10px] text-white/40 font-mono flex items-center gap-2">
                        {progress > 45 ? <CheckCircle2 size={10} className="text-green-500" /> : (progress > 20 ? <Loader2 size={10} className="animate-spin text-[#C5A059]" /> : <span className="w-2.5" />)} 
                        {progress > 45 ? 'Tüm ürün verileri çekildi.' : (progress > 20 ? 'Ürünler taranıyor...' : 'Bekleniyor...')}
                      </p>
                      <p className="text-[10px] text-white/40 font-mono flex items-center gap-2">
                        {progress > 95 ? <CheckCircle2 size={10} className="text-green-500" /> : (progress > 45 ? <Loader2 size={10} className="animate-spin text-[#C5A059]" /> : <span className="w-2.5" />)} 
                        {progress > 95 ? 'Yüksek çözünürlüklü galeriler eklendi.' : (progress > 45 ? 'Derin Tarama (Çoklu Resim & Beden) yapılıyor...' : 'Bekleniyor...')}
                      </p>
                    </div>
                  )}

                  {isCompleted && (
                    <a href={`https://${subdomain}.odelink.shop`} target="_blank" rel="noreferrer" className="w-full py-4 bg-[#C5A059] text-black font-black uppercase text-[11px] tracking-widest rounded-xl hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-2 no-underline">
                      SİTEYE GİT <ExternalLink size={16} />
                    </a>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
