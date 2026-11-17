import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const BUILD = 'dist/client';

/** Every .html file under a folder, as a path with forward slashes relative to it. */
function htmlFiles(folder: string, prefix = ''): string[] {
  return readdirSync(join(folder, prefix), { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return htmlFiles(folder, relative);
    return entry.name.endsWith('.html') ? [relative] : [];
  });
}

/**
 * The address of every page in the build: `index.html` files are their folder, `404.html` is itself.
 * Fails loudly when there is no build, so a missing `npm run build` is never read as "no pages to test".
 */
export function builtPages(): string[] {
  if (!existsSync(BUILD)) throw new Error(`${BUILD} not found. Run "npm run build" before the browser tests.`);
  const pages = htmlFiles(BUILD).map((file) =>
    file === 'index.html' ? '/' : file.endsWith('/index.html') ? `/${file.slice(0, -'index.html'.length)}` : `/${file}`,
  );
  if (pages.length === 0) throw new Error(`${BUILD} holds no page.`);
  return pages.sort();
}
