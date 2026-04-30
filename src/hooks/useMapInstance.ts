import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MlMap } from 'maplibre-gl';
import { getMapStyle } from '@/config/mapStyles';
import { PSKOV_CENTER } from '@/config/districts';
import { useUiStore } from '@/store/uiStore';

interface UseMapInstanceResult {
  containerRef: React.RefObject<HTMLDivElement>;
  map: MlMap | null;
  isStyleLoaded: boolean;
  /**
   * Bumped on every successful style (re)load. Layer-visibility hooks use it
   * to know when to re-apply their toggles after setStyle wipes them.
   */
  styleEpoch: number;
}

export function useMapInstance(): UseMapInstanceResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const [map, setMap] = useState<MlMap | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [styleEpoch, setStyleEpoch] = useState(0);
  const mapStyle = useUiStore((s) => s.mapStyle);
  const theme = useUiStore((s) => s.theme);
  const setMapStyleReady = useUiStore((s) => s.setMapStyleReady);

  // Create the map once. Style swaps happen in the effect below.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const { mapStyle: initialStyle, theme: initialTheme } = useUiStore.getState();
    const instance = new maplibregl.Map({
      container: containerRef.current,
      style: getMapStyle(initialStyle, initialTheme),
      center: PSKOV_CENTER,
      zoom: 7,
      minZoom: 5,
      maxZoom: 18,
      // Lock the viewport to Pskov oblast plus enough buffer to see
      // adjacent regions/countries: Estonia + Latvia (W), Belarus (S),
      // Leningrad + Novgorod oblasts (N+E). MapLibre will hard-stop pan
      // and zoom once the camera tries to leave this rectangle.
      // Format: [[west, south], [east, north]].
      // Symmetric east/west around Pskov (lng 28.34) — half-width 13.66°.
      maxBounds: [[14.68, 48.0], [42.0, 64.0]],
      // No attribution chip — the OpenFreeMap / OpenStreetMap notice
      // crowds the corner of a UI that's already busy with our own panels.
      attributionControl: false,
    });

    instance.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'bottom-right');
    instance.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    const markReady = () => {
      setIsStyleLoaded(true);
      setMapStyleReady(true);
      setStyleEpoch((n) => n + 1);
    };

    // 'load' is the canonical "everything is ready" event — fires once
    // after the initial style is fully loaded, sources are fetched, etc.
    instance.on('load', markReady);
    // Belt-and-suspenders: if 'load' somehow already fired before listener
    // was attached (extremely unlikely but cheap to guard).
    if (instance.loaded()) markReady();

    mapRef.current = instance;
    setMap(instance);

    return () => {
      instance.remove();
      mapRef.current = null;
      setMap(null);
      setIsStyleLoaded(false);
    };
  }, [setMapStyleReady]);

  // Swap style when the user picks a different basemap or theme.
  // Skip the very first run — the map was created with the current style
  // already; we'd otherwise race the initial `load` event.
  const isFirstStyleRun = useRef(true);
  useEffect(() => {
    if (!mapRef.current) return;
    if (isFirstStyleRun.current) {
      isFirstStyleRun.current = false;
      return;
    }
    const m = mapRef.current;

    let done = false;
    const handleLoad = () => {
      if (done) return;
      done = true;
      setIsStyleLoaded(true);
      setMapStyleReady(true);
      setStyleEpoch((n) => n + 1);
    };

    // diff: false — clean rebuild every time. Our DistrictsLayer / AttractionsLayer
    // self-heal via styledata listeners regardless.
    m.setStyle(getMapStyle(mapStyle, theme), { diff: false });

    // For minimal styles (clean — no sources), setStyle parses synchronously
    // and `style.load` may fire before we attach the listener.
    if (m.isStyleLoaded()) {
      handleLoad();
    } else {
      m.once('style.load', handleLoad);
    }

    // Safety net: if style.load somehow never fires (network issue, etc.),
    // mark the style ready after a short delay so the loader doesn't hang.
    const safety = window.setTimeout(handleLoad, 5000);

    return () => {
      window.clearTimeout(safety);
      m.off('style.load', handleLoad);
    };
  }, [mapStyle, theme, setMapStyleReady]);

  return { containerRef, map, isStyleLoaded, styleEpoch };
}
