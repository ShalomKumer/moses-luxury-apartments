// Starts the test server over dist/client on 127.0.0.1 only:  node tests/e2e/server/start.mjs [port]
// Playwright starts it (playwright.config.ts); it is never run for a visitor.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createStaticServer } from './serve-static.mjs';

const port = Number(process.argv[2] ?? 4322);
const root = resolve('dist/client');
const server = createStaticServer({ root, headersText: readFileSync(resolve(root, '_headers'), 'utf8') });
server.listen(port, '127.0.0.1', () => console.log(`Test server for ${root} on http://127.0.0.1:${port}`));
