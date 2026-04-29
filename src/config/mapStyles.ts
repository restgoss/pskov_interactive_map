import type { StyleSpecification } from 'maplibre-gl';
import type { MapStyleId, Theme } from '@/store/uiStore';

// OpenFreeMap Liberty — free, no API key, vector tiles. Layers (roads,
// water, landscape, labels, buildings) can be toggled individually because
// each is a separate GL layer in the style.
const OSM_VECTOR_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

function buildCleanStyle(theme: Theme): StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': theme === 'dark' ? '#0f1419' : '#f5f6f8',
        },
      },
    ],
  };
}

export function getMapStyle(id: MapStyleId, theme: Theme): StyleSpecification | string {
  switch (id) {
    case 'osm':
      return OSM_VECTOR_STYLE_URL;
    case 'clean':
      return buildCleanStyle(theme);
  }
}
