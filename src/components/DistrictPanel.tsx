import { useMemo } from 'react';
import { useUiStore } from '@/store/uiStore';
import { useAttractions } from '@/hooks/useAttractions';
import { useDistricts } from '@/hooks/useDistricts';
import { useReviewStats } from '@/hooks/useReviewStats';
import { DISTRICTS } from '@/config/districts';
import { asset } from '@/lib/assets';
import { Stars } from './Stars';

export function DistrictPanel() {
  const selected = useUiStore((s) => s.selectedDistrict);
  const setSelected = useUiStore((s) => s.setSelectedDistrict);
  const setSelectedAttraction = useUiStore((s) => s.setSelectedAttraction);
  const { data: attractions = [] } = useAttractions();
  const { data: districts = [] } = useDistricts();
  const { data: stats = {} } = useReviewStats();

  const district = districts.find((d) => d.id === selected);
  const localMeta = selected ? DISTRICTS[selected] : null;

  const items = useMemo(
    () => attractions.filter((a) => a.district_id === selected),
    [attractions, selected],
  );

  const isOpen = !!selected;

  return (
    <aside className={`district-panel${isOpen ? ' district-panel--open' : ''}`}>
      <button
        className="icon-btn icon-btn--ghost icon-btn--md district-panel__close"
        onClick={() => setSelected(null)}
        aria-label="Закрыть"
      >
        ×
      </button>

      {selected && (
        <>
          <div className="district-panel__header">
            {localMeta?.coat && (
              <img className="district-panel__coat" src={asset(localMeta.coat)} alt="Герб" />
            )}
            <div className="district-panel__title-block">
              <h2 className="district-panel__title">
                {district?.district ?? localMeta?.name ?? selected}
              </h2>
              <div className="district-panel__count">
                {items.length} {pluralizeAttractions(items.length)}
              </div>
            </div>
          </div>

          <div className="district-panel__body">
            {district?.description && (
              <p className="district-panel__description">{district.description}</p>
            )}

            <div className="district-panel__section-title">Достопримечательности</div>
            <div className="district-panel__list">
              {items.map((a) => {
                const stat = stats[a.id];
                return (
                  <button
                    key={a.id}
                    className="attraction-item"
                    onClick={() => setSelectedAttraction(a.id)}
                  >
                    {a.image_url ? (
                      <img className="attraction-item__image" src={asset(a.image_url)} alt={a.title} loading="lazy" />
                    ) : (
                      <div className="attraction-item__image attraction-item__image--placeholder">
                        {a.title.charAt(0)}
                      </div>
                    )}
                    <div className="attraction-item__body">
                      <div className="attraction-item__title">{a.title}</div>
                      {stat && stat.count > 0 && (
                        <div className="attraction-item__stats">
                          <Stars value={Math.round(stat.avg)} />
                          <span className="attraction-item__rating">{stat.avg.toFixed(1)}</span>
                          <span className="attraction-item__count">
                            · {stat.count} {pluralizeReviews(stat.count)}
                          </span>
                        </div>
                      )}
                      {a.description && (
                        <div className="attraction-item__description">{a.description}</div>
                      )}
                    </div>
                  </button>
                );
              })}
              {items.length === 0 && (
                <div className="reviews-list__empty">Пока нет данных о достопримечательностях.</div>
              )}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

function pluralizeAttractions(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'место';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'места';
  return 'мест';
}

function pluralizeReviews(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'отзыв';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'отзыва';
  return 'отзывов';
}
