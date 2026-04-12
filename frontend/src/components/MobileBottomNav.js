import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, LayoutGrid, ShoppingBag } from 'lucide-react';

export default function MobileBottomNav({ basePath = '/', shopierUrl = '' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const normalizedBasePath = useMemo(() => {
    const s = (basePath || '/').toString().trim();
    if (!s) return '/';
    if (s === '/') return '/';
    return s.startsWith('/') ? s.replace(/\/+$/, '') : `/${s.replace(/\/+$/, '')}`;
  }, [basePath]);

  const active = useMemo(() => {
    const p = (location?.pathname || '').toString();
    const root = normalizedBasePath === '/' ? '/' : normalizedBasePath;
    if (normalizedBasePath !== '/' && p.startsWith(`${root}/search`)) return 'search';
    if (normalizedBasePath === '/' && p.startsWith('/search')) return 'search';
    if (p === root) return 'home';
    if (normalizedBasePath !== '/' && p.startsWith(`${root}/c/`)) return 'collections';
    if (normalizedBasePath === '/' && p.startsWith('/c/')) return 'collections';
    return '';
  }, [location?.pathname, normalizedBasePath]);

  const go = (href) => {
    try {
      navigate(href);
    } catch (e) {
      void e;
      window.location.href = href;
    }
  };

  const goCollections = () => {
    try {
      const base = (normalizedBasePath || '/').toString();
      if (base !== '/') {
        go(`${base}/c/all`);
        return;
      }
      go(`${base}#collections`);
    } catch (e) {
      void e;
      go(`${normalizedBasePath}#collections`);
    }
  };

  const openShopier = () => {
    const href = (shopierUrl || '').toString().trim();
    if (!href) return;
    try {
      window.open(href, '_blank', 'noreferrer');
    } catch (e) {
      void e;
      window.location.href = href;
    }
  };

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="border-t border-gray-200 bg-white/95 backdrop-blur shadow-[0_-8px_22px_rgba(0,0,0,0.08)]">
        <div className="container mx-auto px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+10px)]">
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => go(normalizedBasePath)}
              className={`h-12 rounded-2xl border ${active === 'home' ? 'border-gray-900 bg-gray-900 text-white shadow-sm' : 'border-gray-200 bg-white text-gray-900'} flex items-center justify-center`}
              aria-label="Ana sayfa"
            >
              <Home className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() => go(`${normalizedBasePath === '/' ? '' : normalizedBasePath}/search`)}
              className={`h-12 rounded-2xl border ${active === 'search' ? 'border-gray-900 bg-gray-900 text-white shadow-sm' : 'border-gray-200 bg-white text-gray-900'} flex items-center justify-center`}
              aria-label="Ara"
            >
              <Search className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={goCollections}
              className={`h-12 rounded-2xl border ${active === 'collections' ? 'border-gray-900 bg-gray-900 text-white shadow-sm' : 'border-gray-200 bg-white text-gray-900'} flex items-center justify-center`}
              aria-label="Koleksiyonlar"
            >
              <LayoutGrid className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={openShopier}
              className={`h-12 rounded-2xl border ${shopierUrl ? 'border-gray-200 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 text-gray-400'} flex items-center justify-center`}
              aria-label="Shopier"
              disabled={!shopierUrl}
            >
              <ShoppingBag className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
