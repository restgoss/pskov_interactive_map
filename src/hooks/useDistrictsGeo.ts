import { useQuery } from '@tanstack/react-query';
import { DISTRICT_BY_NAME } from '@/config/districts';
import { asset } from '@/lib/assets';
import type { DistrictId } from '@/types';

export interface DistrictFeatureProperties {
  district: string;
  slug: DistrictId | null;
  isDisabled: boolean;
  centroid: [number, number];
}

export interface DistrictsGeoData {
  geojson: GeoJSON.FeatureCollection;
  centroidBySlug: Map<DistrictId, [number, number]>;
  disabledSlugs: Set<DistrictId>;
}

/**
 * Geometric centre of a polygon's bounding box. Cheap, deterministic, and
 * always produces a sensible "middle" point for placing a district-level
 * cluster marker — true centroid would require turf and isn't worth it.
 */
function bboxCenter(geom: GeoJSON.Geometry): [number, number] {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  const visit = (coords: unknown) => {
    if (Array.isArray(coords) && typeof coords[0] === 'number') {
      const lng = coords[0] as number;
      const lat = coords[1] as number;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    } else if (Array.isArray(coords)) {
      for (const c of coords) visit(c);
    }
  };
  visit((geom as GeoJSON.Polygon | GeoJSON.MultiPolygon).coordinates);
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}

async function fetchDistrictsGeo(): Promise<DistrictsGeoData> {
  const res = await fetch(asset('geo/pskov-districts.geojson'));
  if (!res.ok) throw new Error(`Failed to load districts geojson: ${res.status}`);
  const raw = (await res.json()) as GeoJSON.FeatureCollection;

  const centroidBySlug = new Map<DistrictId, [number, number]>();
  const disabledSlugs = new Set<DistrictId>();

  const features = raw.features.map((f, idx) => {
    const props = (f.properties ?? {}) as { district?: string; isDisabled?: boolean };
    const name = props.district ?? '';
    const slug = (DISTRICT_BY_NAME[name] ?? null) as DistrictId | null;
    const isDisabled = props.isDisabled ?? false;
    const centroid = bboxCenter(f.geometry);
    if (slug) {
      centroidBySlug.set(slug, centroid);
      if (isDisabled) disabledSlugs.add(slug);
    }
    return {
      ...f,
      id: idx,
      properties: { ...f.properties, slug, isDisabled, centroid },
    };
  });

  return { geojson: { ...raw, features }, centroidBySlug, disabledSlugs };
}

export function useDistrictsGeo() {
  return useQuery({
    queryKey: ['districts-geo'],
    queryFn: fetchDistrictsGeo,
    staleTime: Infinity,
  });
}
