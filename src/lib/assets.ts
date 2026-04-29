/**
 * Build a URL to a static file in `public/`. Prefixes with Vite's BASE_URL
 * so paths work both locally (`/`) and on GitHub Pages (`/pskov_interactive_map/`).
 *
 * Pass `'coats/foo.png'` (no leading slash) — the helper handles the join.
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL; // ends with '/'
  const trimmed = path.startsWith('/') ? path.slice(1) : path;
  return base + trimmed;
}
