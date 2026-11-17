// Reads the command line of `check-live.mjs`: pure, so every way to get it wrong is tested (a missing value must never skip a check).

/** The hosts that are the host's own preview and test addresses: never the live site. */
const PREVIEW_HOSTS = ['.workers.dev', '.pages.dev'];

/**
 * An address from the command line, or the reason it is refused: it must be `https://host` and nothing more (no path, query, login or port), because
 * the program builds every other address from it.
 * @returns {{ url: string } | { error: string }}
 */
function plainAddress(text) {
  let url;
  try {
    url = new URL(text);
  } catch {
    return { error: `not an address: ${text}` };
  }
  const plain = url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.search && !url.hash;
  if (!plain || (url.pathname !== '/' && url.pathname !== '') || !text.startsWith('https://')) {
    return { error: `give only https://host, with no path, query, login or port: ${text}` };
  }
  return { url: url.origin };
}

/** Tells whether a host is one of the host's own preview or test addresses. */
const isPreviewHost = (host) => PREVIEW_HOSTS.some((suffix) => host.endsWith(suffix));

/**
 * @param {string[]} args the command line after the program name: `[https://www.host] [--preview https://preview-address]`
 * @param {string} defaultSiteUrl the live address used when none is given (the site's own)
 * @returns {{ siteUrl: string, previewUrl?: string } | { error: string }}
 */
export function readArguments(args, defaultSiteUrl) {
  let siteUrl;
  let previewUrl;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--preview') {
      const value = args[++i];
      if (previewUrl !== undefined) return { error: '--preview was given twice' };
      if (value === undefined || value.startsWith('--')) return { error: '--preview needs an address after it' };
      const address = plainAddress(value);
      if ('error' in address) return address;
      previewUrl = address.url;
    } else if (arg.startsWith('--')) {
      return { error: `unknown option: ${arg}` };
    } else {
      if (siteUrl !== undefined) return { error: 'only one live address may be given' };
      const address = plainAddress(arg);
      if ('error' in address) return address;
      siteUrl = address.url;
    }
  }
  siteUrl ??= defaultSiteUrl;
  if (isPreviewHost(new URL(siteUrl).host)) {
    return { error: `${siteUrl} is a preview address of the host, not the live site: give it after --preview` };
  }
  return previewUrl === undefined ? { siteUrl } : { siteUrl, previewUrl };
}
