import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        onstart({ startup }) {
          startup();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron', 'better-sqlite3', 'fs-extra']
            }
          }
        }
      },
      {
        entry: 'electron/preload.ts',
        onstart({ reload }) {
          reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron'
          }
        }
      }
    ])
    // REMOVED: renderer plugin - it injects require() which breaks in browser context
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Fix for Electron renderer process
  build: {
    rollupOptions: {
      output: {
        format: 'es', // Use ES modules instead of CommonJS
        // Don't use require() in renderer
        inlineDynamicImports: false
      }
    },
    // Target ES2020+ for better module support
    target: 'esnext',
    // Don't minify for easier debugging
    minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false
  },
  // Optimize dependencies
  optimizeDeps: {
    exclude: ['electron']
  },
  server: {
    port: 5173
  }
});
