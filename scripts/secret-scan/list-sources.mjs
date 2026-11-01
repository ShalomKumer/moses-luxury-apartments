// Lists the files to scan: what git tracks or would track (so the ignored .env is left out), and the build in dist/.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BINARY = /\.(png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|eot|zip|gz|pdf|mp4|webm)$/i;
const MAX_BYTES = 2_000_000;

/** Every file under a folder. */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** Paths git tracks plus new files that are not ignored; an empty list outside a git repository. */
export function projectPaths() {
  if (!existsSync('.git')) return [];
  const out = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    encoding: 'utf8',
    maxBuffer: 64_000_000,
  });
  return out.split('\0').filter(Boolean).filter((path) => existsSync(path));
}

/** The paths to scan: the project's own files and the build output. */
export function pathsToScan() {
  const dist = existsSync('dist') ? walk('dist') : [];
  return [...new Set([...projectPaths(), ...dist.map((path) => path.replace(/\\/g, '/'))])];
}

/** Reads a file as text, or null for a binary, a huge file, a folder, or a file that vanished or cannot be read. */
export function readScannable(path) {
  try {
    const info = statSync(path);
    if (!info.isFile() || BINARY.test(path) || info.size > MAX_BYTES) return null;
    const bytes = readFileSync(path);
    return bytes.subarray(0, 8000).includes(0) ? null : bytes.toString('utf8');
  } catch {
    return null;
  }
}
