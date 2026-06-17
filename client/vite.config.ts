import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Client talks to the API by absolute URL (VITE_API_URL) with CORS, so there is
// no dev proxy to keep in sync. Vitest runs components in jsdom.
export default defineConfig({
  plugins: [react()],
  // One .env at the repo root configures both workspaces, so the client and the
  // server cannot disagree about the API's port.
  envDir: '..',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
