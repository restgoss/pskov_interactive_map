import { useEffect, useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { useAttractions } from '@/hooks/useAttractions';

// Hard ceiling — if any of the readiness signals fail to flip within this
// window, hide the loader anyway so the user is never stuck on the splash.
const MAX_LOADER_MS = 8000;

export function AppLoader() {
  const isMapStyleReady = useUiStore((s) => s.isMapStyleReady);
  const isDistrictsReady = useUiStore((s) => s.isDistrictsReady);
  // isFetched flips true on success OR error — we never want a network failure
  // to keep the loader on screen indefinitely.
  const { isFetched: isAttractionsFetched } = useAttractions();

  const allReady = isMapStyleReady && isDistrictsReady && isAttractionsFetched;
  const [forceHide, setForceHide] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Safety net — release the loader after MAX_LOADER_MS regardless.
  useEffect(() => {
    const t = window.setTimeout(() => setForceHide(true), MAX_LOADER_MS);
    return () => window.clearTimeout(t);
  }, []);

  const ready = allReady || forceHide;

  // Keep the loader mounted briefly after readiness so the fade-out plays,
  // then unmount entirely so it doesn't intercept clicks.
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setHidden(true), 450);
    return () => window.clearTimeout(t);
  }, [ready]);

  if (hidden) return null;

  return (
    <div className={`app-loader${ready ? ' app-loader--fading' : ''}`} aria-hidden={ready}>
      <div className="app-loader__inner">
        <div className="app-loader__spinner" />
        <div className="app-loader__title">Псковская область</div>
        <div className="app-loader__subtitle">Загружаем карту…</div>
      </div>
    </div>
  );
}
