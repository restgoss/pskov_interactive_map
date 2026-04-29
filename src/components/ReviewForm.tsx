import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useCreateReview } from '@/hooks/useReviews';
import { uploadReviewPhotos } from '@/api/storage';
import { compressImage } from '@/lib/imageCompress';

interface Props {
  attractionId: string;
  districtId: string;
  /** Called once the review has been submitted and the form has reset. */
  onSubmitted?: () => void;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_PHOTOS = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = /^image\/(jpeg|jpg|png|webp|heic|heif)$/i;

interface PendingPhoto {
  file: File;
  previewUrl: string;
}

export function ReviewForm({ attractionId, districtId, onSubmitted }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mutation = useCreateReview();

  // Revoke object URLs when previews are dropped or component unmounts.
  useEffect(() => {
    return () => {
      for (const p of photos) URL.revokeObjectURL(p.previewUrl);
    };
    // We deliberately don't include `photos` — see addPhotos/removePhoto for
    // explicit revocation when items leave the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPhotos = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    setError(null);
    const next: PendingPhoto[] = [];
    for (const f of Array.from(incoming)) {
      if (photos.length + next.length >= MAX_PHOTOS) break;
      if (!ACCEPTED_TYPES.test(f.type)) {
        setError('Поддерживаются только изображения (JPG, PNG, WebP, HEIC).');
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        setError(`Файл «${f.name}» больше 5 МБ.`);
        continue;
      }
      next.push({ file: f, previewUrl: URL.createObjectURL(f) });
    }
    if (next.length) setPhotos((curr) => [...curr, ...next]);
    // Reset input so the same file can be re-picked after removal.
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos((curr) => {
      const removed = curr[idx];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return curr.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!name.trim()) return setError('Укажите имя');
    if (!EMAIL_RE.test(email)) return setError('Введите корректный email');
    if (rating < 1 || rating > 5) return setError('Поставьте оценку от 1 до 5');
    if (!text.trim()) return setError('Напишите отзыв');

    try {
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        setIsUploading(true);
        // Compress in parallel (CPU work), then upload sequentially.
        const compressed = await Promise.all(photos.map((p) => compressImage(p.file)));
        photoUrls = await uploadReviewPhotos(compressed, attractionId);
        setIsUploading(false);
      }

      await mutation.mutateAsync({
        attraction_id: attractionId,
        district_id: districtId,
        author_name: name.trim(),
        user_email: email.trim(),
        rating,
        text: text.trim(),
        status_id: 'pending',
        photo_urls: photoUrls,
      });

      setName('');
      setEmail('');
      setRating(0);
      setText('');
      for (const p of photos) URL.revokeObjectURL(p.previewUrl);
      setPhotos([]);
      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      setIsUploading(false);
      setError(err instanceof Error ? err.message : 'Не удалось отправить отзыв');
    }
  };

  const displayed = hoverRating || rating;
  const isPending = mutation.isPending || isUploading;

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="review-form__title">Оставить отзыв</div>

      <div className="review-form__row">
        <div className="review-form__field">
          <label className="review-form__label">Имя</label>
          <input
            className="review-form__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
        </div>
        <div className="review-form__field">
          <label className="review-form__label">Email</label>
          <input
            className="review-form__input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="review-form__rating-row">
        <span className="review-form__label">Оценка</span>
        <div className="review-form__rating" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`review-form__star${displayed >= n ? ' review-form__star--active' : ''}`}
              onMouseEnter={() => setHoverRating(n)}
              onClick={() => setRating(n)}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <div className="review-form__field">
        <label className="review-form__label">Отзыв</label>
        <textarea
          className="review-form__textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={4000}
          placeholder="Поделитесь впечатлениями..."
        />
      </div>

      <div className="review-form__field">
        <label className="review-form__label">
          Фото (до {MAX_PHOTOS} шт., 5 МБ каждое)
        </label>
        <div className="review-form__photos">
          {photos.map((p, i) => (
            <div key={p.previewUrl} className="review-form__photo">
              <img src={p.previewUrl} alt={`Фото ${i + 1}`} />
              <button
                type="button"
                className="icon-btn icon-btn--overlay icon-btn--sm review-form__photo-remove"
                onClick={() => removePhoto(i)}
                aria-label="Удалить фото"
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              className="review-form__photo-add"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Добавить фото"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Добавить</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            hidden
            onChange={(e) => addPhotos(e.target.files)}
          />
        </div>
      </div>

      {error && <div className="review-form__error">{error}</div>}
      {success && (
        <div className="review-form__success">
          Спасибо! Отзыв отправлен на модерацию и появится после проверки.
        </div>
      )}

      <div className="review-form__actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isPending}
        >
          {isUploading
            ? 'Загружаем фото...'
            : mutation.isPending
              ? 'Отправляем...'
              : 'Отправить'}
        </button>
      </div>
    </form>
  );
}
