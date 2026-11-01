// ESLint (flat config): TypeScript and Astro files. Formatting is Prettier's job, not ESLint's.
// Accessibility is checked on the rendered pages by axe (chore/browser-tests), not by a lint plugin: the plugin that
// reads Astro templates pulls in axe-core (MPL-2.0), an exception that is decided with the browser tests.
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist/', 'node_modules/', '.astro/', '.wrangler/', 'graphify-out/', 'docs/', 'public/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    rules: {
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  // Node scripts and the config files run in Node: its globals (process, Buffer) are known.
  {
    files: ['scripts/**/*.mjs', '*.config.{mjs,ts}'],
    languageOptions: { globals: globals.node },
  },
  // The site's own code never prints: a message to the visitor comes from the dictionaries, a log from src/server/log.ts.
  {
    files: ['src/**/*.{ts,astro}'],
    ignores: ['src/server/log.ts'],
    rules: { 'no-console': 'error' },
  },
);
