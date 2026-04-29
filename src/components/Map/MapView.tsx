import { useMapInstance } from '@/hooks/useMapInstance';
import { useLayerVisibility } from '@/hooks/useLayerVisibility';
import { DistrictsLayer } from './DistrictsLayer';
import { AttractionsLayer } from './AttractionsLayer';

export function MapView() {
  const { containerRef, map, isStyleLoaded, styleEpoch } = useMapInstance();
  // Re-applies layer toggles whenever the basemap finishes (re)loading.
  useLayerVisibility(map, isStyleLoaded, styleEpoch);

  return (
    <div className="map">
      <div ref={containerRef} className="map__canvas" />
      {/* Layer components are idempotent and self-heal on every styledata
          event — no need to remount them on style changes. */}
      <DistrictsLayer map={map} isStyleLoaded={isStyleLoaded} />
      <AttractionsLayer map={map} isStyleLoaded={isStyleLoaded} />
    </div>
  );
}
