import { supabase } from '@/lib/supabase';

const REVIEW_PHOTOS_BUCKET = 'review-photos';

/**
 * Upload one image to the review-photos bucket. Returns the public URL.
 * Path layout: `<attractionId>/<random-uuid>.<ext>` — flat per attraction,
 * easy to clean up if an attraction is deleted (cascade in storage policy).
 */
async function uploadOne(file: File, attractionId: string): Promise<string> {
  const ext = file.type === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() ?? 'bin').toLowerCase();
  const path = `${attractionId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(REVIEW_PHOTOS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: '31536000', // 1 year — these files never change
      upsert: false,
    });
  if (error) throw error;

  const { data } = supabase.storage.from(REVIEW_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadReviewPhotos(
  files: File[],
  attractionId: string,
): Promise<string[]> {
  // Sequential, not parallel — keeps the network polite on slow phone uplinks
  // and makes any failure partial-fail rather than half-corrupting state.
  const urls: string[] = [];
  for (const f of files) {
    urls.push(await uploadOne(f, attractionId));
  }
  return urls;
}
