import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { forbiddenFileFinding, forbiddenFileKind } from '../../../scripts/secret-scan/forbidden-files.mjs';
import { COMMIT_MARKER, parseHistory } from '../../../scripts/secret-scan/parse-history.mjs';
import { formatReport } from '../../../scripts/secret-scan/report.mjs';
import { isReviewed } from '../../../scripts/secret-scan/reviewed-findings.mjs';
import { scanText } from '../../../scripts/secret-scan/scan-text.mjs';

// Every fake secret is built from pieces at run time, so this file never holds a whole one (the scan reads it too).
const fake = {
  privateKey: ['-----BEGIN RSA', 'PRIVATE KEY-----'].join(' '),
  aws: ['AKIA', 'ABCDEFGHIJKLMNOP'].join(''),
  google: ['AIza', 'SyA1234567890abcdefghijklmnopqrstuv'].join(''),
  github: ['ghp', '_', 'a'.repeat(36)].join(''),
  slack: ['xoxb', '-', '1234567890-abcdef'].join(''),
  stripe: ['sk', '_live_', 'a'.repeat(24)].join(''),
  jwt: ['eyJhbGciOiJIUzI1NiJ9', 'eyJzdWIiOiIxMjM0NTY3ODkwIn0', 'abcdefghijklmnop'].join('.'),
  connection: ['postgres', '://admin:', 'hunter2pass', '@db.example.com/app'].join(''),
  calendar: ['https://calendar.google.com/calendar/ical/', 'me%40x.com/private-abc123/basic.ics'].join(''),
  assignment: ['const api', 'Key = "', 'x'.repeat(20), '";'].join(''),
};

const rulesFound = (text: string) => scanText('a.ts', text).map((finding) => finding.rule);

describe('scanText', () => {
  it.each([
    ['private-key', fake.privateKey],
    ['aws-access-key', fake.aws],
    ['google-api-key', fake.google],
    ['github-token', fake.github],
    ['slack-token', fake.slack],
    ['stripe-live-key', fake.stripe],
    ['jwt', fake.jwt],
    ['connection-string', fake.connection],
    ['calendar-secret-address', fake.calendar],
    ['secret-assignment', fake.assignment],
  ])('finds %s', (rule, text) => {
    expect(rulesFound(text)).toContain(rule);
  });

  it('reports the line number, and a finding never holds the secret', () => {
    const findings = scanText('a.ts', `line one\n${fake.aws}\nline three`);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ file: 'a.ts', line: 2, risk: 'high' });
    expect(JSON.stringify(findings)).not.toContain(fake.aws);
  });

  it('finds nothing in ordinary text, URLs and placeholders', () => {
    const clean = [
      'The booking is by WhatsApp: https://wa.me/972500000000?text=hello',
      'DATABASE_URL=postgres://user:<password>@host/db',
      'const label = "password";',
      'token: "short"',
      'https://calendar.google.com/ and calendar.google.com/calendar/ical/',
    ].join('\n');
    expect(rulesFound(clean)).toEqual([]);
  });

  it('skips a line that carries the allow marker', () => {
    expect(rulesFound(`${fake.aws} // secret-scan:allow reviewed`)).toEqual([]);
  });

  it('handles Windows line endings and an empty text', () => {
    expect(scanText('a.ts', `ok\r\n${fake.aws}\r\n`)[0].line).toBe(2);
    expect(scanText('a.ts', '')).toEqual([]);
  });

  it('finds a secret deep inside a very long line, and stays fast on a huge one', () => {
    const minified = `${'a;'.repeat(6000)}${fake.github}${'b;'.repeat(6000)}`;
    expect(rulesFound(minified)).toContain('github-token');
    const started = Date.now();
    rulesFound('x'.repeat(2_000_000));
    expect(Date.now() - started).toBeLessThan(5000);
  });
});

describe('forbiddenFileKind', () => {
  it.each([
    '.env',
    '.env.local',
    'config/.env.production',
    '.dev.vars',
    'server.pem',
    'a/b/site.key',
    'id_rsa',
    'credentials.json',
  ])('forbids %s', (path) => expect(forbiddenFileKind(path)).not.toBeNull());

  it.each(['.env.example', 'src/environment.ts', 'README.md', 'monkey.ts', 'public/robots.txt'])('allows %s', (path) =>
    expect(forbiddenFileKind(path)).toBeNull(),
  );

  it('builds a finding in the same shape as a text finding', () => {
    expect(forbiddenFileFinding('.env')).toMatchObject({ file: '.env', rule: 'forbidden-file', risk: 'high' });
    expect(forbiddenFileFinding('README.md')).toBeNull();
  });
});

