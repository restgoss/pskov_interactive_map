import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  urls: string[];
  initialIndex?: number;
  onClose: () => void;
}

const SWIPE_THRESHOLD_PX = 50;

export function Lightbox({ urls, initialIndex = 0, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => {
      setIndex((curr) => (curr + delta + urls.length) % urls.length);
    },
    [urls.length],
  );

  // Keyboard: Esc closes, ←/→ navigate.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, go]);

  // Lock body scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (urls.length === 0) return null;
  const hasMany = urls.length > 1;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX) go(dx > 0 ? -1 : 1);
  };

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        // Stop the click from bubbling up to any parent modal/backdrop
        // (e.g. AttractionCard's modal-backdrop) — otherwise dismissing
        // the lightbox would also dismiss whatever's underneath it.
        e.stopPropagation();
        onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        className="icon-btn icon-btn--overlay icon-btn--lg lightbox__close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Закрыть"
      >
        ×
      </button>

      {hasMany && (
        <button
          className="icon-btn icon-btn--overlay icon-btn--xl lightbox__nav lightbox__nav--prev"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          aria-label="Предыдущее фото"
        >
          ‹
        </button>
      )}

      <img
        className="lightbox__image"
        src={urls[index]}
        alt={`Фото ${index + 1} из ${urls.length}`}
        onClick={(e) => e.stopPropagation()}
      />

      {hasMany && (
        <button
          className="icon-btn icon-btn--overlay icon-btn--xl lightbox__nav lightbox__nav--next"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          aria-label="Следующее фото"
        >
          ›
        </button>
      )}

      {hasMany && (
        <div className="lightbox__counter" onClick={(e) => e.stopPropagation()}>
          {index + 1} / {urls.length}
        </div>
      )}
    </div>
  );
}
