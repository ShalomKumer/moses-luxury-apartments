import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/** Resolves a project folder for an alias, matching tsconfig.json paths. */
const folder = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@domain': folder('./src/domain'),
      '@server': folder('./src/server'),
      '@api-client': folder('./src/api-client'),
      '@components': folder('./src/components'),
      '@config': folder('./src/config'),
      '@i18n': folder('./src/i18n'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