describe('parseHistory', () => {
  const log = (body: string) => `${COMMIT_MARKER}1234567890abcdef\n${body}\n`;

  it('finds a secret on an added line, with the commit and the new line number', () => {
    const diff = [
      'diff --git a/src/a.ts b/src/a.ts',
      '--- a/src/a.ts',
      '+++ b/src/a.ts',
      '@@ -1,2 +10,3 @@',
      ' context',
      `+${fake.aws}`,
      ' tail',
    ].join('\n');
    expect(parseHistory(log(diff))).toEqual([
      {
        file: 'src/a.ts',
        line: 11,
        rule: 'aws-access-key',
        risk: 'high',
        what: 'an AWS access key id',
        commit: '1234567',
      },
    ]);
  });

  it('ignores a secret on a removed line or in a context line', () => {
    const diff = ['--- a/a.ts', '+++ b/a.ts', '@@ -1,2 +1,1 @@', `-${fake.aws}`, ` ${fake.aws}`].join('\n');
    expect(parseHistory(log(diff))).toEqual([]);
  });

  it('flags a forbidden file name that was added, and not a deleted file', () => {
    const added = ['--- /dev/null', '+++ b/.env', '@@ -0,0 +1 @@', '+PORT=4321'].join('\n');
    expect(parseHistory(log(added)).map((finding) => finding.rule)).toEqual(['forbidden-file']);
    const deleted = ['--- a/.env', '+++ /dev/null', '@@ -1 +0,0 @@', '-PORT=4321'].join('\n');
    expect(parseHistory(log(deleted))).toEqual([]);
  });

  it('does not mistake an added line that starts with "++ " for a file header', () => {
    const diff = ['--- a/a.ts', '+++ b/a.ts', '@@ -0,0 +1,2 @@', `++ ${fake.aws}`, '+next'].join('\n');
    expect(parseHistory(log(diff))).toEqual([
      { file: 'a.ts', line: 1, rule: 'aws-access-key', risk: 'high', what: 'an AWS access key id', commit: '1234567' },
    ]);
  });

  it('reads a merge commit: only the lines its conflict resolution added', () => {
    const diff = [
      'diff --cc a.txt',
      '--- a/a.txt',
      '+++ b/a.txt',
      '@@@ -1,1 -1,1 +1,3 @@@',
      '  shared',
      `++${fake.aws}`,
      ' +from the second parent',
      '- gone',
    ].join('\n');
    expect(parseHistory(log(diff))).toEqual([
      { file: 'a.txt', line: 2, rule: 'aws-access-key', risk: 'high', what: 'an AWS access key id', commit: '1234567' },
    ]);
  });

  it('copes with an empty log and a commit with no changes', () => {
    expect(parseHistory('')).toEqual([]);
    expect(parseHistory(`${COMMIT_MARKER}abcdef0123456\n`)).toEqual([]);
  });
});

describe('reports and reviewed findings', () => {
  it('names file, place, risk and kind, and never the value', () => {
    const text = formatReport(scanText('src/x.ts', fake.aws));
    expect(text).toContain('[high] src/x.ts:1');
    expect(text).toContain('an AWS access key id');
    expect(text).not.toContain(fake.aws);
  });

  it('accepts only the exact reviewed finding', () => {
    const base = {
      commit: '06e9532',
      file: 'tests/unit/server/calendar-source.test.ts',
      rule: 'calendar-secret-address',
    };
    expect(isReviewed(base)).toBe(true);
    expect(isReviewed({ ...base, commit: 'ffffff0' })).toBe(false);
    expect(isReviewed({ ...base, rule: 'jwt' })).toBe(false);
  });
});

describe('check-secrets, run in a small throw-away git repository', () => {
  const entry = resolve('scripts/secret-scan/check-secrets.mjs');
  const folders: string[] = [];
  afterEach(() => folders.splice(0).forEach((folder) => rmSync(folder, { recursive: true, force: true })));

  /** A new repository with one clean commit. */
  function newRepo(): string {
    const folder = mkdtempSync(join(tmpdir(), 'secret-scan-'));
    folders.push(folder);
    git(folder, 'init', '-q', '-b', 'main');
    writeFileSync(join(folder, 'a.txt'), 'base\n');
    commitAll(folder, 'first');
    return folder;
  }
  const git = (folder: string, ...args: string[]) =>
    execFileSync(
      'git',
      ['-c', 'user.name=t', '-c', 'user.email=t@example.com', '-c', 'commit.gpgsign=false', ...args],
      { cwd: folder, encoding: 'utf8' },
    );
  const commitAll = (folder: string, message: string) => {
    git(folder, 'add', '-A');
    git(folder, 'commit', '-q', '-m', message);
  };
  const scan = (folder: string, ...flags: string[]) =>
    spawnSync('node', [entry, ...flags], { cwd: folder, encoding: 'utf8' });

  it('passes on a clean repository, with and without the history', () => {
    const folder = newRepo();
    expect(scan(folder).status).toBe(0);
    expect(scan(folder, '--history').status).toBe(0);
  });

  it('fails on a secret in a file, prints where it is and never the value', () => {
    const folder = newRepo();
    writeFileSync(join(folder, 'config.ts'), `export const k = '${fake.aws}';\n`);
    const result = scan(folder);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('config.ts:1');
    expect(result.stderr).not.toContain(fake.aws);
  });

  it('ignores a git-ignored .env, and fails on one that is not ignored', () => {
    const folder = newRepo();
    writeFileSync(join(folder, '.gitignore'), '.env\n');
    writeFileSync(join(folder, '.env'), 'PORT=1\n');
    expect(scan(folder).status).toBe(0);
    writeFileSync(join(folder, '.gitignore'), '');
    expect(scan(folder).status).toBe(1);
  });

  it('finds a secret that was committed and then removed, only with --history', () => {
    const folder = newRepo();
    writeFileSync(join(folder, 'old.ts'), `${fake.github}\n`);
    commitAll(folder, 'oops');
    git(folder, 'rm', '-q', 'old.ts');
    commitAll(folder, 'remove it');
    expect(scan(folder).status).toBe(0);
    const result = scan(folder, '--history');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('old.ts');
  });

  it('finds a secret that exists only in a merge conflict resolution', () => {
    const folder = newRepo();
    git(folder, 'checkout', '-q', '-b', 'side');
    writeFileSync(join(folder, 'a.txt'), 'side\n');
    commitAll(folder, 'side');
    git(folder, 'checkout', '-q', 'main');
    writeFileSync(join(folder, 'a.txt'), 'main\n');
    commitAll(folder, 'main');
    expect(() => git(folder, 'merge', 'side')).toThrow();
    writeFileSync(join(folder, 'a.txt'), `${fake.aws}\n`);
    commitAll(folder, 'merge');
    const result = scan(folder, '--history');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('a.txt');
  });
});
