// File names that must never be in the project or its history, whatever they hold (S13, S19).

/** The rules by file name: [what it is, a test on the base name]. */
const FORBIDDEN = [
  ['an environment file', (name) => /^\.env(\..+)?$/.test(name) && name !== '.env.example'],
  ['a Cloudflare local secrets file', (name) => /^\.dev\.vars/.test(name)],
  ['a key or certificate file', (name) => /\.(pem|key|p12|pfx|jks|keystore)$/i.test(name)],
  ['an SSH private key', (name) => /^id_(rsa|dsa|ecdsa|ed25519)$/.test(name)],
  ['a credentials file', (name) => /^(credentials|service-account.*|client_secret.*)\.json$/i.test(name)],
];

/** Returns what a path is if its file name is forbidden, otherwise null. */
export function forbiddenFileKind(path) {
  const name = path.split(/[\\/]/).pop() ?? '';
  const hit = FORBIDDEN.find(([, test]) => test(name));
  return hit ? hit[0] : null;
}

/** A finding for a forbidden file name, in the same shape as a text finding, or null. */
export function forbiddenFileFinding(path) {
  const kind = forbiddenFileKind(path);
  return kind ? { file: path, line: 0, rule: 'forbidden-file', risk: 'high', what: kind } : null;
}
