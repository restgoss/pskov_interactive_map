/**
 * Build a URL to a static file in `public/`. Prefixes with Vite's BASE_URL
 * so paths work both locally (`/`) and on GitHub Pages (`/pskov_interactive_map/`).
 *
 * Pass `'coats/foo.png'` (no leading slash) — the helper handles the join.
 *
 * Absolute URLs (`https://...`, `data:...`, `blob:...`) and `null`/`undefined`
 * are returned unchanged — same call site can handle both DB-stored relative
 * paths and external URLs (e.g. Supabase Storage public URLs for review
 * photos) without leaking the base prefix into them.
 */
export function asset(path: string): string;
export function asset(path: null | undefined): null;
export function asset(path: string | null | undefined): string | null;
export function asset(path: string | null | undefined): string | null {
  if (path == null) return null;
  // Already-absolute URL — leave as is.
  if (/^(?:[a-z]+:|\/\/)/i.test(path)) return path;
  const base = import.meta.env.BASE_URL; // ends with '/'
  const trimmed = path.startsWith('/') ? path.slice(1) : path;
  return base + trimmed;
}
