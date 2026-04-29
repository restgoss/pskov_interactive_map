/**
 * Client-side image compression for review uploads.
 *
 * Phone photos can easily be 5–10 MB; uploading them raw makes the form
 * feel broken. We resize to a 1600px max dimension and re-encode as JPEG
 * at 0.85 quality on a canvas — typical output is 200–600 KB which fits
 * well under the 5 MB storage policy.
 */

const MAX_DIMENSION = 1600;
const QUALITY = 0.85;

export async function compressImage(file: File): Promise<File> {
  // Skip non-images and tiny files (already small enough).
  if (!file.type.startsWith('image/')) return file;

  const img = await loadImage(file);
  const longest = Math.max(img.width, img.height);
  const ratio = longest > MAX_DIMENSION ? MAX_DIMENSION / longest : 1;

  // Bail out if no resize needed AND file is already small.
  if (ratio === 1 && file.size < 800_000) return file;

  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, w, h);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', QUALITY),
  );
  if (!blob) return file;

  // Always rename to .jpg since we re-encoded.
  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg' });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
