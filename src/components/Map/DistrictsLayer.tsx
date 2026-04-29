import { useEffect } from 'react';
import type { Map as MlMap, MapGeoJSONFeature } from 'maplibre-gl';
import { useUiStore } from '@/store/uiStore';
import { useDistrictsGeo } from '@/hooks/useDistrictsGeo';
import { DISTRICTS } from '@/config/districts';
import type { DistrictId } from '@/types';

const SOURCE_ID = 'pskov-districts';
const FILL_LAYER = 'pskov-districts-fill';
const OUTLINE_LAYER = 'pskov-districts-outline';
const FILL_DISABLED = 'pskov-districts-fill-disabled';

// Theme-aware palette so borders and fills read well on both dark and
// light basemaps. The light variant uses a deeper gold + higher fill
// opacity, since faint gold gets washed out on light tiles.


interface Props {
  map: MlMap | null;
  isStyleLoaded: boolean;
}

export function DistrictsLayer({ map, isStyleLoaded }: Props) {
  const setSelectedDistrict = useUiStore((s) => s.setSelectedDistrict);
  const selectedDistrict = useUiStore((s) => s.selectedDistrict);
  const setDistrictsReady = useUiStore((s) => s.setDistrictsReady);
  const { data } = useDistrictsGeo();

  useEffect(() => {
    if (!map || !isStyleLoaded || !data) return;
    let hoveredId: number | string | undefined;

    // Idempotent setup. Called any time the style changes; only re-adds
    // what has been wiped — that's our health check after setStyle.
    const ensureSetup = () => {
      // Source — try/catch protects against the rare case where the style
      // is mid-swap. We still flip ready below so the loader never hangs.
      try {
        const existing = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
        if (!existing) {
          map.addSource(SOURCE_ID, { type: 'geojson', data: data.geojson });
        } else {
          existing.setData(data.geojson);
        }
      } catch {
        // Style not ready yet — next styledata event will retry.
        return;
      }

      // Layers — order matters: disabled fill first, then active fill, then outline.
      try {
        if (!map.getLayer(FILL_DISABLED)) {
          map.addLayer({
            id: FILL_DISABLED,
            type: 'fill',
            source: SOURCE_ID,
            filter: ['==', ['get', 'isDisabled'], true],
            paint: { 'fill-color': '#5a5a5a', 'fill-opacity': 0.25 },
          });
        }
        if (!map.getLayer(FILL_LAYER)) {
          map.addLayer({
            id: FILL_LAYER,
            type: 'fill',
            source: SOURCE_ID,
            filter: ['!=', ['get', 'isDisabled'], true],
            paint: {
              'fill-color': '#d4a44a',
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'selected'], false], 0.4,
                ['boolean', ['feature-state', 'hover'], false], 0.25,
                0.08,
              ],
            },
          });
        }
        if (!map.getLayer(OUTLINE_LAYER)) {
          map.addLayer({
            id: OUTLINE_LAYER,
            type: 'line',
            source: SOURCE_ID,
            paint: {
              'line-color': [
                'case',
                ['==', ['get', 'isDisabled'], true], 'rgba(120,120,120,0.4)',
                '#d4a44a',
              ],
              'line-width': [
                'case',
                ['boolean', ['feature-state', 'selected'], false], 3,
                ['boolean', ['feature-state', 'hover'], false], 2,
                1,
              ],
            },
          });
        }

        // Re-apply selected feature-state — wiped by setStyle.
        const sel = useUiStore.getState().selectedDistrict;
        for (const f of data.geojson.features) {
          const id = f.id as number | undefined;
          if (id === undefined) continue;
          const slug = (f.properties as { slug?: DistrictId } | null)?.slug;
          map.setFeatureState({ source: SOURCE_ID, id }, { selected: slug === sel });
        }
      } catch {
        // Style mid-swap — next styledata event will retry. Don't gate
        // readiness on this, source has already been added above.
      }

      // Mark ready as soon as the source is in place; layers can finish
      // attaching on subsequent styledata ticks without blocking the loader.
      setDistrictsReady(true);
    };

    const onMouseMove = (e: maplibregl.MapLayerMouseEvent) => {
      if (!e.features?.length) return;
      map.getCanvas().style.cursor = 'pointer';
      const f = e.features[0] as MapGeoJSONFeature;
      if (hoveredId !== undefined && hoveredId !== f.id) {
        map.setFeatureState({ source: SOURCE_ID, id: hoveredId }, { hover: false });
      }
      hoveredId = f.id as number;
      map.setFeatureState({ source: SOURCE_ID, id: hoveredId }, { hover: true });
    };

    const onMouseLeave = () => {
      map.getCanvas().style.cursor = '';
      if (hoveredId !== undefined) {
        map.setFeatureState({ source: SOURCE_ID, id: hoveredId }, { hover: false });
        hoveredId = undefined;
      }
    };

    const onClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0] as MapGeoJSONFeature | undefined;
      if (!f) return;
      const slug = (f.properties as { slug?: DistrictId } | null)?.slug;
      if (!slug || !DISTRICTS[slug]) return;
      setSelectedDistrict(slug);
    };

    map.on('mousemove', FILL_LAYER, onMouseMove);
    map.on('mouseleave', FILL_LAYER, onMouseLeave);
    map.on('click', FILL_LAYER, onClick);

    ensureSetup();
    // styledata fires whenever the style changes (including after setStyle).
    // ensureSetup is idempotent — it'll reattach our source/layers if they
    // got wiped, and will silently no-op if they're still there.
    map.on('styledata', ensureSetup);

    return () => {
      map.off('styledata', ensureSetup);
      map.off('mousemove', FILL_LAYER, onMouseMove);
      map.off('mouseleave', FILL_LAYER, onMouseLeave);
      map.off('click', FILL_LAYER, onClick);
    };
  }, [map, isStyleLoaded, data, setSelectedDistrict, setDistrictsReady]);

  // Reflect selected district as feature-state
  useEffect(() => {
    if (!map || !isStyleLoaded || !data || !map.getSource(SOURCE_ID)) return;
    for (const f of data.geojson.features) {
      const id = f.id as number | undefined;
      if (id === undefined) continue;
      const slug = (f.properties as { slug?: DistrictId } | null)?.slug;
      map.setFeatureState({ source: SOURCE_ID, id }, { selected: slug === selectedDistrict });
    }
  }, [map, isStyleLoaded, data, selectedDistrict]);

  return null;
}
