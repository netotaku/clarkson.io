// Shared by capture validation and the browser; never includes query or fragment.
export function normalizePagePath(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 1024 || !value.startsWith('/') ||
      value.startsWith('//') || /[?#\\\u0000-\u0020\u007f]/.test(value)) return;
  try {
    const segments = value.split('/').filter(Boolean).map(segment => decodeURIComponent(segment));
    if (segments.some(segment => segment.startsWith('.') || /[/\\?#\u0000-\u0020\u007f]/.test(segment))) return;
    // Static assets and internal routes are not page visits.
    if (segments[0] === '_astro' || segments[0] === 'api' || /\.[a-z0-9]+$/i.test(segments.at(-1) ?? '')) return;
    const path = '/' + segments.map(segment => encodeURIComponent(segment)).join('/');
    return path.length <= 1024 ? path : undefined;
  } catch { return; }
}
