import assert from 'node:assert/strict';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { createTursoConnection } from '../server/turso.mjs';

export const SEED_BATCH = 'hitcounter-demo-v1';
const BATCH_JSON_PATH = '$.seedBatch';
const batchPredicate = 'CASE WHEN json_valid(request_json) THEN json_extract(request_json, ?) END = ?';
const fixtures = [
  { path: '/', counts: [0, 2, 0, 4, 0, 8, 2, 0, 12, 0, 6, 10] },
  { path: '/blog/build-something', counts: [1, 0, 0, 3, 0, 6, 0, 1, 9, 0, 4, 8] },
  { path: '/cv', counts: [0, 1, 0, 2, 0, 4, 0, 0, 6, 0, 3, 8] },
];

// Fixed counts/times relative to the current UTC calendar month. Repeats in the
// same month produce identical visits; later months move the 12-month window.
export function demoVisits(now = new Date()) {
  const months = Array.from({ length: 12 }, (_, index) =>
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + index, 1)).toISOString().slice(0, 7));
  const visits = fixtures.flatMap(({ path, counts }) => counts.flatMap((count, monthIndex) =>
    Array.from({ length: count }, (_, visitIndex) => ({
      path,
      // Same millisecond-precision UTC ISO format as the schema's default.
      createdAt: `${months[monthIndex]}-01T00:00:00.000Z`,
      requestJson: JSON.stringify({
        schemaVersion: 1, seedBatch: SEED_BATCH, method: 'GET', headers: {},
        viewport: visitIndex % 2 ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      }),
    }))));
  return { months, visits };
}

const legacyCounts = [0, 3, 0, 7, 0, 12, 2, 0, 18, 0, 9, 14];
const ambiguous = 'Existing aggregates and unowned demo logs make seeding ambiguous; no changes committed. Review their provenance before seeding.';
const corrupt = 'Demo ownership does not match the logs or aggregate counts; no changes committed. Review the stored demo contribution.';
const sum = (rows, key) => rows.reduce((n, r) => n + Number(r[key]), 0);

async function removeDemo(tx) {
  const owned = (await tx.execute({sql: 'SELECT * FROM hitcounter_demo_contributions WHERE seed_batch = ?', args: [SEED_BATCH]})).rows;
  const logs = (await tx.execute({
    sql: `SELECT substr(created_at, 1, 7) AS month, count(*) AS captured_hits FROM page_views WHERE ${batchPredicate} GROUP BY month`,
    args: [BATCH_JSON_PATH, SEED_BATCH],
  })).rows;
  if (!owned.length && logs.length) {
    const positive = await tx.execute('SELECT 1 FROM totals WHERE legacy_hits > 0 OR captured_hits > 0 UNION ALL SELECT 1 FROM monthly_totals WHERE legacy_hits > 0 OR captured_hits > 0 LIMIT 1');
    if (positive.rows.length) throw new Error(ambiguous);
  }
  if (owned.length) {
    const byMonth = new Map(owned.map(r => [r.month, Number(r.captured_hits)]));
    if (sum(owned, 'captured_hits') !== sum(logs, 'captured_hits') || logs.some(r => byMonth.get(r.month) !== Number(r.captured_hits))) throw new Error(corrupt);
    const updates = await tx.batch([
      {sql: 'UPDATE totals SET legacy_hits = legacy_hits - ?, captured_hits = captured_hits - ? WHERE id = ? AND legacy_hits >= ? AND captured_hits >= ?',
        args: [sum(owned, 'legacy_hits'), sum(owned, 'captured_hits'), 1, sum(owned, 'legacy_hits'), sum(owned, 'captured_hits')]},
      ...owned.map(r => ({sql: 'UPDATE monthly_totals SET legacy_hits = legacy_hits - ?, captured_hits = captured_hits - ? WHERE month = ? AND legacy_hits >= ? AND captured_hits >= ?',
        args: [r.legacy_hits, r.captured_hits, r.month, r.legacy_hits, r.captured_hits]})),
    ]);
    if (updates.some(r => r.rowsAffected !== 1)) throw new Error(corrupt);
    await tx.execute({sql: 'DELETE FROM hitcounter_demo_contributions WHERE seed_batch = ?', args: [SEED_BATCH]});
    // Remove only demo-created month rows that still have no real contribution.
    await tx.batch(owned.filter(r => r.owns_month === 1).map(r => ({
      sql: 'DELETE FROM monthly_totals WHERE month = ? AND legacy_hits = ? AND captured_hits = ? AND NOT EXISTS (SELECT 1 FROM hitcounter_demo_contributions WHERE month = ?)',
      args: [r.month, 0, 0, r.month],
    })));
  }
  return (await tx.execute({sql: `DELETE FROM page_views WHERE ${batchPredicate}`, args: [BATCH_JSON_PATH, SEED_BATCH]})).rowsAffected;
}

