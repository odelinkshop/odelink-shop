import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import PremiumFeatures from './components/PremiumFeatures';
import PremiumPricing from './components/PremiumPricing';
import AdminPasswordGate from './components/AdminPasswordGate';
import Footer from './components/Footer';
import CustomDomainSitePage from './components/CustomDomainSitePage';
import AuthPage from './components/AuthPage';
import UserPanel from './components/UserPanel';
import SupportPage from './components/SupportPage';
import PublicSitePage from './components/PublicSitePage';
import PoliciesEditor from './components/PoliciesEditor';
import AboutPage from './components/AboutPage';
import ServicesPage from './components/ServicesPage';
import ReviewsPage from './components/ReviewsPage';
import BlogPage from './components/BlogPage';
import FaqPage from './components/FaqPage';
import GuidePage from './components/GuidePage';
import PaymentPage from './components/PaymentPage';
import ShoppingPage from './components/ShoppingPage';
import WidgetPage from './components/WidgetPage';
import PublicPoliciesPage from './components/PublicPoliciesPage';
import SiteAnalyticsPage from './components/SiteAnalyticsPage';
import SiteBuilderWizard from './components/SiteBuilderWizard';
import useAuthSession from './hooks/useAuthSession';
import useCapabilities from './hooks/useCapabilities';
import { clearAuthSession } from './utils/authStorage';
import './index.css';

try {
  if (typeof window !== 'undefined') {
    const host = (window.location.hostname || '').toLowerCase();
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    if (!isLocal && host === 'odelink.shop') {
      const next = `https://www.odelink.shop${window.location.pathname || ''}${window.location.search || ''}${window.location.hash || ''}`;
      window.location.replace(next);
    }
  }
} catch (e) {
  void e;
}

function lazyWithPreload(factory) {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
}

function safeIdleCallback(cb) {
  try {
    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      return window.requestIdleCallback(cb, { timeout: 1500 });
    }
  } catch (e) {
    void e;
  }
  return setTimeout(cb, 300);
}

const PlansPage = lazyWithPreload(() => import('./components/PlansPage'));
const SiteSettingsPage = lazyWithPreload(() => import('./components/SiteSettingsPage'));
const SimpleAdminPanel = lazyWithPreload(() => import('./components/SimpleAdminPanel'));
const TermsPage = lazyWithPreload(() => import('./components/TermsPage'));
const PrivacyPage = lazyWithPreload(() => import('./components/PrivacyPage'));
const KvkkPage = lazyWithPreload(() => import('./components/KvkkPage'));
const CookiesPage = lazyWithPreload(() => import('./components/CookiesPage'));
const ContactPage = lazyWithPreload(() => import('./components/ContactPage'));
const VipSupportPage = lazyWithPreload(() => import('./components/VipSupportPage'));
const LinksPage = lazyWithPreload(() => import('./components/LinksPage'));
const AdvertisePage = lazyWithPreload(() => import('./components/AdvertisePage'));

try {
  const p = window.location?.pathname || '';
  if (p.startsWith('/sites/')) {
    SiteSettingsPage.preload();
  }
  if (p.startsWith('/admin')) SimpleAdminPanel.preload();
  if (p.startsWith('/terms')) TermsPage.preload();
  if (p.startsWith('/privacy')) PrivacyPage.preload();
  if (p.startsWith('/kvkk')) KvkkPage.preload();
  if (p.startsWith('/cookies')) CookiesPage.preload();
  if (p.startsWith('/contact')) ContactPage.preload();
  if (p.startsWith('/vip-support')) VipSupportPage.preload();
  if (p.startsWith('/links')) LinksPage.preload();
  if (p.startsWith('/advertise')) AdvertisePage.preload();
} catch (e) {
  void e;
}

const API_BASE =
  process.env.REACT_APP_API_URL ||
  ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5000'
    : '');

