export default function PredictiveSearch({
  products,
  query,
  basePath = '/',
  onNavigate,
  maxItems = 6,
  popularQueries = ['Ruj', 'Parfüm', 'Set', 'Yeni', 'İndirim'],
  showEmptyHint = false
}) {
  const q = (query || '').toString().trim().toLowerCase();

  const matches = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    if (!q) return [];
    const scored = [];
    for (const p of list) {
      if (!p) continue;
      const name = (p.name || '').toString();
      const desc = (p.description || '').toString();
      const hay = `${name} ${desc}`.toLowerCase();
      const idx = hay.indexOf(q);
      if (idx === -1) continue;
      const score = idx; // earlier match = better
      scored.push({ p, score });
    }
    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, Math.max(1, Number(maxItems) || 6)).map((x) => x.p);
  }, [maxItems, products, q]);

  const go = (href) => {
    const h = (href || '').toString();
    if (!h) return;
    if (typeof onNavigate === 'function') onNavigate(h);
    else window.location.href = h;
  };

  const normalizedBase = (basePath || '/').toString().replace(/\/+$/, '') || '/';
  const searchHref = `${normalizedBase}/search?q=${encodeURIComponent((query || '').toString())}`.replace('//search', '/search');

  if (!q) {
    const chips = Array.isArray(popularQueries)
      ? popularQueries.map((x) => (x || '').toString().trim()).filter(Boolean).slice(0, 8)
      : [];
    if (!chips.length) return null;

    return (
      <div className="mt-4 max-w-2xl">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-extrabold text-gray-900">Popüler Aramalar</div>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                className="px-3 py-2 rounded-2xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 hover:bg-gray-100"
                onClick={() => {
                  const href = `${normalizedBase}/search?q=${encodeURIComponent(c)}`.replace('//search', '/search');
                  go(href);
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!matches.length) {
    if (!showEmptyHint) return null;
    return (
      <div className="mt-4 max-w-2xl">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-4">
            <div className="text-sm font-extrabold text-gray-900">Öneri bulunamadı</div>
            <div className="mt-1 text-xs text-gray-600">Daha genel bir arama deneyebilirsin.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 max-w-2xl">
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
          <div className="text-sm font-extrabold text-gray-900">Önerilen</div>
          <div className="text-xs text-gray-500 truncate">"{query}"</div>
        </div>
        <div className="divide-y divide-gray-100">
          {matches.map((p) => {
            const href = `${normalizedBase}/p/${encodeURIComponent(String(p.id))}`.replace('//p/', '/p/');
            return (
              <button
                key={p.id}
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                onClick={() => go(href)}
              >
                <div className="h-12 w-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  <img
                    src={(p.image || '').toString()}
                    alt={(p.name || '').toString()}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-gray-900 truncate">{(p.name || '').toString() || 'Ürün'}</div>
                  <div className="text-xs text-gray-500 truncate">{(p.price || '').toString()}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <button
            type="button"
            className="w-full min-h-11 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 text-xs font-extrabold hover:bg-gray-100"
            onClick={() => go(searchHref)}
          >
            Tüm sonuçları gör
          </button>
        </div>
      </div>
    </div>
  );
}
