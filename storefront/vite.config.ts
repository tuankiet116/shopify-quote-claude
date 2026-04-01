import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.ts',
            name: 'QuoteApp',
            formats: ['iife'],
            fileName: () => 'quote-app.min.js',
        },
        outDir: 'extensions/quote-storefront/assets',
        emptyOutDir: false,
        minify: true,
    },
});
