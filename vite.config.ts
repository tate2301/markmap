import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        playground: 'src/playground.ts',
      },
      formats: ['es'],
    },
  },
});
