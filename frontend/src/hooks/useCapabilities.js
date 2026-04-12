import { useEffect, useRef, useState } from 'react';
import useAuthSession from './useAuthSession';
import { getApiBase } from '../utils/apiBase';
import { getAuthHeaders } from '../utils/authStorage';

const API_BASE = getApiBase();

const CAPS_CACHE_KEY = 'odelink_cache_capabilities_v1';
const CAPS_CACHE_TS_KEY = 'odelink_cache_capabilities_ts_v1';
const CAPS_CACHE_TTL_MS = 5 * 60 * 1000;

export default function useCapabilities() {
  const [capabilities, setCapabilities] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthSession();
  const capabilitiesRef = useRef(null);

  useEffect(() => {
    capabilitiesRef.current = capabilities;
  }, [capabilities]);

  useEffect(() => {
    setLoading(true);

    try {
      const raw = localStorage.getItem(CAPS_CACHE_KEY);
      const tsRaw = localStorage.getItem(CAPS_CACHE_TS_KEY);
      const ts = tsRaw ? Number(tsRaw) : 0;
      const cached = raw ? JSON.parse(raw) : null;
      const fresh = ts && Number.isFinite(ts) ? (Date.now() - ts) < CAPS_CACHE_TTL_MS : false;
      if (fresh && cached && typeof cached === 'object') {
        setCapabilities(cached);
      }
    } catch (e) {
      void e;
    }

    let cancelled = false;

    const load = async () => {
      try {
        if (!token) {
          if (!cancelled) setCapabilities(null);
          return;
        }

        const res = await fetch(`${API_BASE}/api/subscriptions/capabilities`, {
          headers: getAuthHeaders()
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) setCapabilities(null);
          return;
        }

        const caps = data?.capabilities || null;
        const prevTier = (capabilitiesRef.current?.tier || '').toString();
        const prevCycle = (capabilitiesRef.current?.billingCycle || '').toString();
        if (!cancelled) setCapabilities(caps);

        try {
          if (caps) {
            localStorage.setItem(CAPS_CACHE_KEY, JSON.stringify(caps));
            localStorage.setItem(CAPS_CACHE_TS_KEY, String(Date.now()));
          } else {
            localStorage.removeItem(CAPS_CACHE_KEY);
            localStorage.removeItem(CAPS_CACHE_TS_KEY);
          }
        } catch (e) {
          void e;
        }

        try {
          const nextTier = (caps?.tier || '').toString();
          const nextCycle = (caps?.billingCycle || '').toString();
          if ((prevTier && nextTier && prevTier !== nextTier) || (prevCycle && nextCycle && prevCycle !== nextCycle)) {
            localStorage.removeItem(CAPS_CACHE_KEY);
            localStorage.removeItem(CAPS_CACHE_TS_KEY);
          }
        } catch (e) {
          void e;
        }
      } catch (e) {
        if (!cancelled) setCapabilities(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return { capabilities, loading, hasToken: Boolean(token) };
}
