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
  const googleButtonRef = useRef(null);

  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleConfig, setGoogleConfig] = useState({ enabled: false, clientId: '' });
  const [googleScriptReady, setGoogleScriptReady] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const googleEnabled = useMemo(
    () => Boolean(googleConfig?.enabled && googleConfig?.clientId),
    [googleConfig]
  );

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
        const response = await fetch(`${API_BASE}/api/auth/google/config`, {
          credentials: 'include'
        });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;

        setGoogleConfig({
          enabled: Boolean(data?.enabled && data?.clientId),
          clientId: (data?.clientId || '').toString().trim()
        });
      } catch (fetchError) {
        if (!cancelled) {
          setGoogleConfig({ enabled: false, clientId: '' });
        }
      }
    };

    loadGoogleConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!googleEnabled) return undefined;

    let cancelled = false;

    loadGoogleIdentityScript()
      .then(() => {
        if (!cancelled) setGoogleScriptReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setGoogleScriptReady(false);
          setError((prev) => prev || 'Google giris butonu yuklenemedi.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [googleEnabled]);

  const handleGoogleCredential = useCallback(async (googleResponse) => {
    const credential = (googleResponse?.credential || '').toString().trim();
    if (!credential) {
      setError('Google kimligi alinamadi.');
      return;
    }

    setError('');
    setInfo('');
    setGoogleLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/google`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.error || 'Google ile giris basarisiz.');
        return;
      }

      completeAuth(data);
    } catch (requestError) {
      setError('Google ile baglanti kurulamadi.');
    } finally {
      setGoogleLoading(false);
    }
  }, [completeAuth]);

  useEffect(() => {
    if (!googleEnabled || !googleScriptReady || !googleButtonRef.current) return;
    if (!window.google?.accounts?.id) return;

    try {
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleConfig.clientId,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 420,
        shape: 'pill',
        logo_alignment: 'left',
        text: mode === 'register' ? 'signup_with' : 'signin_with'
      });
    } catch (renderError) {
      setError((prev) => prev || 'Google giris butonu hazirlanamadi.');
    }
  }, [googleConfig.clientId, googleEnabled, googleScriptReady, handleGoogleCredential, mode]);

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
              <div
                ref={googleButtonRef}
                className={`flex justify-center ${googleLoading ? 'pointer-events-none opacity-70' : ''}`}
              />
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
