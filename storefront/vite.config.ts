import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'preact',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'QuoteApp',
      formats: ['iife'],
      fileName: () => 'quote-app.min.js',
    },
    outDir: 'extensions/quote-storefront/assets',
    emptyOutDir: false,
    minify: true,
  },
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
});
