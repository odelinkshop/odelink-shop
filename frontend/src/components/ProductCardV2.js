export default function ProductCardV2({
  product,
  href = '',
  onNavigate,
  aspect = '4/5'
}) {
  const p = product && typeof product === 'object' ? product : {};
  const title = (p.name || '').toString();
  const price = (p.price || '').toString();
  const image = (p.image || '').toString();

  return (
    <a
      href={href || '#'}
      onClick={(e) => {
        try {
          if (!href) return;
          if (e.defaultPrevented) return;
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          if (typeof onNavigate === 'function') onNavigate(href);
        } catch (err) {
          void err;
        }
      }}
      className="group rounded-[28px] border border-black/10 bg-white overflow-hidden shadow-[0_10px_26px_rgba(17,24,39,0.06)] hover:shadow-[0_18px_50px_rgba(17,24,39,0.12)] hover:-translate-y-0.5 transition-all"
    >
      <div className={`aspect-[${aspect}] bg-[#f6f3f7] overflow-hidden`}>
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="p-4 sm:p-5">
        <div className="text-[13px] sm:text-sm font-semibold tracking-tight text-gray-900 leading-snug line-clamp-2">{title}</div>
        {price ? (
          <div className="mt-1 text-sm sm:text-base font-semibold text-gray-900 truncate">{price}</div>
        ) : (
          <div className="mt-1 text-sm text-gray-500 truncate">&nbsp;</div>
        )}
        <div className="mt-3 text-xs font-black tracking-[0.18em] uppercase text-gray-900/80 group-hover:text-gray-900">
          İncele
        </div>
      </div>
    </a>
  );
}
