import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lineOf, listFiles, projectPath, readText, ROOT } from './helpers/source-files';

/** A layer of src/, or a kind of import that is not a project file. */
type Layer =
  | 'domain' | 'server' | 'api' | 'api-client' | 'components' | 'config' | 'pages' | 'styles' | 'content' | 'i18n'
  | 'astro-virtual' | 'package' | 'other';

/** Who may import whom (docs/structure.md, "Layer rules"). Imports inside the same layer are always allowed. */
const ALLOWED: Partial<Record<Layer, Layer[]>> = {
  domain: ['config'],
  server: ['domain', 'config'],
  api: ['server', 'config', 'astro-virtual', 'package'],
  'api-client': ['domain'],
  components: ['domain', 'api-client', 'config', 'i18n', 'styles', 'astro-virtual', 'package'],
  pages: ['components', 'config', 'i18n', 'astro-virtual', 'package'],
  i18n: [],
};

const ALIASES: Record<string, string> = {
  '@domain/': 'src/domain/',
  '@server/': 'src/server/',
  '@api-client/': 'src/api-client/',
  '@components/': 'src/components/',
  '@config/': 'src/config/',
  '@i18n/': 'src/i18n/',
  '@styles/': 'src/styles/',
};

const IMPORT_PATTERN = /(?:import|export)\s+(?:type\s+)?[^'"`;]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

/** Says which layer a project file belongs to. */
function layerOfPath(path: string): Layer {
  const rel = projectPath(path);
  if (rel.startsWith('src/pages/api/')) return 'api';
  const match = /^src\/([^/]+)\//.exec(rel);
  const top = match?.[1];
  const known: Layer[] = ['domain', 'server', 'api-client', 'components', 'config', 'pages', 'styles', 'content', 'i18n'];
  return known.includes(top as Layer) ? (top as Layer) : 'other';
}

/** Says which layer an import specifier, written in a file, points to. */
function layerOfImport(specifier: string, fromFile: string): Layer {
  if (specifier.startsWith('astro:')) return 'astro-virtual';
  const alias = Object.keys(ALIASES).find((prefix) => specifier.startsWith(prefix));
  if (alias) return layerOfPath(join(ROOT, ALIASES[alias], specifier.slice(alias.length)));
  if (specifier.startsWith('.')) return layerOfPath(resolve(dirname(fromFile), specifier));
  return 'package';
}

/** Lists every import in src/ that breaks the layer rules, as "file:line imports X (a -> b)". */
function findBreaches(): string[] {
  const breaches: string[] = [];
  for (const file of listFiles('src', ['.ts', '.astro'])) {
    const from = layerOfPath(file);
    const allowed = ALLOWED[from];
    if (!allowed) continue;
    const text = readText(file);
    for (const match of text.matchAll(IMPORT_PATTERN)) {
      const specifier = match[1] ?? match[2] ?? match[3];
      const to = layerOfImport(specifier, file);
      if (to !== from && !allowed.includes(to)) {
        breaches.push(`${projectPath(file)}:${lineOf(text, match.index)} imports ${specifier} (${from} -> ${to})`);
      }
    }
  }
  return breaches;
}

/** Lists uses of a pattern in src/ outside the layers allowed to use it. */
function findUses(pattern: RegExp, allowedLayers: Layer[]): string[] {
  return listFiles('src', ['.ts', '.astro'])
    .filter((file) => !allowedLayers.includes(layerOfPath(file)))
    .flatMap((file) => {
      const text = readText(file);
      return [...text.matchAll(pattern)].map((match) => `${projectPath(file)}:${lineOf(text, match.index)}`);
    });
}

describe('layer rules (docs/structure.md)', () => {
  it('no file imports from a layer it may not use', () => {
    expect(findBreaches()).toEqual([]);
  });

  it('only api-client/ and server/ call fetch', () => {
    expect(findUses(/\bfetch\s*\(/g, ['api-client', 'server'])).toEqual([]);
  });

  it('domain/ and server/ never touch the DOM', () => {
    const domUse = /\b(document|window)\.|\b(HTMLElement|localStorage|sessionStorage)\b/g;
    const offenders = listFiles('src', ['.ts'])
      .filter((file) => ['domain', 'server'].includes(layerOfPath(file)))
      .flatMap((file) => [...readText(file).matchAll(domUse)].map(() => projectPath(file)));
    expect(offenders).toEqual([]);
  });
});
