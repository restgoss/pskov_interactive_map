import { useEffect, useRef } from 'react';
import maplibregl, { type Map as MlMap } from 'maplibre-gl';
import { useAttractions } from '@/hooks/useAttractions';
import { useDistrictsGeo } from '@/hooks/useDistrictsGeo';
import { useUiStore } from '@/store/uiStore';
import type { Attraction, DistrictId } from '@/types';

// Below this zoom we show distance-based clusters; at or above it, individual
// photo markers. Cluster set is computed once and never re-grouped on zoom —
// guarantees no jumping.
const POINT_MIN_ZOOM = 11;

// Greedy-clustering radius in geographic degrees. Two attractions within this
// distance get pulled into the same cluster. ~0.12° is roughly 13 km of
// latitude in the Pskov region (lng compresses by cos(lat) but it's close
// enough — we don't need geodesic precision for a marker grouping heuristic).
const CLUSTER_RADIUS_DEG = 0.12;

interface Props {
  map: MlMap | null;
  isStyleLoaded: boolean;
}

function clusterTier(count: number): 'sm' | 'md' | 'lg' | 'xl' {
  if (count >= 100) return 'xl';
  if (count >= 25) return 'lg';
  if (count >= 10) return 'md';
  return 'sm';
}

// Wrap the visual marker so MapLibre updates `transform: translate()` on the
// outer element while CSS transitions on the inner element (hover scale)
// don't fight position updates.
function wrapMarker(inner: HTMLElement): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'marker-wrapper';
  wrapper.appendChild(inner);
  return wrapper;
}

function buildClusterEl(count: number): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `marker-cluster marker-cluster--${clusterTier(count)}`;
  const label = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
  el.innerHTML = `
    <svg class="marker-cluster__glyph" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="4" width="13" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <rect x="3" y="7" width="13" height="13" rx="2.5" fill="currentColor" opacity="0.18"/>
      <rect x="3" y="7" width="13" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
    </svg>
    <span class="marker-cluster__badge">${label}</span>
  `;
  return el;
}

function buildPointEl(a: Attraction & { lng: number; lat: number }): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'marker-point';
  if (a.image_url) {
    const img = document.createElement('img');
    img.className = 'marker-point__img';
    img.src = a.image_url;
    img.alt = a.title;
    img.loading = 'lazy';
    img.decoding = 'async';
    el.appendChild(img);
  } else {
    el.classList.add('marker-point--placeholder');
    el.textContent = a.title.charAt(0);
  }
  return el;
}

