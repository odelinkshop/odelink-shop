import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Store, Zap, Download, Chrome, Upload, ShieldCheck, Sparkles, FileJson, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthSession from '../hooks/useAuthSession';
import { getApiBase } from '../utils/apiBase';

const API_BASE = getApiBase();

export default function SiteBuilderWizard() {
  const navigate = useNavigate();
  const { token, ready } = useAuthSession();
  const fileRef = useRef(null);

  const [step, setStep] = useState(1); // 1: Eklenti İndir, 2: Dosya Yükle
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!token) navigate('/auth');
  }, [navigate, ready, token]);

  // Dosya yükleme işlemi
  async function handleFile(file) {
    if (!file || !file.name.endsWith('.json')) {
      setUploadResult({ ok: false, msg: 'Lütfen .json dosyası seçin.' });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const products = data.products || data;

      if (!Array.isArray(products) || products.length === 0) {
        setUploadResult({ ok: false, msg: 'Dosyada ürün bulunamadı.' });
        setUploading(false);
        return;
      }

      // Backend'e gönder: Site oluştur + ürünleri işle
      const res = await fetch(`${API_BASE}/api/sites/create-from-export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          products,
          categories: data.categories || [],
          shopName: data.shopName || '',
          source: data.source || 'shopier',
          exportDate: data.exportDate || data.timestamp || new Date().toISOString()
        })
      });

      const result = await res.json();

      if (res.ok) {
        setUploadResult({
          ok: true,
          msg: `${products.length} ürün başarıyla aktarıldı! Siteniz oluşturuldu.`,
          siteUrl: result.siteUrl,
          siteId: result.siteId
        });
      } else {
        setUploadResult({ ok: false, msg: result.message || 'Sunucu hatası.' });
      }
    } catch (e) {
      setUploadResult({ ok: false, msg: 'Dosya okunamadı veya geçersiz format.' });
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2EBE1] font-sans selection:bg-[#C5A059]/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#C5A059]/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
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

      <main className="max-w-2xl mx-auto px-6 pt-32 pb-20 relative text-center">
        <div className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-3xl font-serif leading-tight">Mağaza Kurulumu</h2>
            <p className="text-[#C5A059] uppercase tracking-[0.4em] text-[9px] font-black">2 Adımda Profesyonel Vitrin</p>
          </div>

          {/* ADIM GÖSTERGESİ */}
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${step === 1 ? 'bg-[#C5A059] text-black' : 'bg-white/5 text-white/30'}`}>
              <Download size={12} /> Eklenti
            </div>
            <div className="w-8 h-px bg-white/10" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${step === 2 ? 'bg-[#C5A059] text-black' : 'bg-white/5 text-white/30'}`}>
              <Upload size={12} /> Yükle
            </div>
          </div>

          {/* ADIM 1: EKLENTİ İNDİR */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border border-[#C5A059]/20 p-8 rounded-3xl shadow-2xl">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-16 h-16 bg-[#C5A059] rounded-xl flex items-center justify-center shadow-lg">
                  <Chrome className="w-8 h-8 text-black" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-[#C5A059]">Odelink Omni-Scraper v6.0</h3>
                  <p className="text-[10px] text-[#F2EBE1]/50 leading-relaxed max-w-sm mx-auto">
                    Chrome eklentisini kurun, Shopier mağazanızı tarayın ve ürün paketinizi indirin.
                  </p>
                </div>

                <a href="/odelink-connector-PRO.zip" download className="w-full py-4 bg-[#C5A059] text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-2 no-underline">
                  <Download size={14} /> EKLENTİYİ İNDİR (.ZIP)
                </a>

                <div className="w-full border-t border-white/5 pt-5 space-y-3">
                  <div className="text-[9px] font-black text-[#C5A059] uppercase tracking-[0.3em]">Kurulum</div>
                  {[
                    'İndirdiğiniz ZIP dosyasını klasöre çıkartın.',
                    'Chrome → chrome://extensions → Geliştirici Modu açın.',
                    '"Paketlenmemiş öğe yükle" ile klasörü seçin.',
                    'Shopier mağazanıza gidin, "PAKETLE" butonuna tıklayın.'
                  ].map((t, i) => (
                    <div key={i} className="flex gap-3 items-start text-left">
                      <div className="w-5 h-5 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded flex items-center justify-center text-[10px] font-bold text-[#C5A059] shrink-0">{i + 1}</div>
                      <p className="text-[10px] text-white/40 leading-tight">{t}</p>
                    </div>
                  ))}
                </div>

                <button onClick={() => setStep(2)} className="w-full py-3 bg-white/5 border border-white/10 text-white/50 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#C5A059] hover:text-black transition-all flex items-center justify-center gap-2">
                  <Package size={14} /> PAKETİM HAZIR, DEVAM ET →
                </button>
              </div>
            </motion.div>
          )}

          {/* ADIM 2: DOSYA YÜKLE */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border border-[#C5A059]/20 p-8 rounded-3xl shadow-2xl">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-16 h-16 bg-[#C5A059] rounded-xl flex items-center justify-center shadow-lg">
                  <FileJson className="w-8 h-8 text-black" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-[#C5A059]">Ürün Paketini Yükle</h3>
                  <p className="text-[10px] text-[#F2EBE1]/50 leading-relaxed max-w-sm mx-auto">
                    Eklentiden indirdiğiniz .json dosyasını aşağıya sürükleyin veya seçin.
                  </p>
                </div>

                {/* DRAG & DROP ALANI */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`w-full py-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all flex flex-col items-center gap-3 ${
                    dragActive ? 'border-[#C5A059] bg-[#C5A059]/10' : 'border-white/10 hover:border-[#C5A059]/50'
                  }`}
                >
                  <Upload size={32} className={`${dragActive ? 'text-[#C5A059]' : 'text-white/20'}`} />
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                    {uploading ? 'YÜKLENİYOR...' : 'Dosyayı Sürükle veya Tıkla'}
                  </span>
                  <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                </div>

                {/* SONUÇ */}
                {uploadResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`w-full p-4 rounded-xl text-[11px] font-bold ${uploadResult.ok ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                    <div className="flex items-center gap-2">
                      {uploadResult.ok ? <CheckCircle2 size={16} /> : <span>⚠️</span>}
                      <span>{uploadResult.msg}</span>
                    </div>
                    {uploadResult.ok && uploadResult.siteUrl && (
                      <a href={uploadResult.siteUrl} target="_blank" rel="noreferrer" className="mt-3 block w-full py-3 bg-[#C5A059] text-black font-black uppercase text-[10px] tracking-widest rounded-xl text-center no-underline hover:bg-[#F2EBE1] transition-all">
                        SİTENİZİ GÖRÜNTÜLE →
                      </a>
                    )}
                  </motion.div>
                )}

                <button onClick={() => setStep(1)} className="text-[9px] text-white/20 hover:text-[#C5A059] uppercase tracking-widest transition-all">
                  ← Geri Dön
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
