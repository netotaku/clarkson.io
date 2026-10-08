export type RequestSnapshot = {
  schemaVersion: 1;
  // Assigned by the capture server only, never accepted from browser metadata.
  testBatch?: string;
  method: string;
  referrerHostname?: string;
  userAgent?: string;
  viewport?: { width: number; height: number };
  headers: { 'accept-language'?: string };
};

export const SNAPSHOT_LIMITS = {
  method: 16,
  referrerHostname: 253,
  userAgent: 512,
  acceptLanguage: 256,
  viewportDimension: 16384,
} as const;

function bounded(value: unknown, limit: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.slice(0, limit).replace(/[\u0000-\u001f\u007f]/g, '').trim() || undefined;
}

// Explicit allowlist only. No body, cookies, authorisation or IP fields are accepted.
// Viewport is supplied separately by the browser, never inferred from headers.
export function createRequestSnapshot(input: {
  method: string;
  headers?: Pick<Headers, 'get'>;
  viewport?: unknown;
  referrerHostname?: unknown;
}): RequestSnapshot {
  const snapshot: RequestSnapshot = {
    schemaVersion: 1,
    method: bounded(input.method, SNAPSHOT_LIMITS.method)?.toUpperCase() ?? 'UNKNOWN',
    headers: {},
  };
  const userAgent = bounded(input.headers?.get('user-agent'), SNAPSHOT_LIMITS.userAgent);
  if (userAgent) snapshot.userAgent = userAgent;
  const language = bounded(input.headers?.get('accept-language'), SNAPSHOT_LIMITS.acceptLanguage);
  if (language) snapshot.headers['accept-language'] = language;

  const browserHostname = input.referrerHostname;
  const referrer = typeof browserHostname === 'string' && browserHostname.length <= SNAPSHOT_LIMITS.referrerHostname &&
    /^[a-z0-9.-]+$/i.test(browserHostname) ? `https://${browserHostname}/` : input.headers?.get('referer');
  if (referrer && referrer.length <= 4096) {
    try {
      const url = new URL(referrer);
      // Exclude IP literals and URLs outside HTTP(S); only retain a bounded DNS hostname.
      if (['http:', 'https:'].includes(url.protocol) && url.hostname.length <= SNAPSHOT_LIMITS.referrerHostname &&
        !/^[\d.]+$/.test(url.hostname) && !url.hostname.includes(':') && url.hostname !== 'localhost') {
        snapshot.referrerHostname = url.hostname;
      }
    } catch { /* Missing or malformed optional metadata does not prevent a snapshot. */ }
  }
  const v = input.viewport;
  const dimension = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n > 0 && n <= SNAPSHOT_LIMITS.viewportDimension;
  if (v && typeof v === 'object' && 'width' in v && 'height' in v && dimension(v.width) && dimension(v.height)) {
    snapshot.viewport = { width: v.width, height: v.height };
  }
  return snapshot;
}
