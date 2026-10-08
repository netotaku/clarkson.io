// Ownership-based cleanup retained for the applied historical migration.
export const SEED_BATCH = 'hitcounter-demo-v1';
const BATCH_JSON_PATH = '$.seedBatch';
const batchPredicate = 'CASE WHEN json_valid(request_json) THEN json_extract(request_json, ?) END = ?';
const ambiguous = 'Existing aggregates and unowned demo logs make seeding ambiguous; no changes committed. Review their provenance before seeding.';
const corrupt = 'Demo ownership does not match the logs or aggregate counts; no changes committed. Review the stored demo contribution.';
const sum = (rows, key) => rows.reduce((n, r) => n + Number(r[key]), 0);

export async function removeDemo(tx) {
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

