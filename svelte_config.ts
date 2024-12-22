import preprocess from 'svelte-preprocess';

export default {
  preprocess: preprocess({
    typescript: {
      tsconfigFile: './tsconfig.json'
    },
    sourceMap: true
  }),
  compilerOptions: {
    dev: process.env.NODE_ENV !== 'production'
  }
};