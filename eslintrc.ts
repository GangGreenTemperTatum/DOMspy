import type { Linter } from 'eslint';

const config: Linter.Config = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:svelte/recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        extraFileExtensions: ['.svelte']
    },
    plugins: ['@typescript-eslint'],
    overrides: [
        {
            files: ['*.svelte'],
            parser: 'svelte-eslint-parser',
            parserOptions: {
                parser: '@typescript-eslint/parser'
            }
        }
    ],
    rules: {
        'no-unused-vars': 'error',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'svelte/valid-compile': 'error',
        'svelte/no-at-html-tags': 'error',
        'svelte/require-store-callbacks-use-set-param': 'error',
        'svelte/require-store-reactive-access': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/strict-boolean-expressions': 'error'
    }
};

export default config;