function VisitorHeartbeat() {
  const location = useLocation();

  useEffect(() => {
    let visitorId = null;
    try {
      visitorId = localStorage.getItem('odelink_visitor_id');
      if (!visitorId) {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
          visitorId = crypto.randomUUID();
        } else {
          visitorId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        }
        localStorage.setItem('odelink_visitor_id', visitorId);
      }
    } catch (e) {
      void e;
      return;
    }

    let cancelled = false;

    const storefrontSubdomain = (() => {
      try {
        const m = (location.pathname || '').match(/^\/s\/([^\/]+)/i);
        return m && m[1] ? decodeURIComponent(m[1]).toString().trim().toLowerCase() : '';
      } catch (e) {
        void e;
        return '';
      }
    })();

    const scopedVisitorId = storefrontSubdomain ? `${storefrontSubdomain}:${visitorId}` : visitorId;

    const sendSiteView = async () => {
      if (cancelled) return;
      if (!storefrontSubdomain) return;
      const payload = JSON.stringify({ subdomain: storefrontSubdomain, visitorId: scopedVisitorId, path: location.pathname });
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(`${API_BASE}/api/metrics/site-view`, blob);
          return;
        }
      } catch (e) {
        void e;
      }
      try {
        await fetch(`${API_BASE}/api/metrics/site-view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        });
      } catch (e) {
        void e;
      }
    };
    const send = async () => {
      if (cancelled) return;
      const payload = JSON.stringify({
        visitorId: scopedVisitorId,
        path: location.pathname
      });

      try {
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(`${API_BASE}/api/metrics/heartbeat`, blob);
          return;
        }
      } catch (e) {
        void e;
      }

      try {
        await fetch(`${API_BASE}/api/metrics/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        });
      } catch (e) {
        void e;
      }
    };

    const scheduleSend = () => {
      if (cancelled) return;
      try {
        if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(() => {
            void send();
          }, { timeout: 1500 });
          return;
        }
      } catch (e) {
        void e;
      }
      setTimeout(() => {
        void send();
      }, 0);
    };

    scheduleSend();
    void sendSiteView();
    const id = setInterval(scheduleSend, 15 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [location.pathname]);

  return null;
}

