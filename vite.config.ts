import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import preprocess from 'svelte-preprocess';

export default defineConfig({
  plugins: [
    svelte({
      preprocess: preprocess(),
      compilerOptions: {
        dev: process.env.NODE_ENV !== 'production'
      }
    })
  ],
  build: {
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production'
  }
});