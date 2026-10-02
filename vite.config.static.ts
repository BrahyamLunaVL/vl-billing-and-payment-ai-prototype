import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Standalone build config for a version of the app that opens directly as a
 * local file (double-click index.html) — no dev server, no `npm run preview`.
 * Separate from vite.config.ts (which the normal dev/build/test workflow
 * uses) so this doesn't affect those. `base: './'` makes every asset
 * reference relative instead of root-absolute, and `viteSingleFile` inlines
 * the JS/CSS into index.html as plain (non-module) <script>/<style> tags —
 * both are required for file:// to work, since browsers block ES module
 * script loading over file:// via CORS regardless of the base path.
 */
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: {
    outDir: 'dist-offline',
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
  },
});
