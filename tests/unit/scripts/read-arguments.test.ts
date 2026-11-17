import { describe, expect, it } from 'vitest';
import { readArguments } from '../../../scripts/launch/read-arguments.mjs';

const DEFAULT = 'https://www.example.com';

describe('readArguments', () => {
  it('uses the site address when none is given', () => {
    expect(readArguments([], DEFAULT)).toEqual({ siteUrl: DEFAULT });
  });

  it('takes a live address and a preview address, without a trailing slash', () => {
    expect(readArguments(['https://www.other.com/', '--preview', 'https://moses.acct.workers.dev/'], DEFAULT)).toEqual({
      siteUrl: 'https://www.other.com',
      previewUrl: 'https://moses.acct.workers.dev',
    });
  });

  it('refuses a --preview without a value, instead of skipping the check', () => {
    expect(readArguments(['--preview'], DEFAULT)).toHaveProperty('error');
    expect(readArguments(['--preview', '--other'], DEFAULT)).toHaveProperty('error');
  });

  it('refuses an address that is not https, has a path, a query, a login or a port', () => {
    for (const bad of [
      'http://www.example.com',
      'www.example.com',
      'https://www.example.com/path',
      'https://www.example.com/?a=1',
      'https://user:pass@www.example.com', // secret-scan:allow: a made-up address, to prove a login in the address is refused
      'https://www.example.com:8443',
    ]) {
      expect(readArguments([bad], DEFAULT), bad).toHaveProperty('error');
      expect(readArguments(['--preview', bad], DEFAULT), `preview ${bad}`).toHaveProperty('error');
    }
  });

  it('refuses a repeated flag, a second live address and an unknown flag', () => {
    expect(
      readArguments(['--preview', 'https://a.workers.dev', '--preview', 'https://b.workers.dev'], DEFAULT),
    ).toHaveProperty('error');
    expect(readArguments(['https://www.a.com', 'https://www.b.com'], DEFAULT)).toHaveProperty('error');
    expect(readArguments(['--previews', 'https://a.workers.dev'], DEFAULT)).toHaveProperty('error');
  });

  it('refuses a workers.dev or pages.dev address as the live address, which belongs after --preview', () => {
    const result = readArguments(['https://moses.acct.workers.dev'], DEFAULT);
    expect(result).toHaveProperty('error');
    expect(readArguments(['https://moses.pages.dev'], DEFAULT)).toHaveProperty('error');
    expect(readArguments(['--preview', 'https://moses.acct.workers.dev'], DEFAULT)).not.toHaveProperty('error');
  });

  it("refuses the host's preview address as the default too, so a wrong site-url.ts cannot be checked as live", () => {
    expect(readArguments([], 'https://moses.acct.workers.dev')).toHaveProperty('error');
  });
});
