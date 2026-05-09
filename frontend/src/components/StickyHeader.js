import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X } from 'lucide-react';

export default function StickyHeader({
  basePath = '/',
  title = '',
  subtitle = '',
  logoUrl = '',
  showBack = false,
  backTo = '',
  onBack,
  showSearchButton = true,
  showSearchInput = false,
  searchValue = '',
  searchDebounceMs = 180,
  onSearchValueChange
}) {
  const navigate = useNavigate();

  const [localSearch, setLocalSearch] = useState((searchValue || '').toString());

  useEffect(() => {
    setLocalSearch((searchValue || '').toString());
  }, [searchValue]);

  useEffect(() => {
    if (!showSearchInput) return;
    if (typeof onSearchValueChange !== 'function') return;
    const ms = Number.isFinite(Number(searchDebounceMs)) ? Number(searchDebounceMs) : 0;
    if (ms <= 0) {
      onSearchValueChange(localSearch);
      return;
    }
    const id = window.setTimeout(() => {
      onSearchValueChange(localSearch);
    }, ms);
    return () => window.clearTimeout(id);
  }, [localSearch, onSearchValueChange, searchDebounceMs, showSearchInput]);

  const normalizedBasePath = useMemo(() => {
    const s = (basePath || '/').toString().trim();
    if (!s) return '/';
    if (s === '/') return '/';
    return s.startsWith('/') ? s.replace(/\/+$/, '') : `/${s.replace(/\/+$/, '')}`;
  }, [basePath]);

  const go = (href) => {
    const h = (href || '').toString();
    if (!h) return;
    try {
      navigate(h);
    } catch (e) {
      void e;
      window.location.href = h;
    }
  };

  const searchHref = `${normalizedBasePath === '/' ? '' : normalizedBasePath}/search`;

  const normalizedLogoUrl = useMemo(() => {
    const s = (logoUrl || '').toString().trim();
    return s;
  }, [logoUrl]);

  return (
    <div className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-black/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              type="button"
              className="h-11 w-11 rounded-2xl border border-black/10 bg-white/70 backdrop-blur flex items-center justify-center shadow-sm"
              aria-label="Geri"
              onClick={() => {
                if (typeof onBack === 'function') {
                  onBack();
                  return;
                }
                go(backTo || normalizedBasePath);
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : null}

          <div className="min-w-0 flex-1 flex items-center gap-3">
            {normalizedLogoUrl ? (
              <img
                src={normalizedLogoUrl}
                alt={title || 'Logo'}
                className="h-9 w-9 rounded-xl border border-black/10 bg-white object-cover shrink-0"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  try {
                    e.currentTarget.style.display = 'none';
                  } catch (err) {
                    void err;
                  }
                }}
              />
            ) : null}
            {subtitle ? <div className="text-xs text-gray-500 truncate">{subtitle}</div> : null}
            <div className="text-base font-extrabold tracking-tight text-gray-900 truncate">{title}</div>
          </div>

          {showSearchButton && !showSearchInput ? (
            <button
              type="button"
              className="h-11 w-11 rounded-2xl border border-black/10 bg-white/70 backdrop-blur flex items-center justify-center shadow-sm"
              aria-label="Ara"
              onClick={() => go(searchHref)}
            >
              <Search className="w-5 h-5" />
            </button>
          ) : null}
        </div>

        {showSearchInput ? (
          <div className="mt-3">
            <div className="relative">
              <input
                value={localSearch}
                onChange={(e) => {
                  const v = (e.target.value || '').toString();
                  setLocalSearch(v);
                }}
                placeholder="Ürün adı veya açıklama..."
                className="w-full min-h-12 rounded-2xl border border-black/10 bg-white/70 backdrop-blur pl-4 pr-12 text-gray-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-pink-500/10"
              />
              {localSearch ? (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl border border-black/10 bg-white/70 backdrop-blur flex items-center justify-center text-gray-700 shadow-sm"
                  aria-label="Temizle"
                  onClick={() => {
                    setLocalSearch('');
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
