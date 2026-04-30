import { useUiStore } from '@/store/uiStore';

/**
 * Mobile-only floating button that opens the district panel (which lists
 * attractions). On desktop it's hidden via CSS — desktop users open districts
 * by clicking polygons. This button toggles: tap to open the default
 * district (Pskov city) when nothing is selected, tap again to close.
 */
export function AttractionsButton() {
  const selected = useUiStore((s) => s.selectedDistrict);
  const setSelected = useUiStore((s) => s.setSelectedDistrict);

  const onClick = () => {
    if (selected) {
      setSelected(null);
    } else {
      // Pskov city has the densest attractions cluster — sensible default
      // when the user opens the list without picking a district first.
      setSelected('pskov');
    }
  };

  return (
    <button
      type="button"
      className="icon-btn icon-btn--panel icon-btn--lg attractions-btn"
      onClick={onClick}
      aria-label={selected ? 'Скрыть список достопримечательностей' : 'Список достопримечательностей'}
      title="Достопримечательности"
    >
      {/* Greek-temple landmark glyph — reads as a monument/cultural site. */}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V11h14v10" />
        <path d="M5 11l7-6 7 6" />
        <path d="M9 21v-7M15 21v-7" />
      </svg>
    </button>
  );
}
