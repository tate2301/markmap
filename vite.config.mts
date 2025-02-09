import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  worker: {
    format: 'es',
    plugins: () => []
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'layout-worker': ['./src/lib/view/workers/layout.worker.ts']
        }
      }
    }
  }
});