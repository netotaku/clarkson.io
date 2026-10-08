import type { HitCounterData } from '../types/hit-counter';

// Padding keeps the stroke inside the viewBox, including along the zero baseline.
export function sparklinePath(monthly: HitCounterData['monthly']): string {
  const monthIndex = (month: string) => Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1;
  const points = [...monthly].sort((a, b) => a.month.localeCompare(b.month));
  if (!points.length) return '';
  const first = monthIndex(points[0].month);
  const span = monthIndex(points[points.length - 1].month) - first;
  const maximum = Math.max(1, ...points.map(point => point.count ?? 0));
  let previous: { month: number; x: number; y: number } | undefined;
  return points.map(point => {
    const month = monthIndex(point.month);
    if (point.count === null) { previous = undefined; return ''; }
    const x = span ? 2 + (month - first) / span * 296 : 150;
    const y = 78 - point.count / maximum * 76;
    // Also leave gaps when a calendar month is absent from the response.
    let command = `M${x.toFixed(2)},${y.toFixed(2)}`;
    if (previous?.month === month - 1) {
      // Horizontal tangents gently round each month without overshooting zero
      // or the monthly peaks. Each unknown month starts a separate curve.
      const middle = ((previous.x + x) / 2).toFixed(2);
      command = `C${middle},${previous.y.toFixed(2)} ${middle},${y.toFixed(2)} ${x.toFixed(2)},${y.toFixed(2)}`;
    }
    previous = { month, x, y };
    return command;
  }).filter(Boolean).join(' ');
}

export function sparklineDescription(monthly: HitCounterData['monthly']): string {
  if (!monthly.length) return 'Monthly site views: no monthly data available.';
  const points = [...monthly].sort((a, b) => a.month.localeCompare(b.month));
  return `Monthly site views, not cumulative. Zero baseline; unknown months are gaps. ${points.map(point => `${point.month}: ${point.count === null ? 'unknown' : point.count}`).join('; ')}.`;
}
