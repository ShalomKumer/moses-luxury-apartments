// A small read-only web server for the browser tests: it serves the built site and adds the headers of `_headers`
// (the real CSP among them), so a page that breaks the policy fails here as it would in production.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { headersFor, parseHeadersFile } from './headers-file.mjs';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

/**
 * The file a request path means inside the build folder, or null when it points outside it or at nothing.
 * A folder means its index.html, as the host does.
 * @param {string} root absolute path of the build folder
 * @param {string} pathname the request path, already decoded
 * @returns {Promise<string | null>}
 */
export async function resolveFile(root, pathname) {
  const target = normalize(join(root, pathname));
  if (target !== root && !target.startsWith(root + sep)) return null; // path traversal
  const info = await stat(target).catch(() => null);
  if (info?.isFile()) return target;
  if (info?.isDirectory()) {
    const index = join(target, 'index.html');
    return (await stat(index).catch(() => null))?.isFile() ? index : null;
  }
  return null;
}

/**
 * The test server. GET and HEAD only; everything else is refused.
 * @param {{ root: string, headersText: string }} options the build folder and the text of its `_headers` file
 * @returns {import('node:http').Server}
 */
export function createStaticServer({ root, headersText }) {
  const base = resolve(root);
  const rules = parseHeadersFile(headersText);
  return createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    } catch {
      response.writeHead(400).end();
      return;
    }
    const file = pathname.includes('\0') ? null : await resolveFile(base, pathname);
    const headers = headersFor(rules, pathname);
    if (!file) {
      const missing = join(base, '404.html');
      const body = await readFile(missing).catch(() => Buffer.from('Not found'));
      response.writeHead(404, { ...headers, 'Content-Type': TYPES['.html'] });
      response.end(request.method === 'HEAD' ? undefined : body);
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, { ...headers, 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    response.end(request.method === 'HEAD' ? undefined : body);
  });
}
