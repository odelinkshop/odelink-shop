import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, CheckCircle, HelpCircle, FileText, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import { getAuthToken } from '../utils/authStorage';
import { getApiBase } from '../utils/apiBase';

const API_BASE = getApiBase();

const SupportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const supportEmail = useMemo(() => {
    const v = process.env.REACT_APP_SUPPORT_EMAIL;
    return (v || 'odelinkdestek@gmail.com').trim();
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const visitorId = useMemo(() => {
    try { return localStorage.getItem('odelink_visitor_id') || ''; } catch { return ''; }
  }, []);

  useEffect(() => { setStatus(''); }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setStatus('Lütfen tüm alanları doldurun.');
      return;
    }

    setSending(true);
    try {
      const token = getAuthToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/support/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message,
          page: location.pathname,
          visitorId
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(data?.error || 'Mesaj gönderilemedi.');
        return;
      }

      setStatus('Mesajınız başarıyla iletildi. En kısa sürede döneceğiz.');
      setMessage('');
    } catch {
      setStatus('Bağlantı hatası oluştu.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gray-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 uppercase tracking-widest text-[10px] font-bold"
            >
              <ArrowLeft size={14} /> GERİ DÖN
            </button>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">DESTEK <span className="text-red-600">MERKEZİ</span></h1>
            <p className="text-gray-400 text-lg font-medium max-w-xl leading-relaxed">
              Sorunlarınızı çözmek ve deneyiminizi iyileştirmek için buradayız. Talebinizi iletin, uzman ekibimiz hemen ilgilensin.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden md:flex flex-col items-end text-right"
          >
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
              <Mail className="text-red-500 mb-2" size={24} />
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">E-POSTA İLE ULAŞIN</div>
              <div className="text-sm font-bold text-white">{supportEmail}</div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Quick Info */}
          <div className="lg:col-span-4 space-y-6">
            {[
              { icon: HelpCircle, title: 'SSS', desc: 'Sıkça sorulan sorulara göz atın.', path: '/faq' },
              { icon: FileText, title: 'Kılavuzlar', desc: 'Platform kullanımı hakkında bilgi edinin.', path: '/guide' },
              { icon: ShieldCheck, title: 'VIP Destek', desc: 'Öncelikli çözüm ve birebir destek.', path: '/vip-support' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                onClick={() => navigate(item.path)}
                className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-red-500/30 hover:bg-white/[0.07] transition-all cursor-pointer group"
              >
                <item.icon className="text-gray-500 group-hover:text-red-500 transition-colors mb-3" size={20} />
                <h3 className="text-sm font-bold text-white mb-1 tracking-wider uppercase">{item.title}</h3>
                <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div 
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">AD SOYAD</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 rounded-xl outline-none focus:border-red-500/50 transition-all font-medium text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınız ve Soyadınız"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">E-POSTA</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 rounded-xl outline-none focus:border-red-500/50 transition-all font-medium text-sm"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">KONU</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 rounded-xl outline-none focus:border-red-500/50 transition-all font-medium text-sm"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Mesajınızın konusu"
                />
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">MESAJINIZ</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 rounded-xl outline-none focus:border-red-500/50 transition-all font-medium text-sm min-h-[160px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Sorununuzu detaylıca açıklayın..."
                />
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {status && (
                  <div className={`flex items-center gap-2 text-sm font-bold ${status.includes('başarıyla') ? 'text-green-400' : 'text-red-400'}`}>
                    {status.includes('başarıyla') ? <CheckCircle size={18} /> : <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                    {status}
                  </div>
                )}
                
                <button 
                  disabled={sending}
                  className="w-full md:w-auto bg-red-600 text-white font-black text-[11px] uppercase tracking-[0.2em] px-10 py-5 rounded-xl hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {sending ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                  {sending ? 'GÖNDERİLİYOR' : 'MESAJI GÖNDER'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
