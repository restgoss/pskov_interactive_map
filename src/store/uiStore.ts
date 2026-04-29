import { create } from 'zustand';
import type { DistrictId } from '@/types';

export type MapStyleId = 'osm' | 'clean';
export type Theme = 'dark' | 'light';

export interface LayerToggles {
  roads: boolean;
  water: boolean;
  landscape: boolean;
  labels: boolean;
  buildings: boolean;
}

const DEFAULT_LAYERS: LayerToggles = {
  roads: true,
  water: true,
  landscape: true,
  labels: true,
  buildings: true,
};

const THEME_STORAGE_KEY = 'pskov-theme';

function loadInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return 'dark';
}

interface UiState {
  selectedDistrict: DistrictId | null;
  selectAttraction: string | null;
  mapStyle: MapStyleId;
  theme: Theme;
  layers: LayerToggles;

  // Readiness signals — App overlays a loader until all are true.
  isMapStyleReady: boolean;
  isDistrictsReady: boolean;

  setSelectedDistrict: (id: DistrictId | null) => void;
  setSelectedAttraction: (id: string | null) => void;
  setMapStyle: (style: MapStyleId) => void;
  setTheme: (theme: Theme) => void;
  toggleLayer: (key: keyof LayerToggles) => void;
  setMapStyleReady: (v: boolean) => void;
  setDistrictsReady: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedDistrict: null,
  selectAttraction: null,
  mapStyle: 'osm',
  theme: loadInitialTheme(),
  layers: { ...DEFAULT_LAYERS },
  isMapStyleReady: false,
  isDistrictsReady: false,

  setSelectedDistrict: (id) => set({ selectedDistrict: id }),
  setSelectedAttraction: (id) => set({ selectAttraction: id }),
  setMapStyle: (style) => set({ mapStyle: style }),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    set({ theme });
  },
  toggleLayer: (key) => set((s) => ({ layers: { ...s.layers, [key]: !s.layers[key] } })),
  setMapStyleReady: (v) => set({ isMapStyleReady: v }),
  setDistrictsReady: (v) => set({ isDistrictsReady: v }),
}));
