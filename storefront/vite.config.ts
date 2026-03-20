import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.ts',
            name: 'QuoteApp',
            formats: ['iife'],
            fileName: () => 'quote-app.min.js',
        },
        outDir: 'extension/assets',
        emptyOutDir: false,
        minify: true,
    },
});
