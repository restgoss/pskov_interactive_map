import { useEffect } from 'react';
import type { Map as MlMap } from 'maplibre-gl';
import { useUiStore, type LayerToggles } from '@/store/uiStore';

/**
 * Layer-id → toggle key matchers. Order matters: we test matchers top to
 * bottom; the first hit wins. Buildings is tested before labels so 3D
 * building layers don't fall through to "labels"; labels is tested before
 * roads so `road_label` is treated as a label, not a road.
 *
 * Patterns are tuned for OpenFreeMap Liberty (OpenMapTiles schema).
 */
const LAYER_MATCHERS: Array<[keyof LayerToggles, RegExp]> = [
  ['buildings', /(^|[-_])building/i],
  ['labels',    /(label|name|^place_|^poi_|^country_|^state_|^continent_|text)/i],
  ['roads',     /^(road|highway|tunnel|bridge|aeroway|transportation|ferry|path|track|pier)/i],
  ['water',     /^(water|waterway|river|ocean|sea|lake)/i],
  ['landscape', /^(landuse|landcover|park|forest|wood|farmland|grass|hillshade|contour)/i],
];

/**
 * Applies user toggles to the loaded base style. Re-runs whenever the
 * style epoch bumps (style swap completed) so toggles survive a basemap
 * change. Layers added by the app (id prefixed `pskov-`) are never touched.
 */
export function useLayerVisibility(map: MlMap | null, isStyleLoaded: boolean, styleEpoch: number) {
  const layers = useUiStore((s) => s.layers);

  useEffect(() => {
    if (!map || !isStyleLoaded) return;
    const style = map.getStyle();
    if (!style?.layers) return;

    for (const layer of style.layers) {
      if (layer.id.startsWith('pskov-')) continue;
      // Background should always stay visible
      if (layer.type === 'background') continue;

      let visible = true;
      for (const [key, regex] of LAYER_MATCHERS) {
        if (regex.test(layer.id)) {
          visible = layers[key];
          break;
        }
      }
      try {
        map.setLayoutProperty(layer.id, 'visibility', visible ? 'visible' : 'none');
      } catch {
        // Some layers don't accept layout property — skip silently.
      }
    }
  }, [map, isStyleLoaded, styleEpoch, layers]);
}
