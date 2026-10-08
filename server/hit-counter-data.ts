import type { Client } from '@libsql/client';
import type { HitCounterData } from '../src/types/hit-counter';
export type { HitCounterData } from '../src/types/hit-counter';

function monthWindow(now: Date): HitCounterData['monthly'] {
  return Array.from({ length: 12 }, (_, i) => ({
    month: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + i, 1)).toISOString().slice(0, 7),
    count: null,
  }));
}

export async function readHitCounterData(db: Client): Promise<HitCounterData> {
  // Read both aggregates in one transaction for a consistent snapshot.
  const [site, history] = await db.batch([
    { sql: "SELECT legacy_hits, captured_hits, strftime('%Y-%m-%dT%H:%M:%fZ', 'now') AS as_of FROM totals WHERE id = ?", args: [1] },
    'SELECT month, legacy_hits, captured_hits FROM monthly_totals ORDER BY month',
  ], 'read');
  if (site.rows.length !== 1) throw new Error('Site totals are unavailable.');
  const count = (value: unknown) => {
    const n = Number(value);
    if (value === null || !Number.isSafeInteger(n) || n < 0) throw new Error('Invalid aggregate count.');
    return n;
  };
  const legacyHits = count(site.rows[0].legacy_hits);
  const capturedHits = count(site.rows[0].captured_hits);
  const totalHits = count(legacyHits + capturedHits);
  const asOf = String(site.rows[0].as_of);
  const now = new Date(asOf);
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid aggregate timestamp.');
  const known = new Map(history.rows.map(row => [String(row.month), count(count(row.legacy_hits) + count(row.captured_hits))]));
  const monthly = monthWindow(now).map(({ month }) => ({ month, count: known.get(month) ?? null }));
  return { totalHits, legacyHits, capturedHits, monthly, asOf };
}
