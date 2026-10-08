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
  const tx = await db.transaction('read');
  try {
    const [site, history, receiptTable] = await tx.batch([
      { sql: "SELECT legacy_hits, captured_hits, strftime('%Y-%m-%dT%H:%M:%fZ', 'now') AS as_of FROM totals WHERE id = ?", args: [1] },
      'SELECT month, legacy_hits, captured_hits FROM monthly_totals ORDER BY month',
      {sql: "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?", args: ['counter_dev_20261008_import']},
    ]);
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
    // This one-off import has no monthly pageview breakdown. Its confirmed source
    // period remains unknown even where captured-only monthly rows also exist.
    let unknownFrom: string | undefined;
    let unknownThrough: string | undefined;
    if (receiptTable.rows.length) {
      const receipt = (await tx.execute('SELECT source_period_json, plan_json FROM counter_dev_20261008_import WHERE id = 1')).rows[0];
      if (receipt) {
        const period = JSON.parse(String(receipt.source_period_json));
        const plan = JSON.parse(String(receipt.plan_json));
        if (plan.basis === 'illustrative-baseline') {
          unknownFrom = '0000-01';
          unknownThrough = new Date(plan.liveCaptureFromUTC).toISOString().slice(0, 7);
        } else {
          unknownFrom = new Date(period.fromInclusiveUTC).toISOString().slice(0, 7);
          unknownThrough = new Date(Date.parse(period.cutoffExclusiveUTC) - 1).toISOString().slice(0, 7);
        }
      }
    }
    const monthly = monthWindow(now).map(({ month }) => ({ month,
      count: unknownFrom && unknownThrough && month >= unknownFrom && month <= unknownThrough ? null : known.get(month) ?? null,
    }));
    await tx.commit();
    return { totalHits, legacyHits, capturedHits, monthly, asOf };
  } catch (error) { await tx.rollback(); throw error; }
  finally { tx.close(); }
}
