import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// `base` controls every path Vite emits in `dist/index.html`. On GitHub
// Pages the site is served from `https://<user>.github.io/<repo>/`, so we
// need every URL to be prefixed with the repo name. Locally `base: '/'`.
//
// We also export `BASE_URL` to runtime code via `import.meta.env.BASE_URL`
// (Vite does this automatically) — the asset helper in src/lib/assets.ts
// uses it to prefix `/coats/...` and `/geo/...` paths at runtime.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/pskov_interactive_map/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
}));
