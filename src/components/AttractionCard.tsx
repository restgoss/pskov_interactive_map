import { useEffect, useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { useAttractions } from '@/hooks/useAttractions';
import { useReviews } from '@/hooks/useReviews';
import { Stars } from './Stars';
import { ReviewForm } from './ReviewForm';
import { Lightbox } from './Lightbox';

interface LightboxState {
  urls: string[];
  index: number;
}

export function AttractionCard() {
  const selectedId = useUiStore((s) => s.selectAttraction);
  const setSelected = useUiStore((s) => s.setSelectedAttraction);
  const { data: attractions = [] } = useAttractions();
  const { data: reviews = [] } = useReviews(selectedId);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const attraction = attractions.find((a) => a.id === selectedId);

  // Reset transient UI state every time we open a different attraction.
  useEffect(() => {
    setFormOpen(false);
    setLightbox(null);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      // Lightbox handles its own Esc — only close the card when no lightbox.
      if (e.key === 'Escape' && !lightbox) setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, setSelected, lightbox]);

  if (!attraction) return null;

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="modal-backdrop" onClick={() => setSelected(null)}>
      <div className="attraction-card" onClick={(e) => e.stopPropagation()}>
        <div className="attraction-card__header">
          {attraction.image_url ? (
            <button
              type="button"
              className="attraction-card__image-btn"
              onClick={() => setLightbox({ urls: [attraction.image_url!], index: 0 })}
              aria-label="Открыть фото на весь экран"
            >
              <img
                className="attraction-card__image"
                src={attraction.image_url}
                alt={attraction.title}
              />
            </button>
          ) : (
            <div className="attraction-card__image attraction-card__image--placeholder">
              {attraction.title.charAt(0)}
            </div>
          )}
          <button
            className="icon-btn icon-btn--overlay icon-btn--md attraction-card__close"
            onClick={() => setSelected(null)}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="attraction-card__body">
          <h2 className="attraction-card__title">{attraction.title}</h2>

          {reviews.length > 0 && (
            <div className="attraction-card__summary">
              <Stars value={Math.round(avg)} />
              <span className="attraction-card__avg">{avg.toFixed(1)}</span>
              <span className="attraction-card__count">
                {reviews.length} {pluralizeReviews(reviews.length)}
              </span>
            </div>
          )}

          {attraction.description && (
            <p className="attraction-card__description">{attraction.description}</p>
          )}

          <section className="attraction-card__reviews">
            <header className="attraction-card__reviews-head">
              <h3 className="attraction-card__section-title">Отзывы</h3>
              {!formOpen && (
                <button
                  type="button"
                  className="btn btn--primary attraction-card__write-btn"
                  onClick={() => setFormOpen(true)}
                >
                  Оставить отзыв
                </button>
              )}
            </header>

            {formOpen && (
              <div className="attraction-card__form-wrap">
                <ReviewForm
                  attractionId={attraction.id}
                  districtId={attraction.district_id}
                  onSubmitted={() => setFormOpen(false)}
                />
                <button
                  type="button"
                  className="btn btn--ghost attraction-card__form-cancel"
                  onClick={() => setFormOpen(false)}
                >
                  Отмена
                </button>
              </div>
            )}

            {reviews.length === 0 && !formOpen && (
              <div className="reviews-list__empty">
                Пока нет отзывов. Будьте первым!
              </div>
            )}

            <div className="reviews-list">
              {reviews.map((r) => (
                <article key={r.id} className="review">
                  <header className="review__head">
                    <span className="review__author">{r.author_name}</span>
                    <span className="review__date">
                      {new Date(r.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </header>
                  <div className="review__rating">
                    <Stars value={r.rating} />
                  </div>
                  <p className="review__text">{r.text}</p>
                  {r.photo_urls && r.photo_urls.length > 0 && (
                    <div className="review__photos">
                      {r.photo_urls.map((url, i) => (
                        <button
                          type="button"
                          key={url}
                          className="review__photo"
                          onClick={() => setLightbox({ urls: r.photo_urls, index: i })}
                          aria-label={`Открыть фото ${i + 1}`}
                        >
                          <img src={url} alt="" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      {lightbox && (
        <Lightbox
          urls={lightbox.urls}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function pluralizeReviews(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'отзыв';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'отзыва';
  return 'отзывов';
}
