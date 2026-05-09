import React, { useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGalleryModal({
  open,
  images,
  index,
  title = '',
  onClose,
  onIndexChange
}) {
  const safeImages = useMemo(() => (Array.isArray(images) ? images.map((x) => (x || '').toString().trim()).filter(Boolean) : []), [images]);
  const safeIndex = useMemo(() => {
    const n = safeImages.length;
    const i = typeof index === 'number' ? index : 0;
    if (!n) return 0;
    return ((i % n) + n) % n;
  }, [index, safeImages.length]);

  const [touchStartX, setTouchStartX] = useState(0);

  const close = () => {
    if (typeof onClose === 'function') onClose();
  };

  const goTo = (i) => {
    if (typeof onIndexChange === 'function') onIndexChange(i);
  };

  const prev = () => {
    if (safeImages.length <= 1) return;
    goTo(safeIndex - 1);
  };

  const next = () => {
    if (safeImages.length <= 1) return;
    goTo(safeIndex + 1);
  };

  useEffect(() => {
    if (!open) return;
    try {
      const onKeyDown = (e) => {
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
      };
      window.addEventListener('keydown', onKeyDown);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = prevOverflow;
      };
    } catch (e) {
      void e;
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, safeIndex, safeImages.length]);

  if (!open) return null;

  const current = safeImages[safeIndex] || '';

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
        <div className="relative w-full max-w-5xl">
          <button
            type="button"
            className="absolute -top-3 -right-3 sm:top-2 sm:right-2 w-11 h-11 rounded-full bg-white text-gray-900 shadow-lg border border-gray-200 flex items-center justify-center"
            aria-label="Kapat"
            onClick={close}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="rounded-3xl overflow-hidden bg-black">
            <div className="relative">
              {safeImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 text-gray-900 shadow-lg border border-gray-200 items-center justify-center"
                    aria-label="Önceki"
                    onClick={prev}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 text-gray-900 shadow-lg border border-gray-200 items-center justify-center"
                    aria-label="Sonraki"
                    onClick={next}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              ) : null}

              <img
                src={current}
                alt={title}
                className="w-full max-h-[82vh] object-contain"
                decoding="async"
                onTouchStart={(e) => {
                  try {
                    const x = e?.touches?.[0]?.clientX;
                    if (typeof x === 'number') setTouchStartX(x);
                  } catch (err) {
                    void err;
                  }
                }}
                onTouchEnd={(e) => {
                  try {
                    if (safeImages.length <= 1) return;
                    const x = e?.changedTouches?.[0]?.clientX;
                    if (typeof x !== 'number') return;
                    const dx = x - touchStartX;
                    if (Math.abs(dx) < 40) return;
                    if (dx > 0) prev();
                    else next();
                  } catch (err) {
                    void err;
                  }
                }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-xs text-white/80 truncate">{title}</div>
            {safeImages.length > 1 ? (
              <div className="text-xs text-white/80 tabular-nums">{safeIndex + 1}/{safeImages.length}</div>
            ) : null}
          </div>

          {safeImages.length > 1 ? (
            <div className="mt-2 flex items-center justify-center gap-1.5">
              {safeImages.slice(0, 12).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`h-1.5 w-1.5 rounded-full ${idx === safeIndex ? 'bg-white' : 'bg-white/40'}`}
                  aria-label="Görsel"
                  onClick={() => goTo(idx)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
