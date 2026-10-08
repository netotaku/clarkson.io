import { LOCAL_TEST_BATCH } from './capture-mode.mjs';

// The write lock keeps the counted rows and subtracted contributions consistent
// with concurrent captures. Never rebuild aggregates from the whole request log.
export async function removeLocalCapture(tx) {
  const predicate = "json_extract(request_json, '$.testBatch') = ?";
  const monthly = (await tx.execute({
    sql: `SELECT substr(created_at, 1, 7) AS month, COUNT(*) AS count
      FROM page_views WHERE ${predicate} GROUP BY substr(created_at, 1, 7) ORDER BY month`,
    args: [LOCAL_TEST_BATCH],
  })).rows.map(row => ({ month: String(row.month), count: Number(row.count) }));
  const count = monthly.reduce((sum, row) => sum + row.count, 0);
  if (count) {
    const site = await tx.execute({
      sql: 'UPDATE totals SET captured_hits = captured_hits - ? WHERE id = ? AND captured_hits >= ?',
      args: [count, 1, count],
    });
    if (site.rowsAffected !== 1) throw new Error('Inconsistent captured totals');
    for (const row of monthly) {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(row.month)) throw new Error('Invalid test visit month');
      const result = await tx.execute({
        sql: 'UPDATE monthly_totals SET captured_hits = captured_hits - ? WHERE month = ? AND captured_hits >= ?',
        args: [row.count, row.month, row.count],
      });
      if (result.rowsAffected !== 1) throw new Error('Inconsistent captured monthly totals');
    }
    const deleted = await tx.execute({sql: `DELETE FROM page_views WHERE ${predicate}`, args: [LOCAL_TEST_BATCH]});
    if (deleted.rowsAffected !== count) throw new Error('Test row count changed');
  }
  return { count, monthly };
}

export async function cleanupLocalCapture(db) {
  const tx = await db.transaction('write');
  try {
    const result = await removeLocalCapture(tx);
    await tx.commit();
    return result;
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally { tx.close(); }
}
