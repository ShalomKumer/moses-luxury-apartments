// ESLint (flat config): TypeScript and Astro files. Formatting is Prettier's job, not ESLint's.
// Accessibility is checked twice: in the Astro templates by eslint-plugin-jsx-a11y-x (here), and on the rendered pages
// by axe in a real browser (tests/e2e). The plugin pulls in axe-core (MPL-2.0), a build-only exception (C4).
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
  ...astro.configs['jsx-a11y-recommended'],
  {
    rules: {
      // CLAUDE.md: every <ul> and <ol> carries role="list" (Safari and VoiceOver drop the list meaning of a list whose
      // bullets are removed), so that role is not "redundant" here.
      'astro/jsx-a11y/no-redundant-roles': ['error', { ul: ['list'], ol: ['list'] }],
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  // Node scripts and the config files run in Node: its globals (process, Buffer) are known.
  {
    files: ['scripts/**/*.mjs', 'tests/e2e/server/*.mjs', '*.config.{mjs,ts}'],
    languageOptions: { globals: globals.node },
  },
  // The site's own code never prints: a message to the visitor comes from the dictionaries, a log from src/server/log.ts.
  {
    files: ['src/**/*.{ts,astro}'],
    ignores: ['src/server/log.ts'],
    rules: { 'no-console': 'error' },
  },
);
