import { build } from 'vite';
import { copy } from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import preprocess from 'svelte-preprocess';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const entries = [
  {
    name: 'popup',
    entry: 'src/popup/popup.ts',
    needsSvelte: true
  },
  {
    name: 'content',
    entry: 'src/content-scripts/content.ts',
    needsSvelte: false
  },
  {
    name: 'background',
    entry: 'src/background/background.ts',
    needsSvelte: false
  }
];

async function buildExtension() {
  try {
    await copy(
      path.resolve(rootDir, 'public'),
      path.resolve(rootDir, 'dist'),
      {
        overwrite: true,
        filter: (src) => {
          if (process.env.NODE_ENV === 'production' && src.endsWith('.map')) {
            return false;
          }
          return true;
        }
      }
    );

    for (const config of entries) {
      console.log(`Building ${config.name}...`);
      await build({
        configFile: false,
        mode: process.env.NODE_ENV || 'production',
        build: {
          lib: {
            entry: path.resolve(rootDir, config.entry),
            name: config.name,
            formats: ['iife'],
            fileName: () => `${config.name}.js`
          },
          outDir: 'dist',
          emptyOutDir: false,
          sourcemap: true,
          rollupOptions: {
            output: {
              extend: true,
              globals: {
                chrome: 'chrome'
              },
              name: config.name,
              inlineDynamicImports: true,
              format: 'iife',
              generatedCode: {
                constBindings: true
              }
            }
          }
        },
        plugins: config.needsSvelte ? [
          svelte({
            preprocess: preprocess(),
            compilerOptions: {
              dev: false
            }
          })
        ] : []
      });
    }

    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildExtension();
