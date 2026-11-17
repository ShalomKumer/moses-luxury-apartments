import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The project's root folder. */
export const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

/** Lists every file under a folder (relative to the root) whose name ends with one of the extensions. */
export function listFiles(folder: string, extensions: string[]): string[] {
  const start = join(ROOT, folder);
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (extensions.some((ext) => name.endsWith(ext))) found.push(path);
    }
  };
  walk(start);
  return found;
}

/** Returns a path relative to the root with forward slashes, for readable messages. */
export function projectPath(path: string): string {
  return relative(ROOT, path).split(sep).join('/');
}

/** Reads a file as text. */
export function readText(path: string): string {
  return readFileSync(path, 'utf8');
}

/** Returns the 1-based line number of a character offset in a text. */
export function lineOf(text: string, offset: number): number {
  return text.slice(0, offset).split('\n').length;
}
