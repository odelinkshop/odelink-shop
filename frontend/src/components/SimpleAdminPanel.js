import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Globe, DollarSign, TrendingUp, Settings, LogOut, Menu, X, Search, Filter, Plus, Star, Shield, RefreshCw, Undo2 } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { getAuthToken, logoutAuthSession } from '../utils/authStorage';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5000'
    : '');

const SimpleAdminPanel = ({ adminAccess }) => {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);

  const panelCardClass = 'bg-gray-800 rounded-xl border border-gray-700';
  const panelInnerCardClass = 'bg-gray-700 rounded-xl border border-gray-600';
  const safeText = (v) => (v === null || v === undefined ? '' : String(v));

  const normalizeTier = (raw) => {
    const t = safeText(raw).trim().toLowerCase();
    if (t === 'standart' || t === 'standard') return 'standart';
    if (t === 'profesyonel' || t === 'professional' || t === 'pro' || t === 'premium') return 'profesyonel';
    return t;
  };

  const tierLabel = (raw) => {
    const t = normalizeTier(raw);
    if (!t) return '-';
    if (t === 'standart') return 'Standart';
    if (t === 'profesyonel') return 'Profesyonel';
    return safeText(raw) || '-';
  };

  const cycleLabel = (raw) => {
    const c = safeText(raw).trim().toLowerCase();
    if (c === 'yearly') return 'Yıllık';
    if (c === 'monthly') return 'Aylık';
    return safeText(raw) || '-';
  };

  const capFromRow = (row) => row?.capabilities || row?.subscription_capabilities || null;

  const chipClass = 'inline-flex items-center rounded-full border border-gray-600 bg-gray-800 px-2 py-0.5 text-[11px] font-semibold text-gray-200';
  const chipWrapClass = 'mt-2 flex flex-wrap gap-1.5';

  const themeLabel = (raw) => {
    const t = (raw || '').toString().trim().toLowerCase();
    return t || '-';
  };

  const isProfesyonelPlanId = (planId, plansArg) => {
    const id = (planId || '').toString().trim();
    if (!id) return false;
    const list = Array.isArray(plansArg) ? plansArg : availablePlans;
    const p = (Array.isArray(list) ? list : []).find((x) => (x?.id || '').toString().trim() === id);
    const name = (p?.name || '').toString().trim().toLowerCase();
    return name === 'profesyonel' || name === 'professional' || name === 'pro' || name === 'premium';
  };

  const ensurePlansList = (plansArg) => (Array.isArray(plansArg) ? [...plansArg] : []);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const handleUnauthorized = () => {
    // authStorage.js zaten 401 durumunda session'ı temizliyor
    // Burada tekrar silmeye gerek yok - sadece yönlendir
    navigateRef.current('/auth');
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwner = Boolean(adminAccess?.isOwner);
  const hasGuestAccess = Boolean(adminAccess?.guestAccess);
  const accessLabel = isOwner ? 'OWNER' : hasGuestAccess ? 'GUEST' : 'LIMITED';
  const accessBadgeClass = isOwner
    ? 'bg-green-900/40 border-green-700 text-green-200'
    : hasGuestAccess
      ? 'bg-blue-900/40 border-blue-700 text-blue-200'
      : 'bg-gray-800/60 border-gray-700 text-gray-200';
  const canMutate = isOwner;

  const formatAdminReason = (data, fallback) => {
    const reason = (data?.reason || '').toString();
    if (reason === 'email_mismatch') {
      return 'Yetkisiz: ADMIN_CLAIM_EMAIL (veya ADMIN_EMAIL) Render ENV içinde giriş yaptığın email ile birebir aynı olmalı.';
    }
    if (reason === 'remote_bootstrap_disabled') {
      return 'Yetkisiz: Render ENV içine ALLOW_REMOTE_ADMIN_BOOTSTRAP=true ekleyip servisi yeniden başlatmalısın.';
    }
    if (reason === 'owner_mismatch') {
      return 'Yetkisiz: Admin başka bir hesapta atanmış görünüyor (owner mismatch).';
    }
    return (data?.error || fallback || 'Yetkisiz').toString();
  };

  const [searchQuery, setSearchQuery] = useState('');

  const [activeVisitors, setActiveVisitors] = useState(null);

  const [sites, setSites] = useState([]);

  const [adminUsers, setAdminUsers] = useState([]);
  const [adminSites, setAdminSites] = useState([]);
  const [adminPolling, setAdminPolling] = useState(false);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  const [userAssignSelection, setUserAssignSelection] = useState({});
  const [availablePlans, setAvailablePlans] = useState([]);

  const [adminOverview, setAdminOverview] = useState(null);
  const [adminPlanDistribution, setAdminPlanDistribution] = useState([]);
  const [adminRecent, setAdminRecent] = useState(null);
  const [adminSubscriptions, setAdminSubscriptions] = useState([]);

  const [adminIpLogs, setAdminIpLogs] = useState([]);

  const [ipDetailsOpen, setIpDetailsOpen] = useState(false);
  const [ipDetailsLog, setIpDetailsLog] = useState(null);

  const [refreshTick, setRefreshTick] = useState(0);
  const [ipUndoAvailable, setIpUndoAvailable] = useState(false);

  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [healthStatus, setHealthStatus] = useState(null);
  const [adminOwnerStatus, setAdminOwnerStatus] = useState(null);
  const [adminCredentialsStatus, setAdminCredentialsStatus] = useState(null);
  const [newAdminCredentials, setNewAdminCredentials] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loadPlans = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE}/api/subscriptions/plans`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;
        if (cancelled) return;
        
        // Backend'den gelen plans listesini kullan
        let plansList = Array.isArray(data?.plans) ? data.plans : [];
        if (plansList.length === 0 && data?.catalog?.tiers) {
           // Alternatif olarak catalog'dan devşir
           plansList = Object.entries(data.catalog.tiers).map(([key, val]) => ({
             id: key,
             name: key.toUpperCase(),
             tier: key
           }));
        }
        setAvailablePlans(plansList);
      } catch (e) {
        void e;
      }
    };

    loadPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  const deleteUser = async (userId) => {
    if (!isOwner) {
      setAdminError('Yetkisiz: Bu işlem sadece owner hesap tarafından yapılabilir.');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }

    if (!window.confirm('Bu kullanıcı silinsin mi? (Geri alınamaz)')) return;

    setAdminActionLoading(true);
    setAdminError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAdminError(data?.error || 'Kullanıcı silinemedi');
        return;
      }

      const reload = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const reloadData = await reload.json().catch(() => ({}));
      if (reload.ok) {
        setAdminUsers(Array.isArray(reloadData?.users) ? reloadData.users : []);
      }
    } catch (e) {
      setAdminError('Kullanıcı silinemedi');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const deleteSite = async (siteId) => {
    if (!isOwner) {
      setAdminError('Yetkisiz: Bu işlem sadece owner hesap tarafından yapılabilir.');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }

    if (!window.confirm('Bu site silinsin mi? (Geri alınamaz)')) return;

    setAdminActionLoading(true);
    setAdminError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/sites/${encodeURIComponent(siteId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAdminError(data?.error || 'Site silinemedi');
        return;
      }

      const reload = await fetch(`${API_BASE}/api/admin/sites`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const reloadData = await reload.json().catch(() => ({}));
      if (reload.ok) {
        setAdminSites(Array.isArray(reloadData?.sites) ? reloadData.sites : []);
      }
    } catch (e) {
      setAdminError('Site silinemedi');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const deleteUserSubscriptionRecord = async (userSubscriptionId) => {
    if (!isOwner) {
      setAdminError('Yetkisiz: Bu işlem sadece owner hesap tarafından yapılabilir.');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }

    if (!window.confirm('Bu abonelik kaydı silinsin mi? (Geri alınamaz)')) return;

    setAdminActionLoading(true);
    setAdminError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/subscriptions/${encodeURIComponent(userSubscriptionId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAdminError(data?.error || 'Abonelik silinemedi');
        return;
      }

      const reload = await fetch(`${API_BASE}/api/admin/subscriptions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const reloadData = await reload.json().catch(() => ({}));
      if (reload.ok) {
        setAdminSubscriptions(Array.isArray(reloadData?.subscriptions) ? reloadData.subscriptions : []);
      }
    } catch (e) {
      setAdminError('Abonelik silinemedi');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const undoClearIpLogs = async () => {
    if (!isOwner) {
      setAdminError('Yetkisiz: Bu işlem sadece owner hesap tarafından yapılabilir.');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }

    setAdminActionLoading(true);
    setAdminError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/ip-logs/undo-clear`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAdminError(data?.error || 'Geri alma başarısız');
        return;
      }
      setIpUndoAvailable(false);

      const reload = await fetch(`${API_BASE}/api/admin/ip-logs`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const reloadData = await reload.json().catch(() => ({}));
      if (reload.ok) {
        setAdminIpLogs(Array.isArray(reloadData?.logs) ? reloadData.logs : []);
      }
    } catch (e) {
      setAdminError('Geri alma başarısız');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const clearIpLogs = async () => {
    if (!isOwner) {
      setAdminError('Yetkisiz: Bu işlem sadece owner hesap tarafından yapılabilir.');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }

    if (!window.confirm('Tüm IP kayıtları temizlensin mi? (Geri alınamaz)')) return;

    setAdminActionLoading(true);
    setAdminError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/ip-logs/clear`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAdminError(data?.error || 'IP kayıtları temizlenemedi');
        return;
      }
      setAdminIpLogs([]);
      if (Number(data?.affected || 0) > 0) setIpUndoAvailable(true);
    } catch (e) {
      setAdminError('IP kayıtları temizlenemedi');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const deleteIpLog = async (logId) => {
    if (!isOwner) {
      setAdminError('Yetkisiz: Bu işlem sadece owner hesap tarafından yapılabilir.');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }

    if (!window.confirm('Bu IP kaydı silinsin mi?')) return;

    setAdminActionLoading(true);
    setAdminError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/ip-logs/${encodeURIComponent(logId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAdminError(data?.error || 'IP kaydı silinemedi');
        return;
      }
      setAdminIpLogs((prev) => (prev || []).filter((x) => x.id !== logId));
    } catch (e) {
      setAdminError('IP kaydı silinemedi');
    } finally {
      setAdminActionLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/api/users/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            handleUnauthorized();
            return;
          }
          setError(data?.error || 'Dashboard verileri alınamadı');
          return;
        }

        setSites(Array.isArray(data.sites) ? data.sites : []);
      } catch (e) {
        setError('Backend veya veritabanına bağlanılamadı.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [refreshTick]);

  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    const token = getAuthToken();
    if (!token) return;

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      try {
        const headers = {
          Authorization: `Bearer ${token}`
        };

        const adminKey = process.env.REACT_APP_ADMIN_METRICS_KEY;
        if (adminKey) {
          headers['x-odelink-admin-key'] = adminKey;
        }

        const res = await fetch(`${API_BASE}/api/metrics/active-visitors`, {
          headers
        });
        const data = await res.json();
        if (!res.ok) return;
        setActiveVisitors(Number(data?.activeVisitors ?? 0));
      } catch (e) {
        void e;
      }
    };

    poll();
    const id = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [activeTab, refreshTick]);

  const hasAdminError = Boolean((adminError || '').toString().trim());
  const hasAdminSuccess = Boolean((adminSuccess || '').toString().trim());

  useEffect(() => {
    if (!hasAdminSuccess) return;
    const id = setTimeout(() => {
      setAdminSuccess('');
    }, 4500);
    return () => clearTimeout(id);
  }, [hasAdminSuccess]);

  useEffect(() => {
    if (activeTab !== 'settings') return;
    const token = getAuthToken();
    if (!token) return;

    let cancelled = false;

    const load = async () => {
      if (cancelled) return;
      setSettingsLoading(true);
      setSettingsError('');
      try {
        const healthRes = await fetch(`${API_BASE}/api/health`).catch(() => null);
        if (healthRes && healthRes.ok) {
          const health = await healthRes.json().catch(() => null);
          if (!cancelled) setHealthStatus(health);
        } else {
          if (!cancelled) setHealthStatus(null);
        }

        const ownerRes = await fetch(`${API_BASE}/api/admin/status`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const ownerData = await ownerRes.json().catch(() => ({}));
        if (!ownerRes.ok) {
          if (!cancelled) setAdminOwnerStatus(null);
        } else {
          if (!cancelled) setAdminOwnerStatus(ownerData);
        }

        const credRes = await fetch(`${API_BASE}/api/admin/credentials/status`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const credData = await credRes.json().catch(() => ({}));
        if (!credRes.ok) {
          if (credRes.status === 403) {
            if (!cancelled) setAdminCredentialsStatus({ hasCredentials: false, username: null, forbidden: true });
          } else {
            if (!cancelled) setAdminCredentialsStatus(null);
          }
        } else {
          if (!cancelled) setAdminCredentialsStatus({ ...credData, forbidden: false });
        }
      } catch (e) {
        if (!cancelled) setSettingsError('Ayarlar yüklenemedi.');
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab, refreshTick]);

  const initAdminCredentials = async () => {
    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }
    setSettingsLoading(true);
    setSettingsError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/credentials/init`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSettingsError(data?.error || 'Admin bilgileri oluşturulamadı');
        return;
      }
      setNewAdminCredentials(data?.credentials || null);
      setAdminCredentialsStatus({ hasCredentials: true, username: data?.credentials?.username || null, forbidden: false });
    } catch (e) {
      setSettingsError('Admin bilgileri oluşturulamadı');
    } finally {
      setSettingsLoading(false);
    }
  };

  const rotateAdminCredentials = async () => {
    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }
    setSettingsLoading(true);
    setSettingsError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/credentials/rotate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSettingsError(data?.error || 'Admin bilgileri yenilenemedi');
        return;
      }
      setNewAdminCredentials(data?.credentials || null);
      setAdminCredentialsStatus({ hasCredentials: true, username: data?.credentials?.username || null, forbidden: false });
    } catch (e) {
      setSettingsError('Admin bilgileri yenilenemedi');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Advertisement management functions removed

  useEffect(() => {
    if (!['dashboard', 'users', 'sites', 'subscriptions', 'ip'].includes(activeTab)) return;
    const token = getAuthToken();
    if (!token) return;

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      setAdminPolling(true);
      setAdminError('');
      try {
        if (activeTab === 'dashboard') {
          const res = await fetch(`${API_BASE}/api/admin/overview`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            if (res.status === 401) {
              handleUnauthorized();
              return;
            }
            if (res.status === 403 || res.status === 409) {
              setAdminError(formatAdminReason(data, 'Özet veriler alınamadı'));
              return;
            }
            setAdminError(data?.error || 'Özet veriler alınamadı');
            return;
          }
          setAdminOverview(data?.overview || null);
          setAdminPlanDistribution(Array.isArray(data?.planDistribution) ? data.planDistribution : []);
          setAdminRecent(data?.recent || null);
        }

        if (activeTab === 'users') {
          const res = await fetch(`${API_BASE}/api/admin/users`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            if (res.status === 401) {
              handleUnauthorized();
              return;
            }
            if (res.status === 403 || res.status === 409) {
              setAdminError(formatAdminReason(data, 'Kullanıcılar alınamadı'));
              return;
            }
            setAdminError(data?.error || 'Kullanıcılar alınamadı');
            return;
          }
          setAdminUsers(Array.isArray(data?.users) ? data.users : []);
        }

        if (activeTab === 'sites') {
          const res = await fetch(`${API_BASE}/api/admin/sites`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            if (res.status === 401) {
              handleUnauthorized();
              return;
            }
            if (res.status === 403 || res.status === 409) {
              setAdminError(formatAdminReason(data, 'Siteler alınamadı'));
              return;
            }
            setAdminError(data?.error || 'Siteler alınamadı');
            return;
          }
          setAdminSites(Array.isArray(data?.sites) ? data.sites : []);
        }

        if (activeTab === 'subscriptions') {
          const res = await fetch(`${API_BASE}/api/admin/subscriptions`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            if (res.status === 401) {
              handleUnauthorized();
              return;
            }
            if (res.status === 403 || res.status === 409) {
              setAdminError(formatAdminReason(data, 'Abonelik listesi alınamadı'));
              return;
            }
            setAdminError(data?.error || 'Abonelik listesi alınamadı');
            return;
          }
          setAdminSubscriptions(Array.isArray(data?.subscriptions) ? data.subscriptions : []);
        }

        if (activeTab === 'ip') {
          const res = await fetch(`${API_BASE}/api/admin/ip-logs`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            if (res.status === 401) {
              handleUnauthorized();
              return;
            }
            if (res.status === 403 || res.status === 409) {
              setAdminError(formatAdminReason(data, 'IP kayıtları alınamadı'));
              return;
            }
            setAdminError(data?.error || 'IP kayıtları alınamadı');
            return;
          }
          setAdminIpLogs(Array.isArray(data?.logs) ? data.logs : []);
        }
      } catch (e) {
        setAdminError('Backend veya veritabanına bağlanılamadı.');
      } finally {
        setAdminPolling(false);
      }
    };

    poll();
    const id = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [activeTab, refreshTick]);

  const assignSubscription = async (userId, subscriptionId, billingCycle) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }

    const rawSubId = (subscriptionId || '').toString().trim();
    const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawSubId);

    setAdminActionLoading(true);
    setAdminError('');
    setAdminSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${encodeURIComponent(userId)}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(looksLikeUuid
          ? { subscriptionId: rawSubId, billingCycle }
          : { planName: rawSubId, billingCycle })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAdminError(data?.error || 'Abonelik atanamadı');
        return;
      }

      const reload = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const reloadData = await reload.json().catch(() => ({}));
      if (reload.ok) {
        setAdminUsers(Array.isArray(reloadData?.users) ? reloadData.users : []);
      }

      setAdminSuccess('Plan başarıyla atandı');
    } catch (e) {
      setAdminError('Abonelik atanamadı');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const cancelUserSubscription = async (userId) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }

    setAdminActionLoading(true);
    setAdminError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${encodeURIComponent(userId)}/subscription/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAdminError(data?.error || 'Abonelik iptal edilemedi');
        return;
      }

      const reload = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const reloadData = await reload.json().catch(() => ({}));
      if (reload.ok) {
        setAdminUsers(Array.isArray(reloadData?.users) ? reloadData.users : []);
      }
    } catch (e) {
      setAdminError('Abonelik iptal edilemedi');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const setSiteStatus = async (siteId, status) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }

    setAdminActionLoading(true);
    setAdminError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/sites/${encodeURIComponent(siteId)}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAdminError(data?.error || 'Site durumu güncellenemedi');
        return;
      }

      const reload = await fetch(`${API_BASE}/api/admin/sites`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const reloadData = await reload.json().catch(() => ({}));
      if (reload.ok) {
        setAdminSites(Array.isArray(reloadData?.sites) ? reloadData.sites : []);
      }
    } catch (e) {
      setAdminError('Site durumu güncellenemedi');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'users', label: 'Kullanıcılar', icon: Users },
    { id: 'sites', label: 'Siteler', icon: Globe },
    { id: 'subscriptions', label: 'Abonelikler', icon: DollarSign },
    { id: 'ip', label: 'IP', icon: Shield },
    { id: 'settings', label: 'Ayarlar', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex">
        <div className="fixed inset-y-0 left-0 z-50 w-64 min-w-[16rem] flex-none shrink-0 bg-gray-800 lg:static lg:inset-0" />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-800 border-b border-gray-700 h-16" />
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-gray-800/70 border border-gray-700" />
              ))}
            </div>
            <div className="mt-6 h-[48vh] rounded-xl bg-gray-800/70 border border-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 max-w-xl w-full">
          <h2 className="text-2xl font-bold text-white mb-2">Veri alınamadı</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex gap-3">
            <button className="bg-blue-600 text-white px-5 py-3 rounded-lg" onClick={() => window.location.reload()}>
              Tekrar Dene
            </button>
            <button className="bg-gray-700 text-white px-5 py-3 rounded-lg" onClick={() => navigate('/auth')}>
              Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 min-w-[16rem] flex-none shrink-0 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <BrandLogo withText size={34} textClassName="text-white text-lg" />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-red-600 text-white border-r-4 border-red-400'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
          <button
            className="flex items-center text-gray-400 hover:text-white transition-colors"
            onClick={async () => {
              try {
                await logoutAuthSession();
              } catch (e) {
                void e;
              }
              navigate('/auth');
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Header */}
        <header className="bg-gray-800 border-b border-gray-700 h-auto sm:h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-3 sm:py-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white mr-4"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h1>
            <span className={`ml-3 inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border ${accessBadgeClass}`}>
              {accessLabel}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              type="button"
              className="h-10 px-4 w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white transition-colors"
              onClick={() => setRefreshTick((t) => t + 1)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenile
            </button>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 h-10 w-full rounded-xl pl-10 text-sm leading-5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button type="button" className="h-10 w-full sm:w-10 inline-flex items-center justify-center rounded-xl bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white transition-colors">
              <Filter className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {hasAdminError ? (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-200">
              {adminError}
            </div>
          ) : null}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {!hasAdminError ? (
                <>

                  {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-blue-200" />
                    <span className="text-2xl font-bold">{Number(adminOverview?.total_users || 0)}</span>
                  </div>
                  <h3 className="text-lg font-semibold">Toplam Kullanıcı</h3>
                  <p className="text-blue-200 text-sm mt-1">{adminPolling ? 'Güncelleniyor…' : 'Canlı'}</p>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-white border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <Globe className="w-8 h-8 text-green-200" />
                    <span className="text-2xl font-bold">{Number(adminOverview?.total_sites || 0)}</span>
                  </div>
                  <h3 className="text-lg font-semibold">Toplam Site</h3>
                  <p className="text-green-200 text-sm mt-1">{Number(adminOverview?.active_sites || 0)} aktif</p>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-purple-200" />
                    <span className="text-2xl font-bold">{Number(adminOverview?.active_subscriptions || 0)}</span>
                  </div>
                  <h3 className="text-lg font-semibold">Aktif Abonelik</h3>
                  <p className="text-purple-200 text-sm mt-1">Manuel Shopier</p>
                </div>

                <div className="bg-gradient-to-br from-amber-600 to-orange-800 rounded-xl p-6 text-white border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <Star className="w-8 h-8 text-amber-200" />
                    <span className="text-2xl font-bold">{adminPlanDistribution.reduce((acc, x) => acc + Number(x?.count || 0), 0)}</span>
                  </div>
                  <h3 className="text-lg font-semibold">Dağılım (Aktif)</h3>
                  <p className="text-amber-200 text-sm mt-1">Paket / periyot</p>
                </div>

                <div className="bg-gradient-to-br from-red-600 to-rose-800 rounded-xl p-6 text-white border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-rose-200" />
                    <span className="text-2xl font-bold">{activeVisitors === null ? '-' : activeVisitors}</span>
                  </div>
                  <h3 className="text-lg font-semibold">Canlı Ziyaretçi</h3>
                  <p className="text-rose-200 text-sm mt-1">Son 60 sn</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className={`${panelCardClass} p-6`}>
                <h2 className="text-xl font-bold text-white mb-4">Son Aktiviteler</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className={`${panelInnerCardClass} p-4`}>
                    <h3 className="text-white font-semibold mb-3">Son Kullanıcılar</h3>
                    <div className="space-y-2">
                      {(adminRecent?.users || []).length === 0 ? (
                        <p className="text-gray-300 text-sm">Kayıt yok</p>
                      ) : (
                        (adminRecent?.users || []).map((u) => (
                          <div key={u.id} className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{u.email}</p>
                              <p className="text-gray-400 text-xs truncate">{u.name}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3">Son Siteler</h3>
                    <div className="space-y-2">
                      {(adminRecent?.sites || []).length === 0 ? (
                        <p className="text-gray-300 text-sm">Site yok</p>
                      ) : (
                        (adminRecent?.sites || []).map((s) => (
                          <div key={s.id} className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{s.subdomain}</p>
                              <p className="text-gray-400 text-xs truncate">{s.owner_email}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{s.status === 'active' ? 'Aktif' : 'Pasif'}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3">Son Abonelikler</h3>
                    <div className="space-y-2">
                      {(adminRecent?.subscriptions || []).length === 0 ? (
                        <p className="text-gray-300 text-sm">Abonelik yok</p>
                      ) : (
                        (adminRecent?.subscriptions || []).map((s) => (
                          <div key={s.id} className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{s.user_email}</p>
                              <p className="text-gray-400 text-xs truncate">{s.plan_name}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Plan Dağılımı (Aktif)</h2>
                {(adminPlanDistribution || []).length === 0 ? (
                  <p className="text-gray-300">Aktif abonelik yok</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {adminPlanDistribution.map((p, idx) => (
                      <div key={`${p.plan_name}-${p.billing_cycle}-${idx}`} className="bg-gray-700 rounded-lg p-4">
                        <p className="text-white font-semibold">{p.plan_name}</p>
                        <p className="text-gray-300 text-sm">{p.billing_cycle === 'yearly' ? 'Yıllık' : 'Aylık'}</p>
                        <p className="text-white text-2xl font-bold mt-2">{Number(p.count || 0)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Manager Quick Access */}
              <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Tema Yönetimi</h3>
                    <p className="text-purple-200 mb-4">Cole Buxton Shopify temasını çek ve eski temaları sil</p>
                  </div>
                  <button
                    onClick={() => navigate('/admin')}
                    className="px-6 py-3 bg-white text-purple-900 rounded-lg font-semibold hover:bg-purple-50 transition shadow-lg"
                  >
                    Yönetim Paneli →
                  </button>
                </div>
              </div>
                </>
              ) : null}
            </div>
          )}

          {!hasAdminError && activeTab === 'ip' && (
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">IP Kayıtları</h2>
                  <p className="text-gray-300 text-sm">Kayıt olan kullanıcıların son IP/User-Agent logları. Liste 5 sn'de bir güncellenir.</p>
                </div>
                <div className="flex items-center gap-3">
                  {canMutate && ipUndoAvailable ? (
                    <button
                      type="button"
                      className="bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      disabled={adminActionLoading}
                      onClick={undoClearIpLogs}
                      title="Son temizlemeyi geri al"
                    >
                      <Undo2 className="w-4 h-4 inline-block mr-2" />
                      Geri Al
                    </button>
                  ) : null}
                  {canMutate ? (
                    <button
                      type="button"
                      className="bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      disabled={adminActionLoading}
                      onClick={clearIpLogs}
                    >
                      {adminActionLoading ? 'İşleniyor…' : 'Temizle'}
                    </button>
                  ) : (
                    <div className="text-xs text-gray-400">Sadece owner temizleyebilir</div>
                  )}
                </div>
              </div>

              {adminError ? (
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-200 mb-4">{adminError}</div>
              ) : null}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-white table-fixed">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 w-[210px] whitespace-nowrap">Email</th>
                      <th className="text-left py-3 px-4 w-[90px] whitespace-nowrap">Event</th>
                      <th className="text-left py-3 px-4 w-[150px] whitespace-nowrap">IP</th>
                      <th className="text-left py-3 px-4 w-[140px] whitespace-nowrap">Kaynak</th>
                      <th className="text-left py-3 px-4 w-[200px] whitespace-nowrap">Tarih</th>
                      <th className="text-left py-3 px-4 w-[320px] whitespace-nowrap">User-Agent</th>
                      <th className="text-left py-3 px-4 w-[190px] whitespace-nowrap">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminIpLogs
                      .filter((l) => {
                        const q = searchQuery.trim().toLowerCase();
                        if (!q) return true;
                        const hay = `${l?.email || ''} ${l?.ip || ''} ${l?.user_agent || ''}`.toLowerCase();
                        return hay.includes(q);
                      })
                      .map((l) => (
                        <tr key={l.id} className="border-b border-gray-700 hover:bg-gray-700">
                          <td className="py-3 px-4">
                            <div className="font-medium break-all leading-snug">{l.email || '-'}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-200 whitespace-nowrap">{l.event_type || '-'}</td>
                          <td className="py-3 px-4 text-gray-200 font-mono whitespace-nowrap" title={l.ip_chain || ''}>{l.ip || '-'}</td>
                          <td className="py-3 px-4 text-gray-300 text-sm whitespace-nowrap">{l.ip_source || '-'}</td>
                          <td className="py-3 px-4 text-gray-300 whitespace-nowrap">{l.created_at ? new Date(l.created_at).toLocaleString() : '-'}</td>
                          <td className="py-3 px-4 text-gray-300">
                            <div className="truncate" title={l.user_agent || ''}>{l.user_agent || '-'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                type="button"
                                className="bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                                disabled={adminActionLoading}
                                onClick={() => {
                                  setIpDetailsLog(l);
                                  setIpDetailsOpen(true);
                                }}
                              >
                                Detay
                              </button>
                              {canMutate ? (
                                <button
                                  type="button"
                                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                  disabled={adminActionLoading}
                                  onClick={() => deleteIpLog(l.id)}
                                >
                                  Sil
                                </button>
                              ) : (
                                <div className="text-xs text-gray-400">Sadece owner silebilir</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {ipDetailsOpen && ipDetailsLog ? (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60" onClick={() => { setIpDetailsOpen(false); setIpDetailsLog(null); }} />
                  <div className="relative w-full max-w-3xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
                      <div className="text-white font-black">IP Detay</div>
                      <button
                        type="button"
                        className="p-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white"
                        onClick={() => { setIpDetailsOpen(false); setIpDetailsLog(null); }}
                        aria-label="Kapat"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <div className="text-xs text-white/60 font-semibold">Email</div>
                          <div className="text-sm text-white mt-1 break-all">{ipDetailsLog.email || '-'}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <div className="text-xs text-white/60 font-semibold">Event / IP / Kaynak</div>
                          <div className="text-sm text-white mt-1 font-mono break-all">
                            {(ipDetailsLog.event_type || '-') + '  |  ' + (ipDetailsLog.ip || '-') + '  |  ' + (ipDetailsLog.ip_source || '-')}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="text-xs text-white/60 font-semibold">User-Agent</div>
                        <div className="text-xs text-white/85 mt-2 break-words">{ipDetailsLog.user_agent || '-'}</div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="text-xs text-white/60 font-semibold">IP Zinciri (Proxy/VPN dahil)</div>
                        <pre className="text-xs text-white/85 mt-2 whitespace-pre-wrap break-words font-mono">{ipDetailsLog.ip_chain || '-'}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {!hasAdminError && activeTab === 'users' && (
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Kullanıcılar</h2>
                </div>
                <div className="text-sm text-gray-300">{adminPolling ? 'Güncelleniyor…' : ''}</div>
              </div>

              {adminError ? (
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-200 mb-4">{adminError}</div>
              ) : null}

              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Kullanıcı</th>
                      <th className="text-left py-3 px-4">Abonelik</th>
                      <th className="text-left py-3 px-4">Siteler</th>
                      <th className="text-left py-3 px-4">Plan Ata</th>
                      <th className="text-left py-3 px-4">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers
                      .filter((u) => {
                        const q = searchQuery.trim().toLowerCase();
                        if (!q) return true;
                        const hay = `${u?.name || ''} ${u?.email || ''}`.toLowerCase();
                        return hay.includes(q);
                      })
                      .map((u) => (
                        <tr key={u.id} className="border-b border-gray-700 hover:bg-gray-700">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{u.name}</p>
                              <p className="text-sm text-gray-400">{u.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <p className="font-medium">{u.subscription_name || 'Yok'}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-full border border-gray-600 bg-gray-800 px-2 py-0.5 text-xs font-semibold text-gray-200">
                                  {u.subscription_name ? tierLabel(u.subscription_name) : 'Yok'}
                                </span>
                                <span className="inline-flex items-center rounded-full border border-gray-600 bg-gray-800 px-2 py-0.5 text-xs font-semibold text-gray-200">
                                  {u.subscription_name ? cycleLabel(u.billing_cycle) : '-'}
                                </span>
                                <span className="inline-flex items-center rounded-full border border-gray-600 bg-gray-800 px-2 py-0.5 text-xs font-semibold text-gray-200">
                                  {u.subscription_name ? (safeText(u.subscription_status) || '-') : '-'}
                                </span>
                              </div>
                              {capFromRow(u) ? (
                                <div className={chipWrapClass}>
                                  <span className={chipClass}>
                                    Site: {Number(capFromRow(u)?.currentSites || u.total_sites || 0)}/{Number(capFromRow(u)?.maxSites || 0) || '-'}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <p className="font-medium">{Number(u.total_sites || 0)}</p>
                              <p className="text-gray-400">{Number(u.active_sites || 0)} aktif</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                              {(() => {
                                const plansForSelect = ensurePlansList(availablePlans).filter((p) => {
                                  const id = (p?.id || '').toString().trim();
                                  const name = (p?.name || '').toString().trim().toLowerCase();
                                  if (!id) return false;
                                  return name === 'standart' || name === 'standard' || name === 'profesyonel' || name === 'professional';
                                });
                                return (
                              <select
                                className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                                value={(() => {
                                  const current = userAssignSelection?.[u.id]?.planId;
                                  if (current && plansForSelect.some((p) => (p?.id || '').toString().trim() === current)) return current;
                                  const byName = plansForSelect.find((p) => (p?.name || '').toString().trim().toLowerCase() === 'standart');
                                  const first = plansForSelect[0];
                                  return byName?.id || first?.id || '';
                                })()}
                                onChange={(e) => {
                                  const nextPlanId = e.target.value;
                                  const forceYearly = isProfesyonelPlanId(nextPlanId, plansForSelect);
                                  setUserAssignSelection((prev) => ({
                                    ...(prev || {}),
                                    [u.id]: {
                                      ...(prev?.[u.id] || {}),
                                      planId: nextPlanId,
                                      cycle: forceYearly ? 'yearly' : (prev?.[u.id]?.cycle || 'monthly')
                                    }
                                  }));
                                }}
                              >
                                {plansForSelect.length === 0 ? <option value="">Planlar yükleniyor…</option> : null}
                                {plansForSelect.map((p) => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                                );
                              })()}
                              <select
                                className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                                value={isProfesyonelPlanId(userAssignSelection?.[u.id]?.planId, availablePlans) ? 'yearly' : (userAssignSelection?.[u.id]?.cycle || 'monthly')}
                                disabled={isProfesyonelPlanId(userAssignSelection?.[u.id]?.planId, availablePlans)}
                                onChange={(e) => {
                                  const planId = userAssignSelection?.[u.id]?.planId;
                                  if (isProfesyonelPlanId(planId, availablePlans) && e.target.value !== 'yearly') return;
                                  setUserAssignSelection((prev) => ({
                                    ...(prev || {}),
                                    [u.id]: {
                                      ...(prev?.[u.id] || {}),
                                      cycle: e.target.value
                                    }
                                  }));
                                }}
                              >
                                {isProfesyonelPlanId(userAssignSelection?.[u.id]?.planId, availablePlans) ? null : (
                                  <option value="monthly">Aylık</option>
                                )}
                                <option value="yearly">Yıllık</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-2 justify-end">
                              {canMutate ? (
                                <button
                                  type="button"
                                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                  disabled={adminActionLoading}
                                  onClick={() => assignSubscription(
                                    u.id,
                                    userAssignSelection?.[u.id]?.planId,
                                    userAssignSelection?.[u.id]?.cycle || 'monthly'
                                  )}
                                >
                                  {adminActionLoading ? 'İşleniyor…' : 'Ata'}
                                </button>
                              ) : (
                                <div className="text-xs text-gray-400">Sadece owner atayabilir</div>
                              )}
                              {canMutate ? (
                                <button
                                  type="button"
                                  className="bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                                  disabled={adminActionLoading}
                                  onClick={() => cancelUserSubscription(u.id)}
                                >
                                  {adminActionLoading ? 'İşleniyor…' : 'İptal'}
                                </button>
                              ) : (
                                <div className="text-xs text-gray-400">Sadece owner iptal edebilir</div>
                              )}
                              {canMutate ? (
                                <button
                                  type="button"
                                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                  disabled={adminActionLoading}
                                  onClick={() => deleteUser(u.id)}
                                >
                                  Sil
                                </button>
                              ) : (
                                <div className="text-xs text-gray-400">Sadece owner silebilir</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!hasAdminError && activeTab === 'sites' && (
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Siteler</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center" onClick={() => navigate('/panel')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Site
                </button>
              </div>

              {adminError ? (
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-200 mb-4">{adminError}</div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(adminSites.length > 0 ? adminSites : sites)
                  .filter((s) => {
                    const q = searchQuery.trim().toLowerCase();
                    if (!q) return true;
                    const hay = `${s?.name || ''} ${s?.subdomain || ''} ${s?.owner_email || ''}`.toLowerCase();
                    return hay.includes(q);
                  })
                  .map((site) => (
                    <div key={site.id} className="bg-gray-700 rounded-xl p-6 hover:bg-gray-600 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white">{site.name}</h3>
                          <p className="text-sm text-gray-400">{site.subdomain || site.url}</p>
                          {site.owner_email ? <p className="text-xs text-gray-400 mt-1">{site.owner_email}</p> : null}
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          site.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {site.status === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Tema:</span>
                          <span className="text-white">{themeLabel(site.theme)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Subdomain:</span>
                          <span className="text-white">{site.subdomain}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm" onClick={() => window.open(`https://odelink.shop/s/${encodeURIComponent(site.subdomain)}`, '_blank', 'noopener,noreferrer')}>
                          Önizleme
                        </button>
                        <button className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-500 transition-colors text-sm" onClick={() => window.open(`https://odelink.shop/s/${encodeURIComponent(site.subdomain)}`, '_blank', 'noopener,noreferrer')}>
                          Aç
                        </button>
                        {canMutate ? (
                          <>
                            <button
                              type="button"
                              className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-black transition-colors text-sm"
                              disabled={adminActionLoading}
                              onClick={() => setSiteStatus(site.id, site.status === 'active' ? 'inactive' : 'active')}
                            >
                              {site.status === 'active' ? 'Kapat' : 'Aç'}
                            </button>
                            <button
                              type="button"
                              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                              disabled={adminActionLoading}
                              onClick={() => deleteSite(site.id)}
                            >
                              Sil
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {!hasAdminError && activeTab === 'subscriptions' && (
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Abonelikler</h2>
                  <p className="text-gray-300 text-sm">Tüm abonelik kayıtları. Liste 5 sn'de bir güncellenir.</p>
                </div>
                <div className="text-sm text-gray-300">{adminPolling ? 'Güncelleniyor…' : ''}</div>
              </div>

              {adminError ? (
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-200 mb-4">{adminError}</div>
              ) : null}

              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Kullanıcı</th>
                      <th className="text-left py-3 px-4">Plan</th>
                      <th className="text-left py-3 px-4">Periyot</th>
                      <th className="text-left py-3 px-4">Durum</th>
                      <th className="text-left py-3 px-4">Bitiş</th>
                      <th className="text-left py-3 px-4">Limit / Özellik</th>
                      <th className="text-left py-3 px-4">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminSubscriptions
                      .filter((s) => {
                        const q = searchQuery.trim().toLowerCase();
                        if (!q) return true;
                        const hay = `${s?.user_email || ''} ${s?.user_name || ''} ${s?.plan_name || ''}`.toLowerCase();
                        return hay.includes(q);
                      })
                      .map((s) => (
                        <tr key={s.user_subscription_id} className="border-b border-gray-700 hover:bg-gray-700">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{s.user_name}</p>
                              <p className="text-sm text-gray-400">{s.user_email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{tierLabel(s.plan_name)}</div>
                            <div className="text-xs text-gray-400">₺{Number(s.price || 0).toFixed(2)}</div>
                          </td>
                          <td className="py-3 px-4">{cycleLabel(s.billing_cycle)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'
                            }`}>
                              {s.status === 'active' ? 'Aktif' : s.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{s.end_date ? new Date(s.end_date).toLocaleDateString() : '-'}</td>
                          <td className="py-3 px-4">
                            {capFromRow(s) ? (
                              <div className="flex flex-wrap gap-1">
                                <span className={chipClass}>
                                  Site: {Number(capFromRow(s)?.currentSites || s.total_sites || 0)}/{Number(capFromRow(s)?.maxSites || 0) || '-'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {canMutate ? (
                              <>
                                <button
                                  type="button"
                                  className="bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                                  disabled={adminActionLoading}
                                  onClick={() => cancelUserSubscription(s.user_id)}
                                >
                                  {adminActionLoading ? 'İşleniyor…' : 'İptal'}
                                </button>
                                <button
                                  type="button"
                                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm ml-2"
                                  disabled={adminActionLoading}
                                  onClick={() => deleteUserSubscriptionRecord(s.user_subscription_id)}
                                >
                                  Sil
                                </button>
                              </>
                            ) : (
                              <div className="text-xs text-gray-400">Sadece owner işlem yapabilir</div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Ayarlar</h2>
              <div className="space-y-6">
                {settingsError ? (
                  <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-200">{settingsError}</div>
                ) : null}

                <div className="bg-gray-700 rounded-xl p-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h3 className="text-lg font-semibold text-white">Sistem Durumu</h3>
                    <span className="text-sm text-gray-300">{settingsLoading ? 'Kontrol ediliyor…' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-300 text-sm">API</p>
                      <p className="text-white font-semibold break-all">{API_BASE}</p>
                      <p className="text-gray-400 text-sm mt-2">Health</p>
                      <p className={`text-sm ${healthStatus?.status === 'ok' ? 'text-green-400' : 'text-gray-300'}`}>
                        {healthStatus?.status ? `OK (${healthStatus.status})` : 'Bilinmiyor'}
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-300 text-sm">Admin Sahibi</p>
                      <p className="text-white font-semibold">{adminOwnerStatus?.hasOwner === true ? 'Atanmış' : adminOwnerStatus?.hasOwner === false ? 'Atanmamış' : 'Bilinmiyor'}</p>
                      <p className="text-gray-400 text-sm mt-2">Admin Credentials</p>
                      <p className="text-white text-sm">
                        {adminCredentialsStatus?.forbidden ? 'Yetkin yok (403)' : adminCredentialsStatus?.hasCredentials ? `Var (${adminCredentialsStatus?.username || '-'})` : 'Yok'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Hızlı Aksiyonlar (Güvenli)</h3>
                  <p className="text-gray-300 text-sm mb-4">Bu işlemler admin panel güvenliği içindir. Üretimde bazıları sadece local istekle çalışabilir.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      disabled={settingsLoading}
                      onClick={initAdminCredentials}
                    >
                      Admin Credentials Oluştur
                    </button>
                    <button
                      type="button"
                      className="bg-gray-800 text-white px-5 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium"
                      disabled={settingsLoading}
                      onClick={rotateAdminCredentials}
                    >
                      Admin Credentials Yenile
                    </button>
                  </div>

                  {newAdminCredentials ? (
                    <div className="mt-4 bg-gray-800 rounded-lg p-4">
                      <p className="text-yellow-200 text-sm font-medium mb-2">Yeni admin bilgileri (bir kez gösterilir):</p>
                      <p className="text-gray-300 text-sm">Username</p>
                      <p className="text-white font-mono break-all mb-3">{newAdminCredentials.username}</p>
                      <p className="text-gray-300 text-sm">Key</p>
                      <p className="text-white font-mono break-all">{newAdminCredentials.key}</p>
                    </div>
                  ) : null}
                </div>

                <div className="bg-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Shopier Manuel Onay Prosedürü</h3>
                  <div className="text-gray-200 text-sm space-y-2">
                    <p>1) Kullanıcı sitede paketi seçer ve Shopier mağazaya gider.</p>
                    <p>2) Satın alırken Shopier'de <span className="font-semibold">Sipariş Notu</span> alanına kayıt olduğu e-postayı yazar.</p>
                    <p>3) Sen Shopier siparişi kontrol edersin.</p>
                    <p>4) Admin Panel → Kullanıcılar: ilgili kullanıcıyı bul → planı (Standart/Profesyonel) ve periyodu (Aylık/Yıllık) seç → <span className="font-semibold">Ata</span>.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SimpleAdminPanel;


