import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dts from 'vite-plugin-dts';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      copyDtsFiles: true
    }),
  ],
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
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'ReactMindmap',
      formats: ['es'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@radix-ui/react-dropdown-menu',
        'framer-motion',
        'd3',
        'd3-selection',
        /node_modules/
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].mjs',
        dir: 'dist',
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@radix-ui/react-dropdown-menu': 'RadixDropdownMenu',
          'framer-motion': 'FramerMotion',
          'd3': 'd3',
          'd3-selection': 'd3Selection'
        },
        generatedCode: {
          objectShorthand: true,
        },
        format: 'es',
        minifyInternalExports: false
      }
    },
    minify: false,
    emptyOutDir: true,
  }
});