function GlobalPaywallRedirect() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.fetch !== 'function') return () => {};

    const originalFetch = window.fetch.bind(window);
    let redirected = false;

    const shouldHandlePaywall = (path) => {
      const p = (path || '').toString();
      if (!p) return false;
      if (p.startsWith('/plans')) return false;
      if (p.startsWith('/auth')) return false;
      if (p.startsWith('/panel')) return true;
      if (p.startsWith('/sites/')) return true;
      if (p.startsWith('/site-builder')) return true;
      if (p.startsWith('/auto-theme-builder')) return true;
      return false;
    };

    window.fetch = async (...args) => {
      const res = await originalFetch(...args);
      try {
        if (!redirected && res && res.status === 403 && shouldHandlePaywall(location.pathname)) {
          const contentType = (res.headers && res.headers.get) ? (res.headers.get('content-type') || '') : '';
          if (contentType.includes('application/json')) {
            const cloned = res.clone();
            const data = await cloned.json().catch(() => null);
            const code = (data && typeof data === 'object') ? (data.code || data.errorCode) : null;
            if ((code || '').toString().toUpperCase() === 'PAYWALL') {
              redirected = true;
              try {
                clearAuthSession({ preserveAdminUi: true });
              } catch (e) {
                void e;
              }
              window.location.href = '/plans';
            }
          }
        }
      } catch (e) {
        void e;
      }
      return res;
    };

    return () => {
      try {
        if (window.fetch !== originalFetch) window.fetch = originalFetch;
      } catch (e) {
        void e;
      }
    };
  }, [location.pathname]);

  return null;
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isLoggedIn, ready } = useAuthSession();
  const { capabilities, loading: capsLoading } = useCapabilities();

  if (!ready) {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (capsLoading) {
    return null;
  }

  if (capabilities && !capabilities?.tier && (capabilities?.trialExpired || capabilities?.trial?.expired)) {
    try {
      clearAuthSession({ preserveAdminUi: true });
    } catch (e) {
      void e;
    }
    return <Navigate to="/plans" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function RouteFallback() {
  return null;
}

function WithSuspense({ children }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

function AppLayout() {
  const location = useLocation();
  const p = location.pathname;
  const host = (typeof window !== 'undefined') ? (window.location.hostname || '') : '';
  const isCustomDomain = !isPlatformHost(host);
  const isStorefront = isCustomDomain || p.startsWith('/s/');
  const hideChrome =
    isCustomDomain ||
    p.startsWith('/s/') ||
    p.startsWith('/preview') ||
    p.startsWith('/admin') ||
    p.startsWith('/panel') ||
    p.startsWith('/auth') ||
    p.startsWith('/sites/') ||
    p.startsWith('/site-builder') ||
    p.startsWith('/auto-theme-builder');
  const disableHeartbeat =
    isCustomDomain ||
    p.startsWith('/admin') ||
    p.startsWith('/panel') ||
    p.startsWith('/auth') ||
    p.startsWith('/sites/') ||
    p.startsWith('/site-builder') ||
    p.startsWith('/auto-theme-builder');

  useEffect(() => {
    if (p !== '/') return;
    let cancelled = false;

    const id = safeIdleCallback(() => {
      if (cancelled) return;
    });

    return () => {
      cancelled = true;
      try {
        if (typeof id === 'number') clearTimeout(id);
      } catch (e) {
        void e;
      }
    };
  }, [p]);

  return (
    <div className={`min-h-screen ${isStorefront ? '' : 'gradient-bg'} flex flex-col ${hideChrome ? '' : ''}`}>
      {disableHeartbeat ? null : <VisitorHeartbeat />}
      <GlobalPaywallRedirect />
      {!hideChrome ? <Header /> : null}
      <div className="flex-1">
        <Routes>
          <Route path="/p/:productId" element={<HostAwareProductRoute />} />
          <Route path="/c/:collectionSlug" element={<HostAwareCollectionRoute />} />
          <Route path="/search" element={<HostAwareSearchRoute />} />
          <Route path="/" element={<HostAwareRootRoute />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/panel" element={<ProtectedRoute><UserPanel /></ProtectedRoute>} />
          <Route path="/site-builder" element={<ProtectedRoute><SiteBuilderWizard /></ProtectedRoute>} />
          <Route path="/plans" element={<WithSuspense><PlansPage /></WithSuspense>} />
          <Route path="/plan/*" element={<Navigate to="/plans" replace />} />
          <Route path="/auto-theme-builder" element={<Navigate to="/site-builder" replace />} />
          <Route path="/sites/:id/policies" element={<ProtectedRoute><PoliciesEditor /></ProtectedRoute>} />
          <Route path="/sites/:id/design" element={<Navigate to="/panel" replace />} />
          <Route path="/sites/:id/settings" element={<WithSuspense><ProtectedRoute><SiteSettingsPage /></ProtectedRoute></WithSuspense>} />
          <Route path="/sites/:id/settings/design" element={<WithSuspense><ProtectedRoute><SiteSettingsPage forcedSection="design" /></ProtectedRoute></WithSuspense>} />
          <Route path="/sites/:id/settings/general" element={<WithSuspense><ProtectedRoute><SiteSettingsPage forcedSection="general" /></ProtectedRoute></WithSuspense>} />
          <Route path="/sites/:id/settings/:section" element={<Navigate to="../general" replace />} />
          <Route path="/sites/:id/analytics" element={<WithSuspense><ProtectedRoute><SiteAnalyticsPage /></ProtectedRoute></WithSuspense>} />
          <Route path="/preview" element={<Navigate to="/panel" replace />} />
          {/* /s/ routes are handled by backend proxy - DO NOT add React routes here */}
          <Route path="/admin" element={<WithSuspense><AdminPasswordGate><SimpleAdminPanel /></AdminPasswordGate></WithSuspense>} />
          <Route path="/terms" element={<WithSuspense><TermsPage /></WithSuspense>} />
          <Route path="/privacy" element={<WithSuspense><PrivacyPage /></WithSuspense>} />
          <Route path="/kvkk" element={<WithSuspense><KvkkPage /></WithSuspense>} />
          <Route path="/cookies" element={<WithSuspense><CookiesPage /></WithSuspense>} />
          <Route path="/contact" element={<WithSuspense><ContactPage /></WithSuspense>} />
          <Route path="/advertise" element={<WithSuspense><AdvertisePage /></WithSuspense>} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/vip-support" element={<WithSuspense><VipSupportPage /></WithSuspense>} />
          <Route path="/links" element={<WithSuspense><LinksPage /></WithSuspense>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/shopping" element={<ProtectedRoute><ShoppingPage /></ProtectedRoute>} />
          <Route path="/widget" element={<ProtectedRoute><WidgetPage /></ProtectedRoute>} />
        </Routes>
      </div>
      {!hideChrome ? <Footer /> : null}
    </div>
  );
}

function isPlatformHost(hostname) {
  const h = (hostname || '').toString().trim().toLowerCase();
  if (!h) return true;
  if (h === 'localhost' || h === '127.0.0.1') return true;
  if (h === 'odelink.shop' || h === 'www.odelink.shop') return true;
  return false;
}

function HostAwareRootRoute() {
  const host = (typeof window !== 'undefined') ? (window.location.hostname || '') : '';
  if (!isPlatformHost(host)) {
    return <CustomDomainSitePage />;
  }
  return (
    <main>
      <Hero />
      <PremiumFeatures />
      <PremiumPricing />
    </main>
  );
}

function HostAwareProductRoute() {
  const host = (typeof window !== 'undefined') ? (window.location.hostname || '') : '';
  if (!isPlatformHost(host)) {
    return <CustomDomainSitePage />;
  }
  return <Navigate to="/" replace />;
}

function HostAwareCollectionRoute() {
  const host = (typeof window !== 'undefined') ? (window.location.hostname || '') : '';
  if (!isPlatformHost(host)) {
    return <CustomDomainSitePage />;
  }
  return <Navigate to="/" replace />;
}

function HostAwareSearchRoute() {
  const host = (typeof window !== 'undefined') ? (window.location.hostname || '') : '';
  if (!isPlatformHost(host)) {
    return <CustomDomainSitePage />;
  }
  return <Navigate to="/" replace />;
}

function App() {
  useEffect(() => {
    try {
      localStorage.removeItem('odelink_theme_palette');
    } catch (e) {
      void e;
    }

    const root = document.documentElement;
    const keys = [
      '--brand-1',
      '--brand-2',
      '--brand-3',
      '--success-1',
      '--success-2',
      '--warning-1',
      '--warning-2',
      '--danger-1',
      '--danger-2',
      '--bg-0',
      '--bg-1',
      '--bg-2'
    ];
    keys.forEach((k) => root.style.removeProperty(k));

    const prefetch = () => {
      try {
        if (typeof window !== 'undefined') {
          if (window.__odelink_prefetch_done) return;
          window.__odelink_prefetch_done = true;
        }
      } catch (e) {
        void e;
      }

      try {
        const conn = (typeof navigator !== 'undefined')
          ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection)
          : null;
        if (conn && (conn.saveData || /(^|\s)(slow-)?2g(\s|$)/i.test(conn.effectiveType || ''))) {
          return;
        }
      } catch (e) {
        void e;
      }

      // Keep this list intentionally small to avoid UI jank on weaker machines.
      // Heavier routes (e.g. builder/admin) should load on-demand.
      const list = [
        AuthPage,
        UserPanel,
        SiteSettingsPage
      ];

      let i = 0;
      const step = () => {
        const C = list[i++];
        try {
          if (C && typeof C.preload === 'function') C.preload();
        } catch (e) {
          void e;
        }
        if (i < list.length) {
          try {
            setTimeout(() => safeIdleCallback(step), 250);
          } catch (e) {
            void e;
          }
        }
      };

      safeIdleCallback(step);
    };

    try {
      setTimeout(prefetch, 1200);
    } catch (e) {
      void e;
    }
  }, []);

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
