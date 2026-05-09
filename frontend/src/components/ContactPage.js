import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, CheckCircle, Globe, Phone, MapPin, Copy, Check, RefreshCw, ArrowLeft, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/authStorage';
import { getApiBase } from '../utils/apiBase';

const API_BASE = getApiBase();

const ContactPage = () => {
  const navigate = useNavigate();
  const supportEmail = useMemo(() => {
    const v = process.env.REACT_APP_SUPPORT_EMAIL;
    return (v || 'odelinkdestek@gmail.com').trim();
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`Ad: ${name}\nE-posta: ${email}\n\nMesaj:\n${message}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!name.trim() || !email.trim() || !message.trim()) {
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
          subject: 'Ödelink İletişim',
          message
        })
      });

      if (!res.ok) {
        setStatus('Mesaj gönderilemedi.');
        return;
      }

      setStatus('Mesajınız başarıyla iletildi.');
      setMessage('');
    } catch {
      setStatus('Bağlantı hatası.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 uppercase tracking-widest text-[10px] font-bold"
          >
            <ArrowLeft size={14} /> GERİ DÖN
          </button>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 uppercase italic">BİZİMLE <span className="text-red-600 not-italic">KONUŞUN</span></h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            İşbirliği, sorular veya sadece tanışmak için. Vizyonunuzu paylaşıyoruz ve sizinle iletişime geçmek için sabırsızlanıyoruz.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-8">
              {[
                { icon: Mail, title: 'E-POSTA', value: supportEmail, label: 'Resmi Yazışmalar' },
                { icon: MapPin, title: 'KONUM', value: 'Istanbul, TR', label: 'Operasyon Merkezi' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-start gap-6 group"
                >
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-white/20 transition-all shrink-0">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">{item.title}</div>
                    <div className="text-lg font-bold text-white mb-0.5">{item.value}</div>
                    <div className="text-xs text-gray-500 font-medium">{item.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-10 border-t border-white/5">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">SOSYAL MEDYA</div>
              <div className="flex gap-4">
                {[
                  { name: 'Instagram', url: 'https://www.instagram.com/odelink.shop', icon: Instagram, color: '#E1306C' },
                  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/%C3%B6delink', icon: Linkedin, color: '#0A66C2' },
                ].map((social, i) => (
                  <a 
                    key={i} 
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.name}
                    className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-gray-400 hover:text-white group"
                  >
                    <social.icon size={24} className="transition-colors" style={{ color: social.color }} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                 <Globe size={200} />
               </div>

              <div className="relative z-10 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">İSMİNİZ</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl outline-none focus:border-red-500/50 transition-all font-medium text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">E-POSTA ADRESİ</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl outline-none focus:border-red-500/50 transition-all font-medium text-sm"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@mail.com"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">MESAJINIZ</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 text-white px-6 py-5 rounded-2xl outline-none focus:border-red-500/50 transition-all font-medium text-sm min-h-[180px] resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Size nasıl yardımcı olabiliriz?"
                  />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  <button 
                    disabled={sending}
                    className="w-full md:flex-1 bg-red-600 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {sending ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                    {sending ? 'GÖNDERİLİYOR' : 'MESAJI GÖNDER'}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={handleCopy}
                    className="w-full md:w-auto px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                  >
                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="group-hover:text-white" />}
                    {copied ? 'KOPYALANDI' : 'KOPYALA'}
                  </button>
                </div>

                {status && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center text-xs font-bold uppercase tracking-widest ${status.includes('başarıyla') ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {status}
                  </motion.div>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