export async function seedPageViews(db, cleanup = false, now = new Date()) {
  const { months, visits } = demoVisits(now);
  const tx = await db.transaction('write');
  try {
    const countOtherRows = async () => (await tx.execute({
      sql: `SELECT count(*) AS total FROM page_views WHERE NOT COALESCE((${batchPredicate}), 0)`, args: [BATCH_JSON_PATH, SEED_BATCH],
    })).rows[0].total;
    const otherRowsBefore = await countOtherRows();
    const removed = Number(await removeDemo(tx));
    // These are the real/base contributions after subtracting the old demo.
    const baseTotal = (await tx.execute({sql: 'SELECT * FROM totals WHERE id = ?', args: [1]})).rows[0];
    assert.ok(baseTotal, 'Run db:setup first.');
    const baseMonths = new Map((await tx.execute('SELECT * FROM monthly_totals ORDER BY month')).rows.map(r => [r.month, r]));
    const captured = months.map(month => visits.filter(v => v.createdAt.startsWith(month)).length);
    const legacy = legacyCounts.reduce((a, b) => a + b, 0);
    if (!cleanup) {
      await tx.batch([
        ...visits.map(v => ({sql: 'INSERT INTO page_views (path, created_at, request_json) VALUES (?, ?, ?)', args: [v.path, v.createdAt, v.requestJson]})),
        {sql: 'UPDATE totals SET legacy_hits = legacy_hits + ?, captured_hits = captured_hits + ? WHERE id = ?', args: [legacy, visits.length, 1]},
        ...months.flatMap((month, i) => [
          {sql: 'INSERT INTO monthly_totals (month, legacy_hits, captured_hits) VALUES (?, ?, ?) ON CONFLICT (month) DO UPDATE SET legacy_hits = monthly_totals.legacy_hits + excluded.legacy_hits, captured_hits = monthly_totals.captured_hits + excluded.captured_hits',
            args: [month, legacyCounts[i], captured[i]]},
          {sql: 'INSERT INTO hitcounter_demo_contributions (seed_batch, month, legacy_hits, captured_hits, owns_month) VALUES (?, ?, ?, ?, ?)',
            args: [SEED_BATCH, month, legacyCounts[i], captured[i], baseMonths.has(month) ? 0 : 1]},
        ]),
      ]);
    }
    const actual = await tx.execute({
      sql: `SELECT path, substr(created_at, 1, 7) AS month, count(*) AS total FROM page_views WHERE ${batchPredicate} GROUP BY path, month ORDER BY month, path`,
      args: [BATCH_JSON_PATH, SEED_BATCH],
    });
    const counts = new Map(actual.rows.map(r => [`${r.path}:${r.month}`, Number(r.total)]));
    assert.equal(sum(actual.rows, 'total'), cleanup ? 0 : 100);
    if (!cleanup) {
      for (const {path, counts: expected} of fixtures) months.forEach((month, i) => assert.equal(counts.get(`${path}:${month}`) ?? 0, expected[i]));
    }
    const owned = (await tx.execute({sql: 'SELECT * FROM hitcounter_demo_contributions WHERE seed_batch = ? ORDER BY month', args: [SEED_BATCH]})).rows;
    assert.equal(owned.length, cleanup ? 0 : 12);
    assert.equal(sum(owned, 'captured_hits'), cleanup ? 0 : visits.length);
    assert.equal(sum(owned, 'legacy_hits'), cleanup ? 0 : legacy);
    const site = (await tx.execute({sql: 'SELECT * FROM totals WHERE id = ?', args: [1]})).rows[0];
    assert.equal(Number(site.legacy_hits), Number(baseTotal.legacy_hits) + (cleanup ? 0 : legacy));
    assert.equal(Number(site.captured_hits), Number(baseTotal.captured_hits) + (cleanup ? 0 : visits.length));
    const actualMonths = (await tx.execute('SELECT * FROM monthly_totals ORDER BY month')).rows;
    assert.equal(actualMonths.length, new Set([...baseMonths.keys(), ...(cleanup ? [] : months)]).size);
    for (const row of actualMonths) {
      const i = months.indexOf(row.month), base = baseMonths.get(row.month);
      assert.equal(Number(row.legacy_hits), Number(base?.legacy_hits ?? 0) + (!cleanup && i >= 0 ? legacyCounts[i] : 0));
      assert.equal(Number(row.captured_hits), Number(base?.captured_hits ?? 0) + (!cleanup && i >= 0 ? captured[i] : 0));
    }
    if (!cleanup) owned.forEach((r, i) => {assert.equal(Number(r.captured_hits), captured[i]); assert.equal(Number(r.legacy_hits), legacyCounts[i]);});
    assert.equal(await countOtherRows(), otherRowsBefore);
    await tx.commit();
    return {months, counts, removed, otherRows: Number(otherRowsBefore), legacy: cleanup ? 0 : legacy, captured: cleanup ? 0 : visits.length,
      monthly: months.map((month, i) => ({month, legacy_hits: cleanup ? 0 : legacyCounts[i], captured_hits: cleanup ? 0 : captured[i]}))};
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {tx.close();}
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(process.argv[1], 'file://'))) {
  let db;
  try {
    if (process.argv.slice(2).some((arg) => arg !== '--cleanup')) throw new Error('Unknown argument');
    loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
    db = createTursoConnection();
    const cleanup = process.argv.includes('--cleanup');
    const result = await seedPageViews(db, cleanup);
    if (cleanup) console.log(`Deleted ${result.removed} ${SEED_BATCH} rows; verified none remain. Other rows untouched: ${result.otherRows}.`);
    else {
      console.log(`Seeded and verified 100 ${SEED_BATCH} visits in UTC; replaced ${result.removed} old batch rows. Other rows untouched: ${result.otherRows}.`);
      console.log(`Demo aggregates: ${result.legacy} legacy + ${result.captured} captured = ${result.legacy + result.captured} all-time hits. Real aggregate contributions preserved.`);
      console.table(result.monthly);
      console.table(fixtures.map(({ path, counts }) => ({ path, total: counts.reduce((a, b) => a + b, 0) })));
      console.table(result.months.map((month) => ({ month, ...Object.fromEntries(fixtures.map(({ path }) => [path, result.counts.get(`${path}:${month}`) ?? 0])) })));
    }
  } catch (error) {
    process.exitCode = 1;
    if ([ambiguous, corrupt].includes(error?.message)) console.error(error.message);
    else console.error('Demo seed/cleanup failed. Check .env, connectivity, database write permissions and the page_views schema. Uncommitted changes are rolled back; rerunning safely replaces only this batch.');
  } finally { db?.close(); }
}
