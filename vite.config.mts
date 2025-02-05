import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const commonExternal = ['d3', 'react', 'react-dom'];

const commonConfig = {
  plugins: [react()],
  resolve: {
    alias: {
      '@gera2ld/jsx-dom': 'react'
    }
  },
  esbuild: {
    jsxInject: `import React from 'react'`
  }
};

const configEs = defineConfig({
  ...commonConfig,
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [...commonExternal, 'mdmindmap-common'],
      output: {
        preserveModules: true
      }
    },
  },
});

const configJs = defineConfig({
  ...commonConfig,
  build: {
    emptyOutDir: false,
    outDir: 'dist/browser',
    minify: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['iife'],
      fileName: () => 'index.js',
      name: 'markmap',
    },
    rollupOptions: {
      external: commonExternal,
      output: {
        extend: true,
        globals: {
          d3: 'd3',
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
});

export default process.env.TARGET === 'es' ? configEs : configJs;