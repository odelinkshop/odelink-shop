import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession, getAuthHeaders, getAuthToken, setAdminUiEnabled } from '../utils/authStorage';
import BrandLogo from './BrandLogo';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5000'
    : '');

const AdminPasswordGate = ({ children }) => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [needsClaim, setNeedsClaim] = useState(false);
  const [error, setError] = useState('');
  const [autoClaimed, setAutoClaimed] = useState(false);
  const [needsCode, setNeedsCode] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [adminAccess, setAdminAccess] = useState({ hasOwner: false, isOwner: false, guestAccess: false, guestExpiresAt: null });

  const formatAdminReason = (data) => {
    const reason = (data?.reason || '').toString();
    if (reason === 'email_mismatch') {
      return 'Bu hesap admin olarak tanımlı değil. Render ENV içinde ADMIN_CLAIM_EMAIL (veya ADMIN_EMAIL) giriş yaptığın email ile birebir aynı olmalı.';
    }
    if (reason === 'remote_bootstrap_disabled') {
      return 'Admin kurulumu uzaktan kapalı. Render ENV içine ALLOW_REMOTE_ADMIN_BOOTSTRAP=true ekleyip servisi yeniden başlatmalısın.';
    }
    if (reason === 'owner_mismatch') {
      return 'Admin başka bir hesapta atanmış görünüyor. Admin owner sıfırlanmalı veya doğru hesapla giriş yapılmalı.';
    }
    return (data?.error || 'Admin doğrulaması yapılamadı.').toString();
  };

  useEffect(() => {
    if (!authorized) return;
    try {
      setAdminUiEnabled(true);
    } catch (e) {
      void e;
    }
  }, [authorized]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setNeedsLogin(true);
      setChecking(false);
      return;
    }

    const run = async () => {
      setChecking(true);
      setError('');
      try {
        try {
          const accessRes = await fetch(`${API_BASE}/api/admin/access/status`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const accessData = await accessRes.json().catch(() => ({}));
          if (accessRes.ok) {
            setAdminAccess({
              hasOwner: Boolean(accessData?.hasOwner),
              isOwner: Boolean(accessData?.isOwner),
              guestAccess: Boolean(accessData?.guestAccess),
              guestExpiresAt: accessData?.guestExpiresAt || null
            });
            if (accessData?.isOwner || accessData?.guestAccess) {
              setAllowed(true);
              setNeedsClaim(false);
              setNeedsCode(false);
              setAuthorized(true);
              return;
            }
            if (accessData?.hasOwner) {
              setAllowed(true);
              setNeedsClaim(false);
              setNeedsCode(true);
              setAuthorized(false);
              return;
            }
          }
        } catch (e0) {
          void e0;
        }

        const res = await fetch(`${API_BASE}/api/admin/check`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 401) {
            clearAuthSession();
            setNeedsLogin(true);
            return;
          }

          if (res.status === 403) {
            setAllowed(true);
            setNeedsClaim(false);
            setAuthorized(false);
            setError(formatAdminReason(data));
            return;
          }

          if (res.status === 409) {
            if (!autoClaimed) {
              setAutoClaimed(true);
              try {
                const claimRes = await fetch(`${API_BASE}/api/admin/claim`, {
                  method: 'POST',
                  headers: getAuthHeaders()
                });
                const claimData = await claimRes.json().catch(() => ({}));
                if (claimRes.ok) {
                  setAllowed(true);
                  setNeedsClaim(false);
                  setNeedsCode(false);
                  setAuthorized(true);
                  return;
                }
                setAllowed(true);
                setNeedsClaim(true);
                setNeedsCode(false);
                setAuthorized(false);
                setError(formatAdminReason(claimData));
                return;
              } catch (e2) {
                setAllowed(true);
                setNeedsClaim(true);
                setNeedsCode(false);
                setAuthorized(false);
                setError('Admin atanamadı.');
                return;
              }
            }

            setNeedsClaim(true);
            setAllowed(true);
            setNeedsCode(false);
            setAuthorized(false);
            return;
          }

          setError(formatAdminReason(data));
          return;
        }

        setAllowed(true);
        setNeedsClaim(false);
        setNeedsCode(false);
        setAuthorized(true);
      } catch (e) {
        setError('Admin doğrulaması yapılamadı.');
      } finally {
        setChecking(false);
      }
    };

    run();
  }, [navigate, autoClaimed]);

  if (checking) {
    return (
      <div className="min-h-screen bg-white text-gray-900" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>
        <div className="container mx-auto px-4 pt-28 pb-16 max-w-xl">
          <div className="card" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>Admin Panel</h1>
            <p className="text-gray-700" style={{ color: '#374151', WebkitTextFillColor: '#374151' }}>Doğrulanıyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-900" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>
        <div className="container mx-auto px-4 pt-28 pb-16 max-w-xl">
          <div className="card" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>Admin Panel</h1>
            <p className="text-gray-700" style={{ color: '#374151', WebkitTextFillColor: '#374151' }}>{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
                Tekrar Dene
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/') }>
                Ana Sayfa
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (needsLogin) {
    return (
      <div className="min-h-screen bg-white text-gray-900" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>
        <div className="container mx-auto px-4 pt-28 pb-16 max-w-xl">
          <div className="card" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>Admin Panel</h1>
            <p className="text-gray-700" style={{ color: '#374151', WebkitTextFillColor: '#374151' }}>Devam etmek için önce giriş yapmalısınız.</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button type="button" className="btn-primary" onClick={() => navigate('/auth', { state: { from: '/admin' } })}>
                Giriş Yap
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/') }>
                Ana Sayfa
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  if (authorized) {
    try {
      if (React.isValidElement(children)) {
        return React.cloneElement(children, { adminAccess });
      }
    } catch (e) {
      void e;
    }
    return children;
  }

  if (needsCode) {
    return (
      <div className="min-h-screen bg-white text-gray-900" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>
        <div className="container mx-auto px-4 pt-28 pb-16 max-w-xl">
          <div className="card" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>
            <div className="mb-4">
              <BrandLogo withText />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>Admin Panel</h1>
            <p className="text-gray-700 mb-6" style={{ color: '#374151', WebkitTextFillColor: '#374151' }}>Giriş için 6 haneli erişim kodu gerekiyor.</p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setError('');
                const token = getAuthToken();
                if (!token) {
                  setNeedsLogin(true);
                  return;
                }
                try {
                  setChecking(true);
                  const code = (accessCode || '').toString().replace(/\s+/g, '');
                  const res = await fetch(`${API_BASE}/api/admin/access/verify`, {
                    method: 'POST',
                    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ code })
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setError(data?.error || 'Kod doğrulanamadı');
                    return;
                  }
                  setAdminAccess({
                    hasOwner: true,
                    isOwner: Boolean(data?.bypass),
                    guestAccess: Boolean(data?.guestAccess) || true,
                    guestExpiresAt: data?.guestExpiresAt || null
                  });
                  setNeedsCode(false);
                  setAuthorized(true);
                } catch (e2) {
                  setError('Kod doğrulanamadı');
                } finally {
                  setChecking(false);
                }
              }}
            >
              <input
                className="input-field text-gray-900"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="000000"
                inputMode="numeric"
                autoComplete="one-time-code"
                style={{ color: '#111827', WebkitTextFillColor: '#111827', caretColor: '#111827' }}
                disabled={checking}
                required
              />

              <button type="submit" className="btn-primary w-full mt-4" disabled={checking}>
                Devam Et
              </button>

              <button type="button" className="btn-secondary w-full mt-3" onClick={() => navigate('/')} disabled={checking}>
                Ana Sayfa
              </button>
            </form>

            {error ? <p className="text-red-600 text-sm mt-3">{error}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>
      <div className="container mx-auto px-4 pt-28 pb-16 max-w-xl">
        <div className="card" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>
          <div className="mb-4">
            <BrandLogo withText />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>Admin Panel</h1>
          <p className="text-gray-700 mb-6" style={{ color: '#374151', WebkitTextFillColor: '#374151' }}>Bu bölüm sadece yetkili hesap tarafından görüntülenebilir.</p>

          {needsClaim ? (
            <div>
              <div className="text-gray-700" style={{ color: '#374151', WebkitTextFillColor: '#374151' }}>Admin henüz atanmadı. Bu kurulumu sadece yetkili hesap tamamlayabilir.</div>
              <button
                className="btn-primary w-full mt-4"
                type="button"
                onClick={async () => {
                  setError('');
                  const token = getAuthToken();
                  if (!token) {
                    setNeedsLogin(true);
                    return;
                  }
                  try {
                    const res = await fetch(`${API_BASE}/api/admin/claim`, {
                      method: 'POST',
                      headers: getAuthHeaders()
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      setError(data?.error || 'Admin atanamadı.');
                      return;
                    }
                    setNeedsClaim(false);
                    setAuthorized(true);
                  } catch (e2) {
                    setError('Admin atanamadı.');
                  }
                }}
              >
                Admin Panelini Aktifleştir
              </button>
            </div>
          ) : (
            <button
              className="btn-primary w-full"
              type="button"
              onClick={() => setAuthorized(true)}
            >
              Admin Paneli Aç
            </button>
          )}

          {error && !needsClaim ? (
            <button
              className="btn-secondary w-full mt-3"
              type="button"
              onClick={async () => {
                setError('');
                const token = getAuthToken();
                if (!token) {
                  setNeedsLogin(true);
                  return;
                }
                try {
                  const res = await fetch(`${API_BASE}/api/admin/reset-owner`, {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setError(data?.error || 'Admin sıfırlanamadı.');
                    return;
                  }
                  window.location.reload();
                } catch (e2) {
                  setError('Admin sıfırlanamadı.');
                }
              }}
            >
              Admin Sahibini Sıfırla (Local)
            </button>
          ) : null}

          {error ? <p className="text-red-600 text-sm mt-3">{error}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default AdminPasswordGate;
