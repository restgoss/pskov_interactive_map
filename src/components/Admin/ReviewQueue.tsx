import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveReview,
  fetchReviewsByStatus,
  rejectReview,
  type AdminReview,
  type ReviewStatus,
} from '@/api/admin';
import { Stars } from '@/components/Stars';
import { Lightbox } from '@/components/Lightbox';

const TABS: Array<{ id: ReviewStatus; label: string }> = [
  { id: 'pending',  label: 'На модерации' },
  { id: 'approved', label: 'Одобренные' },
  { id: 'rejected', label: 'Отклонённые' },
];

export function ReviewQueue() {
  const [tab, setTab] = useState<ReviewStatus>('pending');
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);

  const qc = useQueryClient();
  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ['admin-reviews', tab],
    queryFn: () => fetchReviewsByStatus(tab),
  });

  const invalidate = () => {
    // After a status change, every tab needs to re-fetch — the row moved.
    qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    // Public reviews queries are also affected when something gets approved.
    qc.invalidateQueries({ queryKey: ['reviews'] });
    // The map's review counts/averages need to refresh too.
    qc.invalidateQueries({ queryKey: ['review-stats'] });
  };

  const approveMut = useMutation({
    mutationFn: (id: string) => approveReview(id),
    onSuccess: invalidate,
  });
  const rejectMut = useMutation({
    mutationFn: (id: string) => rejectReview(id),
    onSuccess: invalidate,
  });

  return (
    <div className="admin-queue">
      <div className="admin-queue__tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`admin-queue__tab${tab === t.id ? ' admin-queue__tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <div className="admin-queue__empty">Загрузка...</div>}
      {error && <div className="admin-queue__empty">Ошибка: {String(error)}</div>}
      {!isLoading && !error && reviews.length === 0 && (
        <div className="admin-queue__empty">Пусто.</div>
      )}

      <div className="admin-queue__list">
        {reviews.map((r) => (
          <ReviewCard
            key={r.id}
            review={r}
            currentTab={tab}
            onApprove={() => approveMut.mutate(r.id)}
            onReject={() => rejectMut.mutate(r.id)}
            isPending={approveMut.isPending || rejectMut.isPending}
            onPhotoClick={(idx) => setLightbox({ urls: r.photo_urls, index: idx })}
          />
        ))}
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

interface CardProps {
  review: AdminReview;
  currentTab: ReviewStatus;
  onApprove: () => void;
  onReject: () => void;
  isPending: boolean;
  onPhotoClick: (idx: number) => void;
}

function ReviewCard({ review, currentTab, onApprove, onReject, isPending, onPhotoClick }: CardProps) {
  return (
    <article className="admin-review">
      <header className="admin-review__head">
        <div>
          <div className="admin-review__attraction">
            {review.attraction_title ?? '— достопримечательность не найдена —'}
          </div>
          <div className="admin-review__meta">
            <span className="admin-review__author">{review.author_name}</span>
            {review.user_email && (
              <span className="admin-review__email">{review.user_email}</span>
            )}
            <span className="admin-review__date">
              {new Date(review.created_at).toLocaleString('ru-RU')}
            </span>
          </div>
        </div>
        <Stars value={review.rating} />
      </header>

      <p className="admin-review__text">{review.text}</p>

      {review.photo_urls && review.photo_urls.length > 0 && (
        <div className="admin-review__photos">
          {review.photo_urls.map((url, i) => (
            <button
              type="button"
              key={url}
              className="admin-review__photo"
              onClick={() => onPhotoClick(i)}
              aria-label={`Открыть фото ${i + 1}`}
            >
              <img src={url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <footer className="admin-review__actions">
        {currentTab !== 'approved' && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={onApprove}
            disabled={isPending}
          >
            Одобрить
          </button>
        )}
        {currentTab !== 'rejected' && (
          <button
            type="button"
            className="btn btn--ghost admin-review__reject"
            onClick={onReject}
            disabled={isPending}
          >
            Отклонить
          </button>
        )}
      </footer>
    </article>
  );
}
