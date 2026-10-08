import type { HitCounterData } from '../types/hit-counter';
import { illustrativeSparklinePath, illustrativeDescription } from './hit-counter-sparkline';

export type HitCounterElement = HTMLElement & { hitCounterData?: HitCounterData };
const pending = new Map<HitCounterElement, AbortController>();
const format = new Intl.NumberFormat('en-GB');

function validData(value: unknown): value is HitCounterData {
  if (!value || typeof value !== 'object') return false;
  const data = value as HitCounterData;
  const count = (n: unknown) => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;
  return count(data.totalHits) && count(data.legacyHits) && count(data.capturedHits) &&
    data.totalHits === data.legacyHits + data.capturedHits && typeof data.asOf === 'string' && Number.isFinite(Date.parse(data.asOf)) &&
    Array.isArray(data.monthly) && data.monthly.every((m, i, months) =>
      m && typeof m.month === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(m.month) &&
      (m.count === null || count(m.count)) && (!i || months[i - 1].month < m.month));
}

async function loadCounter(element: HitCounterElement) {
  if (element.dataset.hitCounterInitialized === 'true') return;
  element.dataset.hitCounterInitialized = 'true';
  const total = element.querySelector<HTMLElement>('[data-hit-counter-total]');
  if (!total) return;
  const controller = new AbortController();
  pending.set(element, controller);
  const timeout = window.setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch('/.netlify/functions/hit-counter', { signal: controller.signal, credentials: 'omit' });
    if (!response.ok) throw new Error('Unavailable');
    const data: unknown = await response.json();
    if (!validData(data)) throw new Error('Invalid aggregate response');
    if (!element.isConnected || controller.signal.aborted) return;
    // Keep the full response on this component instance for the future graph.
    element.hitCounterData = data;
    const sparkline = element.querySelector<SVGSVGElement>('[data-hit-counter-sparkline]');
    if (sparkline) {
      sparkline.querySelector('path')?.setAttribute('d', illustrativeSparklinePath(data.totalHits));
      const description = sparkline.querySelector('desc');
      if (description) description.textContent = illustrativeDescription;
      sparkline.dataset.loaded = 'true';
    }
    total.textContent = format.format(data.totalHits);
    total.setAttribute('aria-label', `${format.format(data.totalHits)} all-time site views`);
    element.dataset.hitCounterState = 'ready';
  } catch {
    if (!element.isConnected) return;
    total.textContent = '—';
    total.setAttribute('aria-label', 'Site views unavailable');
    element.dataset.hitCounterState = 'error';
  } finally {
    window.clearTimeout(timeout);
    pending.delete(element);
    element.setAttribute('aria-busy', 'false');
  }
}

export function initializeHitCounters() {
  document.querySelectorAll<HitCounterElement>('[data-hit-counter]').forEach(element => void loadCounter(element));
}

// Astro bundles this module once. The initial call also supports first arriving
// through navigation, when its script may load after page-load.
initializeHitCounters();
document.addEventListener('astro:page-load', initializeHitCounters);
document.addEventListener('astro:before-swap', () => {
  pending.forEach(controller => controller.abort());
  pending.clear();
});
