import { normalizePagePath } from '../lib/page-path';

const cooldown = 30000;
const memory = new Map<string, number>();
let lastPath: string | undefined;
let previousPage = document.referrer;

function capturePageVisit() {
  if (document.body.dataset.captureEnabled !== 'true') return;
  const path = normalizePagePath(location.pathname);
  if (!path || path === lastPath) return; // Includes query/fragment-only navigations.
  lastPath = path;
  const referrer = previousPage;
  previousPage = location.href;
  const now = Date.now();
  const key = `hitcounter:page:${path}`;
  let last = memory.get(path) ?? 0;
  try { last = Math.max(last, Number(sessionStorage.getItem(key)) || 0); } catch { /* In-memory fallback. */ }
  if (last > 0 && now - last < cooldown) return;
  // Record the attempt before sending: no retries, including after a failed POST.
  memory.set(path, now);
  try { sessionStorage.setItem(key, String(now)); } catch { /* Storage may be disabled. */ }
  let referrerHostname: string | undefined;
  try { referrerHostname = new URL(referrer).hostname; } catch { /* Optional. */ }
  void fetch('/.netlify/functions/capture-page-visit', {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({path, viewport: {width: innerWidth, height: innerHeight}, referrerHostname}),
    keepalive: true,
  }).catch(() => { /* Best effort; never block navigation or retry. */ });
}

// The shared layout uses ClientRouter: page-load fires for the initial document
// and completed Astro navigations. Bundled modules run once, so one listener suffices.
document.addEventListener('astro:page-load', capturePageVisit);
