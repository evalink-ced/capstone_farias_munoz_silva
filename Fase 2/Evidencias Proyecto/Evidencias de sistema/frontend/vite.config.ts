import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';
import Pages from 'vite-plugin-pages';

const isVisualizer = process.env.VITE_VISUALIZER === 'true';
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  esbuild: isProd ? { drop: ['console', 'debugger'] } : {},
  plugins: [
    react(),
    tsconfigPaths(),
    Pages(),
    isVisualizer && visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,

    }),
  ],
  

  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@heroui') || id.includes('@heroicons')) return 'ui';
            if (id.includes('react-router')) return 'router';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('date-fns')) return 'date';
            if (id.includes('framer-motion')) return 'react';
            if (id.includes('axios')) return 'network';
            if (id.includes('react') || id.includes('react-dom')) return 'react';
          }
        },
      },
    },
  },

  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
});
