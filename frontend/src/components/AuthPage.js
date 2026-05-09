import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Key, Eye, EyeOff, ArrowRight, RefreshCw, Copy, Check, ShieldCheck, Chrome } from 'lucide-react';
import { setAuthSession } from '../utils/authStorage';
import { getApiBase } from '../utils/apiBase';
import BrandLogo from './BrandLogo';

const API_BASE = getApiBase();

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [suggestedPassword, setSuggestedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuggested, setShowSuggested] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const googleEnabled = Boolean(googleClientId);

  const generateStrongPassword = useCallback(() => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let pass = '';
    pass += lowercase[Math.floor(Math.random() * lowercase.length)];
    pass += uppercase[Math.floor(Math.random() * uppercase.length)];
    pass += numbers[Math.floor(Math.random() * numbers.length)];
    pass += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = pass.length; i < 16; i++) {
      pass += allChars[Math.floor(Math.random() * allChars.length)];
    }
    return pass.split('').sort(() => Math.random() - 0.5).join('');
  }, []);

  useEffect(() => {
    if (mode === 'register') {
      setSuggestedPassword(generateStrongPassword());
      setPasswordCopied(false);
    }
  }, [mode, generateStrongPassword]);

  const copySuggestedPassword = useCallback(() => {
    if (!suggestedPassword) return;
    navigator.clipboard.writeText(suggestedPassword).then(() => {
      setPassword(suggestedPassword);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    });
  }, [suggestedPassword]);

  const completeAuth = useCallback((data) => {
    setAuthSession({
      token: data?.token || '',
      user: data?.user || null
    });
    const to = location?.state?.from || '/';
    navigate(to);
  }, [location?.state?.from, navigate]);

  useEffect(() => {
    let cancelled = false;
    const loadGoogleConfig = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/google/config`, { credentials: 'include' });
        const data = await response.json().catch(() => ({}));
        if (!cancelled && data?.enabled && data?.clientId) {
          setGoogleClientId(data.clientId);
        }
      } catch (err) { console.error('Google config error:', err); }
    };
    loadGoogleConfig();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state === 'google_oauth') {
      setGoogleLoading(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      fetch(`${API_BASE}/api/auth/google/callback`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      .then(res => res.json())
      .then(data => {
        if (data?.error) {
          setError(data.error);
          setGoogleLoading(false);
        } else {
          completeAuth(data);
        }
      })
      .catch(() => {
        setError('Google ile giriş başarısız.');
        setGoogleLoading(false);
      });
    }
  }, [completeAuth]);

  const handleGoogleSignIn = () => {
    if (!googleClientId) return;
    setGoogleLoading(true);
    const redirectUri = `${window.location.origin}/auth`;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(googleClientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&scope=openid%20email%20profile&state=google_oauth&access_type=online&prompt=select_account`;
    window.location.href = authUrl;
  };

  const ALLOWED_EMAIL_DOMAINS = [
    'gmail.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'yahoo.com', 
    'yandex.com', 'protonmail.com', 'zoho.com', 'me.com', 'live.com'
  ];

  const validateRegistration = () => {
    // Name Validation
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) return "Lütfen adınızı ve soyadınızı tam girin.";
    if (/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(name) === false) return "İsim sadece harflerden oluşmalıdır.";
    if (/(\w)\1{3,}/.test(name.toLowerCase())) return "Lütfen geçerli bir isim girin.";

    // Email Whitelist Validation
    const domain = email.split('@')[1];
    if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
      return `Sadece global e-posta servisleri (${ALLOWED_EMAIL_DOMAINS.join(', ')}) kabul edilmektedir.`;
    }

    // Password Complexity Validation
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return "Şifre en az 8 karakter olmalı; bir büyük harf, bir rakam ve bir özel karakter içermelidir.";
    }

    return null;
  };

  const submit = async (event) => {
    event.preventDefault();
    setError(''); setInfo(''); 

    // Registration Guard
    if (mode === 'register') {
      const validationError = validateRegistration();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setLoading(true);

    try {
      const urlMap = {
        login: `${API_BASE}/api/auth/login`,
        register: `${API_BASE}/api/auth/register`,
        forgot: `${API_BASE}/api/auth/forgot-password`,
        reset: `${API_BASE}/api/auth/reset-password`
      };

      const bodyMap = {
        login: { email, password },
        register: { name, email, password },
        forgot: { email },
        reset: { email, code: resetCode, newPassword }
      };

      const response = await fetch(urlMap[mode], {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyMap[mode])
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.error || 'İşlem başarısız');
        setLoading(false);
        return;
      }

      if (mode === 'forgot') {
        setInfo('Sıfırlama kodu e-postana gönderildi.');
        setMode('reset');
      } else if (mode === 'reset') {
        setInfo('Şifren güncellendi. Giriş yapabilirsin.');
        setMode('login');
      } else {
        completeAuth(data);
      }
    } catch (err) {
      setError('Sunucu bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: mode === 'register' ? 20 : -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: mode === 'register' ? -20 : 20 }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gray-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="mb-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block mb-6"
          >
            <BrandLogo withText textClassName="text-white text-3xl font-bold tracking-tight" />
          </motion.div>
        </div>

        <motion.div 
          layout
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                  {mode === 'login' ? 'Hoş Geldiniz' : mode === 'register' ? 'Hesap Oluştur' : 'Şifre Kurtarma'}
                </h2>
                <p className="text-gray-400 text-sm font-medium">
                  {mode === 'login' ? 'Mağazanızı yönetmek için giriş yapın.' : mode === 'register' ? 'SaaS dünyasına adım atın.' : 'E-posta adresinizi girin.'}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </motion.div>
              )}

              {info && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm font-semibold flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {info}
                </motion.div>
              )}

              {(mode === 'login' || mode === 'register') && googleEnabled && (
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                    className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold text-[13px] uppercase tracking-wider py-4 rounded-xl hover:bg-gray-200 transition-all shadow-xl shadow-black/20 disabled:opacity-50"
                  >
                    <Chrome size={18} />
                    {googleLoading ? 'Yükleniyor...' : 'Google ile Devam Et'}
                  </button>
                  <div className="flex items-center gap-4 mt-8">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">VEYA</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                </div>
              )}

              <form onSubmit={submit} className="space-y-5">
                {mode === 'register' && (
                  <div className="relative group">
                    <User className="absolute left-4 top-4 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
                    <input
                      className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all font-medium text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ad Soyad"
                      required
                    />
                  </div>
                )}

                <div className="relative group">
                  <Mail className="absolute left-4 top-4 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
                  <input
                    className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all font-medium text-sm"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta Adresiniz"
                    required
                  />
                </div>

                {(mode === 'login' || mode === 'register') && (
                  <div className="space-y-2">
                    <div className="relative group">
                      <Lock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-12 py-4 rounded-xl outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all font-medium text-sm"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Şifreniz"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    {mode === 'login' && (
                      <div className="text-right">
                        <button
                          type="button"
                          className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-wider"
                          onClick={() => setMode('forgot')}
                        >
                          Şifremi Unuttum?
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Secure Password Suggestion Component */}
                {mode === 'register' && suggestedPassword && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3 mb-3 sm:mb-4 text-blue-400">
                      <ShieldCheck size={20} />
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Güçlü Şifre Önerisi</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="w-full sm:flex-1 relative">
                        <input
                          type={showSuggested ? "text" : "password"}
                          value={suggestedPassword}
                          readOnly
                          className="w-full bg-black/40 border border-white/5 text-white/90 px-4 py-2.5 rounded-lg font-mono text-[11px] sm:text-[13px] tracking-widest"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSuggested(!showSuggested)}
                          className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
                        >
                          {showSuggested ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="flex w-full sm:w-auto gap-2">
                        <button
                          type="button"
                          onClick={copySuggestedPassword}
                          className={`flex-1 sm:flex-none p-2.5 sm:p-3 rounded-lg transition-all flex items-center justify-center ${passwordCopied ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'}`}
                        >
                          {passwordCopied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSuggestedPassword(generateStrongPassword())}
                          className="flex-1 sm:flex-none p-2.5 sm:p-3 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white transition-all flex items-center justify-center"
                        >
                          <RefreshCw size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {mode === 'reset' && (
                  <div className="space-y-4">
                    <div className="relative group">
                      <Key className="absolute left-4 top-4 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-white/30 transition-all font-medium text-sm"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="Doğrulama Kodu"
                        required
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-white/30 transition-all font-medium text-sm"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Yeni Şifreniz"
                        required
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-red-600 text-white font-black text-sm uppercase tracking-[0.2em] py-5 rounded-xl hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <>
                      {mode === 'login' ? 'GİRİŞ YAP' : mode === 'register' ? 'KAYIT OL' : 'KODU GÖNDER'}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 text-center">
                <button
                  type="button"
                  className="text-xs font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest group"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                >
                  {mode === 'login' ? (
                    <>Hesabın yok mu? <span className="text-white group-hover:underline">Kaydol</span></>
                  ) : (
                    <>Zaten hesabın var mı? <span className="text-white group-hover:underline">Giriş yap</span></>
                  )}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
