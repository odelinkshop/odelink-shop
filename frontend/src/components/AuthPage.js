import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAuthSession } from '../utils/authStorage';
import { getApiBase } from '../utils/apiBase';

const API_BASE = getApiBase();
const GOOGLE_SCRIPT_ID = 'odelink-google-identity';

const loadGoogleIdentityScript = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('window_unavailable'));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  const existing = document.getElementById(GOOGLE_SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      const onLoad = () => resolve(window.google);
      const onError = () => reject(new Error('google_script_failed'));
      existing.addEventListener('load', onLoad, { once: true });
      existing.addEventListener('error', onError, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('google_script_failed'));
    document.head.appendChild(script);
  });
};

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
  const [showSuggested, setShowSuggested] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const googleEnabled = Boolean(googleClientId);

  // Generate strong password
  const generateStrongPassword = useCallback(() => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    // Ensure at least one of each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest (total 16 characters)
    for (let i = password.length; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }, []);

  // Generate password when switching to register mode
  useEffect(() => {
    if (mode === 'register') {
      setSuggestedPassword(generateStrongPassword());
      setPasswordCopied(false);
    }
  }, [mode, generateStrongPassword]);

  // Copy suggested password to clipboard
  const copySuggestedPassword = useCallback(() => {
    if (!suggestedPassword) return;
    
    navigator.clipboard.writeText(suggestedPassword).then(() => {
      setPassword(suggestedPassword);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy password:', err);
      // Fallback: just set the password
      setPassword(suggestedPassword);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    });
  }, [suggestedPassword]);

  // Regenerate password
  const regeneratePassword = useCallback(() => {
    setSuggestedPassword(generateStrongPassword());
    setPasswordCopied(false);
  }, [generateStrongPassword]);

  const completeAuth = useCallback((data) => {
    setAuthSession({
      token: data?.token || '',
      user: data?.user || null
    });

    const to = location?.state?.from || '/';
    navigate(to);
  }, [location?.state?.from, navigate]);

  // Load Google Client ID
  useEffect(() => {
    let cancelled = false;

    const loadGoogleConfig = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/google/config`, {
          credentials: 'include'
        });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;

        if (data?.enabled && data?.clientId) {
          setGoogleClientId(data.clientId);
        }
      } catch (fetchError) {
        console.error('Failed to load Google config:', fetchError);
      }
    };

    loadGoogleConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle Google OAuth redirect callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state === 'google_oauth') {
      console.log('🔵 Processing Google OAuth callback...');
      setGoogleLoading(true);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Exchange code for token
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
        .catch(err => {
          console.error('Google OAuth callback error:', err);
          setError('Google ile giris basarisiz.');
          setGoogleLoading(false);
        });
    }
  }, [completeAuth]);

  // Handle Google Sign In button click
  const handleGoogleSignIn = () => {
    if (!googleClientId) {
      setError('Google giris yapilandirilmadi.');
      return;
    }

    setGoogleLoading(true);
    
    const redirectUri = `${window.location.origin}/auth`;
    const scope = 'openid email profile';
    const responseType = 'code';
    const state = 'google_oauth';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(googleClientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${encodeURIComponent(responseType)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${encodeURIComponent(state)}&` +
      `access_type=online&` +
      `prompt=select_account`;
    
    console.log('🔵 Redirecting to Google OAuth:', authUrl);
    window.location.href = authUrl;
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const url = mode === 'login'
        ? `${API_BASE}/api/auth/login`
        : mode === 'register'
          ? `${API_BASE}/api/auth/register`
          : mode === 'forgot'
            ? `${API_BASE}/api/auth/forgot-password`
            : `${API_BASE}/api/auth/reset-password`;

      const body = mode === 'login'
        ? { email, password }
        : mode === 'register'
          ? { name, email, password }
          : mode === 'forgot'
            ? { email }
            : { email, code: resetCode, newPassword };

      const response = await fetch(url, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.error || 'Islem basarisiz');
        return;
      }

      if (mode === 'forgot') {
        setInfo('Kod e-postana gonderildi (gonderildiyse).');
        setMode('reset');
        return;
      }

      if (mode === 'reset') {
        setInfo('Sifre guncellendi. Yeni sifreyle giris yapabilirsin.');
        setPassword('');
        setNewPassword('');
        setResetCode('');
        setMode('login');
        return;
      }

      completeAuth(data);
    } catch (requestError) {
      setError('Sunucuya baglanilamadi. Backend acik mi?');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setError('');
    setInfo('');

    if (mode === 'forgot' || mode === 'reset') {
      setMode('login');
      return;
    }

    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="min-h-screen gradient-bg pt-20 sm:pt-32 pb-16 sm:pb-20 px-4">
      <div className="container mx-auto" style={{ maxWidth: 520 }}>
        <div className="card" style={{ borderRadius: 16 }}>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'login' ? 'Giris Yap' : mode === 'register' ? 'Kayit Ol' : 'Hesap Islemeleri'}
            </h1>
            <p className="text-gray-600 mt-2">Gercek veri icin hesap ile devam et</p>
          </div>

          {error ? (
            <div className="mb-4" style={{ padding: 12, borderRadius: 12, background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239' }}>
              {error}
            </div>
          ) : null}

          {info ? (
            <div className="mb-4" style={{ padding: 12, borderRadius: 12, background: '#ecfeff', border: '1px solid #a5f3fc', color: '#155e75' }}>
              {info}
            </div>
          ) : null}

          {(mode === 'login' || mode === 'register') && googleEnabled ? (
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: 16, fontWeight: 500 }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                  <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                  <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
                  <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
                </svg>
                {googleLoading ? 'Yukleniyor...' : 'Google ile devam et'}
              </button>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500">veya email ile devam et</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
            </div>
          ) : null}

          <form onSubmit={submit}>
            {mode === 'register' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                <input
                  className="input-field"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ad Soyad"
                  required
                  disabled={loading || googleLoading}
                />
              </div>
            ) : null}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
              <input
                className="input-field"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ornek@mail.com"
                required
                disabled={loading || googleLoading}
              />
            </div>

            {(mode === 'login' || mode === 'register') ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sifre</label>
                <input
                  className="input-field"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  required
                  disabled={loading || googleLoading}
                />
                
                {/* Strong Password Suggestion - Only for Register */}
                {mode === 'register' && suggestedPassword ? (
                  <div className="mt-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
                    <div className="flex items-start gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">Güvenliğiniz için güçlü şifre öneriyoruz</p>
                        <p className="text-xs text-blue-700 mt-1">Müşteri güvenliği bizim için en önemli şeydir</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 relative">
                        <input
                          type={showSuggested ? "text" : "password"}
                          value={suggestedPassword}
                          readOnly
                          className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-mono"
                          style={{ fontSize: 13 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSuggested(!showSuggested)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                          title={showSuggested ? "Gizle" : "Göster"}
                        >
                          {showSuggested ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      
                      <button
                        type="button"
                        onClick={copySuggestedPassword}
                        disabled={passwordCopied}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-green-600 flex items-center gap-2 text-sm font-medium"
                        title="Kullan"
                      >
                        {passwordCopied ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Kullanıldı
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Kullan
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={regeneratePassword}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Yeni şifre üret"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : null}
                
                {mode === 'login' ? (
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      className="text-sm text-gray-600 underline"
                      disabled={loading || googleLoading}
                      onClick={() => {
                        setError('');
                        setInfo('');
                        setResetCode('');
                        setNewPassword('');
                        setMode('forgot');
                      }}
                    >
                      Sifremi unuttum
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {mode === 'forgot' ? (
              <div className="mb-6">
                <div className="text-sm text-gray-600">E-postana 6 haneli bir kod gonderecegiz.</div>
              </div>
            ) : null}

            {mode === 'reset' ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kod</label>
                  <input
                    className="input-field"
                    value={resetCode}
                    onChange={(event) => setResetCode(event.target.value)}
                    placeholder="123456"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Sifre</label>
                  <input
                    className="input-field"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="********"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </>
            ) : null}

            <button className="btn-primary w-full" type="submit" disabled={loading || googleLoading}>
              {loading
                ? 'Isleniyor...'
                : mode === 'login'
                  ? 'Giris Yap'
                  : mode === 'register'
                    ? 'Kayit Ol'
                    : mode === 'forgot'
                      ? 'Kodu Gonder'
                      : 'Sifreyi Guncelle'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              className="btn-secondary"
              disabled={loading || googleLoading}
              onClick={switchMode}
            >
              {mode === 'login'
                ? 'Hesabin yok mu? Kayit ol'
                : mode === 'register'
                  ? 'Zaten hesabin var mi? Giris yap'
                  : 'Giris ekranina don'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
