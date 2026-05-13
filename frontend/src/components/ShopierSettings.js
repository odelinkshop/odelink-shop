import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Info, CheckCircle2, Loader2, Save, Zap } from 'lucide-react';
import { getApiBase } from '../utils/apiBase';
import { getAuthToken } from '../utils/authStorage';

const API_BASE = getApiBase();

const ShopierSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [settings, setSettings] = useState({
    apiKey: '',
    apiSecret: '',
    currency: 'TRY'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/users/shopier-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings({
          apiKey: data.apiKey || '',
          apiSecret: data.apiSecret || '',
          currency: data.currency || 'TRY'
        });
      }
    } catch (e) {
      console.error('Settings fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/users/shopier-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Shopier ayarları başarıyla güncellendi.' });
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Güncelleme başarısız.');
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center text-white">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-serif text-[#F2EBE1]">Shopier Ödeme Ayarları</h2>
          <p className="text-[10px] uppercase tracking-widest text-white font-bold opacity-60">Ödeme Altyapısı & Güvenlik Yapılandırması</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSave}
            className="bg-white/[0.02] border border-white/5 p-8 space-y-6"
          >
            <div className="space-y-4">
              <div className="bg-white/10 border border-white/20 p-4 mb-6">
                 <div className="flex items-center gap-3 text-white">
                    <Zap size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Modern Entegrasyon Aktif</span>
                 </div>
                 <p className="text-[9px] text-[#F2EBE1]/60 mt-1 font-bold uppercase tracking-widest">
                   Yeni nesil Shopier PAT (Personal Access Token) sistemini kullanıyorsunuz. Artık Secret anahtarına gerek yok.
                 </p>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white font-black mb-2">Shopier Kişisel Erişim Anahtarı (PAT)</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-4 h-4" />
                  <textarea 
                    rows="3"
                    value={settings.apiKey}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 px-12 py-4 text-sm focus:border-white/50 focus:outline-none transition-all font-mono leading-relaxed resize-none"
                    placeholder="Shopier Geliştirici sayfasından aldığınız uzun erişim kodunu buraya yapıştırın..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white font-black mb-2">Mağaza Para Birimi</label>
                <select 
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 px-4 py-4 text-sm focus:border-white/50 focus:outline-none transition-all"
                >
                  <option value="TRY" className="bg-[#0A0A0A]">Türk Lirası (TRY)</option>
                  <option value="USD" className="bg-[#0A0A0A]">Amerikan Doları (USD)</option>
                  <option value="EUR" className="bg-[#0A0A0A]">Euro (EUR)</option>
                </select>
              </div>
            </div>

            {message.text && (
              <div className={`p-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {message.type === 'success' ? <CheckCircle2 size={14} /> : <Info size={14} />}
                {message.text}
              </div>
            )}

            <button 
              type="submit"
              disabled={saving}
              className="w-full bg-white text-[#0A0A0A] py-4 font-black uppercase tracking-widest text-xs hover:bg-[#F2EBE1] transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/10"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
              AYARLARI KAYDET & BAĞLANTIYI DOĞRULA
            </button>
          </motion.form>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 p-6">
            <h4 className="text-white font-serif text-lg mb-4 flex items-center gap-2">
              <Info size={18} /> Yardımcı Bilgi
            </h4>
            <ul className="space-y-4">
              <li className="text-[10px] text-[#F2EBE1]/60 leading-relaxed font-bold uppercase tracking-wider">
                1. Shopier panelinize giriş yapın.
              </li>
              <li className="text-[10px] text-[#F2EBE1]/60 leading-relaxed font-bold uppercase tracking-wider">
                2. Geliştirici &gt; Kişisel Erişim Anahtarları bölümüne gidin.
              </li>
              <li className="text-[10px] text-[#F2EBE1]/60 leading-relaxed font-bold uppercase tracking-wider">
                3. Yeni bir anahtar oluşturup buraya yapıştırın.
              </li>
            </ul>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-6">
             <div className="flex items-center gap-3 mb-4">
                <Shield size={16} className="text-white" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Güvenlik Notu</span>
             </div>
             <p className="text-[9px] text-[#F2EBE1]/40 leading-relaxed font-bold uppercase tracking-widest">
               API Secret bilginiz sunucularımızda AES-256 standardında şifrelenmiş olarak saklanır. Ödeme akışı dışında asla kullanılmaz.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopierSettings;