export function AttractionsLayer({ map, isStyleLoaded }: Props) {
  const { data: attractions = [] } = useAttractions();
  const { data: districtsGeo } = useDistrictsGeo();
  const setSelectedAttraction = useUiStore((s) => s.setSelectedAttraction);
  const setSelectedDistrict = useUiStore((s) => s.setSelectedDistrict);
  const pointMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const clusterMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  useEffect(() => {
    if (!map || !isStyleLoaded || !districtsGeo) return;

    const withCoords = attractions.filter(
      (a): a is Attraction & { lng: number; lat: number } => a.lng != null && a.lat != null,
    );
    const { disabledSlugs } = districtsGeo;

    // -----------------------------------------------------------------
    // DISTANCE-BASED GREEDY CLUSTERING
    // -----------------------------------------------------------------
    // For each attraction, drop it into the first existing cluster within
    // CLUSTER_RADIUS_DEG; otherwise create a new cluster. Clusters are
    // computed ONCE per data load and don't change with zoom — that's the
    // whole reason markers don't jump. A cluster of size 1 is fine.
    type ClusterGroup = {
      center: [number, number];
      sumLng: number;
      sumLat: number;
      points: Array<Attraction & { lng: number; lat: number }>;
    };
    const r2 = CLUSTER_RADIUS_DEG * CLUSTER_RADIUS_DEG;
    const clusters: ClusterGroup[] = [];
    for (const a of withCoords) {
      const slug = a.district_id as DistrictId | undefined;
      if (slug && disabledSlugs.has(slug)) continue; // skip disabled regions

      let assigned: ClusterGroup | null = null;
      for (const c of clusters) {
        const dLng = c.center[0] - a.lng;
        const dLat = c.center[1] - a.lat;
        if (dLng * dLng + dLat * dLat < r2) {
          assigned = c;
          break;
        }
      }
      if (assigned) {
        assigned.sumLng += a.lng;
        assigned.sumLat += a.lat;
        assigned.points.push(a);
        const n = assigned.points.length;
        assigned.center = [assigned.sumLng / n, assigned.sumLat / n];
      } else {
        clusters.push({
          center: [a.lng, a.lat],
          sumLng: a.lng,
          sumLat: a.lat,
          points: [a],
        });
      }
    }

    // -----------------------------------------------------------------
    // CLUSTER MARKERS — one per cluster, at its centroid. Position is
    // fully deterministic from the data; never moves with zoom.
    // -----------------------------------------------------------------
    const clusterMarkers = clusterMarkersRef.current;
    clusters.forEach((c, idx) => {
      // Pick the dominant district id of this cluster (mode). If the
      // cluster sits across a border and points are split, this still
      // picks the most frequent — close enough for opening the panel.
      const counts = new Map<string, number>();
      for (const p of c.points) {
        if (!p.district_id) continue;
        counts.set(p.district_id, (counts.get(p.district_id) ?? 0) + 1);
      }
      let dominant: DistrictId | null = null;
      let bestCount = 0;
      for (const [k, n] of counts) {
        if (n > bestCount) {
          dominant = k as DistrictId;
          bestCount = n;
        }
      }

      const inner = buildClusterEl(c.points.length);
      inner.addEventListener('click', () => {
        if (dominant) setSelectedDistrict(dominant);
        map.flyTo({ center: c.center, zoom: POINT_MIN_ZOOM + 0.5 });
      });
      const wrapper = wrapMarker(inner);
      wrapper.style.visibility = 'hidden';
      const marker = new maplibregl.Marker({ element: wrapper, anchor: 'center' })
        .setLngLat(c.center)
        .addTo(map);
      clusterMarkers.set(`cluster-${idx}`, marker);
    });

    // -----------------------------------------------------------------
    // POINT MARKERS — one per attraction (already filtered for disabled).
    // Hidden via CSS until POINT_MIN_ZOOM. MapLibre keeps their screen
    // position perfectly synced with the map every frame.
    // -----------------------------------------------------------------
    const pointMarkers = pointMarkersRef.current;
    for (const c of clusters) {
      for (const a of c.points) {
        const inner = buildPointEl(a);
        inner.addEventListener('click', () => setSelectedAttraction(a.id));
        const wrapper = wrapMarker(inner);
        wrapper.style.visibility = 'hidden';
        const marker = new maplibregl.Marker({ element: wrapper, anchor: 'center' })
          .setLngLat([a.lng, a.lat])
          .addTo(map);
        pointMarkers.set(a.id, marker);
      }
    }

    const updateVisibility = () => {
      const showPoints = map.getZoom() >= POINT_MIN_ZOOM;
      const clusterWant = showPoints ? 'hidden' : 'visible';
      const pointWant = showPoints ? 'visible' : 'hidden';

      for (const m of clusterMarkers.values()) {
        const el = m.getElement();
        if (el.style.visibility !== clusterWant) el.style.visibility = clusterWant;
      }
      for (const m of pointMarkers.values()) {
        const el = m.getElement();
        if (el.style.visibility !== pointWant) el.style.visibility = pointWant;
      }
    };

    updateVisibility();
    map.on('zoom', updateVisibility);

    // Health check — after a setStyle (theme/basemap swap), MapLibre keeps
    // markers attached because they live in the canvas-container DOM, not
    // the GL style. But to be defensive: re-attach any marker whose element
    // got disconnected from the document for any reason. Cheap, idempotent.
    const ensureMarkers = () => {
      for (const m of clusterMarkers.values()) {
        if (!m.getElement().isConnected) m.addTo(map);
      }
      for (const m of pointMarkers.values()) {
        if (!m.getElement().isConnected) m.addTo(map);
      }
    };
    map.on('styledata', ensureMarkers);

    return () => {
      map.off('zoom', updateVisibility);
      map.off('styledata', ensureMarkers);
      for (const m of pointMarkers.values()) m.remove();
      pointMarkers.clear();
      for (const m of clusterMarkers.values()) m.remove();
      clusterMarkers.clear();
    };
  }, [map, isStyleLoaded, attractions, districtsGeo, setSelectedAttraction, setSelectedDistrict]);

  return null;
}
