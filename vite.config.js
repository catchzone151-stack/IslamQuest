import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_debugger: true,
        // Drop all console.* except console.error so production errors remain visible.
        pure_funcs: [
          'console.log',
          'console.warn',
          'console.info',
          'console.debug',
          'console.trace',
          'console.dir',
          'console.group',
          'console.groupEnd',
          'console.time',
          'console.timeEnd',
          'console.count',
          'console.assert',
        ],
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          animations: ['framer-motion'],
        }
      }
    }
  }
});
