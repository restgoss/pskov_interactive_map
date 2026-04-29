import { useEffect, useRef, useState } from 'react';
import { useUiStore, type MapStyleId, type Theme, type LayerToggles } from '@/store/uiStore';

interface StyleOption {
  id: MapStyleId;
  label: string;
  icon: JSX.Element;
}

interface ThemeOption {
  id: Theme;
  label: string;
  icon: JSX.Element;
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'osm',
    label: 'OpenStreetMap',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
        <path d="M9 3v15M15 6v15" />
      </svg>
    ),
  },
  {
    id: 'clean',
    label: 'Без подложки',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2.5" />
        <path d="M7 7l10 10M17 7L7 17" opacity="0.4" />
      </svg>
    ),
  },
];

interface LayerOption {
  key: keyof LayerToggles;
  label: string;
  icon: JSX.Element;
}

const LAYER_OPTIONS: LayerOption[] = [
  {
    key: 'roads',
    label: 'Дороги',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22L8 2M20 22l-4-20M9 8h6M8 14h8" />
      </svg>
    ),
  },
  {
    key: 'water',
    label: 'Вода',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.5s7 8 7 13a7 7 0 11-14 0c0-5 7-13 7-13z" />
      </svg>
    ),
  },
  {
    key: 'landscape',
    label: 'Ландшафт',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 19l5-9 4 6 3-4 6 7H3z" />
        <circle cx="17" cy="6" r="2" />
      </svg>
    ),
  },
  {
    key: 'labels',
    label: 'Надписи',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 7V5h14v2M9 5v14M15 5v14M9 19h6" />
      </svg>
    ),
  },
  {
    key: 'buildings',
    label: 'Здания',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="9" width="8" height="12" />
        <rect x="13" y="3" width="8" height="18" />
        <path d="M6 13h2M6 17h2M16 7h2M16 11h2M16 15h2" />
      </svg>
    ),
  },
];

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dark',
    label: 'Тёмная',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
      </svg>
    ),
  },
  {
    id: 'light',
    label: 'Светлая',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
];

export function MapSettings() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mapStyle = useUiStore((s) => s.mapStyle);
  const setMapStyle = useUiStore((s) => s.setMapStyle);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const layers = useUiStore((s) => s.layers);
  const toggleLayer = useUiStore((s) => s.toggleLayer);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div className="map-settings" ref={containerRef}>
      <button
        className="icon-btn icon-btn--panel icon-btn--lg map-settings__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label="Настройки карты"
        aria-expanded={open}
        title="Настройки"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
        </svg>
      </button>

      {open && (
        <div className="map-settings__panel" role="dialog" aria-label="Настройки карты">
          <Section title="Стиль карты">
            {STYLE_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.id}
                icon={opt.icon}
                label={opt.label}
                active={mapStyle === opt.id}
                onClick={() => setMapStyle(opt.id)}
              />
            ))}
          </Section>

          {/* Layer toggles only make sense for the vector OSM basemap —
              clean has no toggleable layers. */}
          {mapStyle === 'osm' && (
            <Section title="Слои подложки">
              {LAYER_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.key}
                  icon={opt.icon}
                  label={opt.label}
                  active={layers[opt.key]}
                  onClick={() => toggleLayer(opt.key)}
                />
              ))}
            </Section>
          )}

          <Section title="Тема">
            {THEME_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.id}
                icon={opt.icon}
                label={opt.label}
                active={theme === opt.id}
                onClick={() => setTheme(opt.id)}
              />
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="map-settings__group">
      <div className="map-settings__group-title">{title}</div>
      <div className="map-settings__options">{children}</div>
    </div>
  );
}

function OptionButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: JSX.Element;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`map-settings__option${active ? ' map-settings__option--active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="map-settings__option-icon">{icon}</span>
      <span className="map-settings__option-label">{label}</span>
      {active && (
        <svg className="map-settings__option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L20 7" />
        </svg>
      )}
    </button>
  );
}
