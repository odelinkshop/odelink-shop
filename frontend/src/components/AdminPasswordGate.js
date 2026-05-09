import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Key, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';

const AdminPasswordGate = ({ children }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const CEO_EMAIL = 'Muratbyrm3752@gmail.com';
  const CEO_PASSWORD = 'Murat676756.';

  useEffect(() => {
    // Session kontrolü
    const isAuthed = localStorage.getItem('nova_ceo_session_v1') === 'true';
    if (isAuthed) {
      setAuthorized(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (email.toLowerCase() === CEO_EMAIL.toLowerCase() && password === CEO_PASSWORD) {
        localStorage.setItem('nova_ceo_session_v1', 'true');
        setAuthorized(true);
      } else {
        setError('Geçersiz CEO Kimlik Bilgileri. Erişim Engellendi.');
      }
      setLoading(false);
    }, 1000);
  };

  if (authorized) {
    return children;
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 selection:bg-red-500/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-10">
          <BrandLogo withText size={42} textClassName="text-white text-2xl font-black italic tracking-tighter" />
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <ShieldCheck size={12} className="text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">CEO Komuta Merkezi</span>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl backdrop-blur-xl">
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2 text-center">Giriş Yetkisi</h2>
          <p className="text-gray-500 text-xs font-medium text-center mb-8 italic">Bu bölüme sadece Ödelink CEO'su erişebilir.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="CEO E-posta"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all font-medium placeholder:text-gray-600"
              />
            </div>

            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="CEO Şifre"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all font-medium placeholder:text-gray-600"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] font-black uppercase tracking-widest text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Komut Merkezine Gir <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="w-full mt-8 text-gray-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
        >
          Ana Sayfaya Dön
        </button>
      </motion.div>
    </div>
  );
};

export default AdminPasswordGate;
