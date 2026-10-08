// Fresh database schema. Existing databases are upgraded in place below.
export const PAGE_VIEWS_TABLE_SQL = `CREATE TABLE page_views (
  id INTEGER PRIMARY KEY,
  path TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  request_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(request_json))
)`;
export const PAGE_VIEWS_INDEX_SQL =
  'CREATE INDEX IF NOT EXISTS idx_page_views_path_created_at ON page_views (path, created_at)';

export const TOTALS_SQL = `CREATE TABLE IF NOT EXISTS totals (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  legacy_hits INTEGER NOT NULL DEFAULT 0 CHECK (typeof(legacy_hits) = 'integer' AND legacy_hits >= 0),
  captured_hits INTEGER NOT NULL DEFAULT 0 CHECK (typeof(captured_hits) = 'integer' AND captured_hits >= 0)
)`;
export const MONTHLY_TOTALS_SQL = `CREATE TABLE IF NOT EXISTS monthly_totals (
  month TEXT PRIMARY KEY NOT NULL CHECK (month GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]' AND substr(month, 6, 2) BETWEEN '01' AND '12'),
  legacy_hits INTEGER NOT NULL DEFAULT 0 CHECK (typeof(legacy_hits) = 'integer' AND legacy_hits >= 0),
  captured_hits INTEGER NOT NULL DEFAULT 0 CHECK (typeof(captured_hits) = 'integer' AND captured_hits >= 0)
)`;
// Ownership ledger only; badge values come from totals/monthly_totals, never this table.
export const DEMO_CONTRIBUTIONS_SQL = `CREATE TABLE IF NOT EXISTS hitcounter_demo_contributions (
  seed_batch TEXT NOT NULL,
  month TEXT NOT NULL REFERENCES monthly_totals(month),
  legacy_hits INTEGER NOT NULL CHECK (typeof(legacy_hits) = 'integer' AND legacy_hits >= 0),
  captured_hits INTEGER NOT NULL CHECK (typeof(captured_hits) = 'integer' AND captured_hits >= 0),
  owns_month INTEGER NOT NULL CHECK (owns_month IN (0, 1)),
  PRIMARY KEY (seed_batch, month)
)`;

export async function ensurePageViewsSchema(db) {
  const tx = await db.transaction('write');
  try {
    // BEGIN IMMEDIATE serialises the existence check and ALTER for concurrent runs.
    const columns = await tx.execute('PRAGMA table_info(page_views)');
    let result = 'unchanged';
    if (!columns.rows.length) {
      await tx.execute(PAGE_VIEWS_TABLE_SQL);
      result = 'created';
    } else {
      if (!['id', 'path', 'created_at'].every((name) => columns.rows.some((row) => row.name === name))) {
        throw new Error('page_views is missing a required existing column.');
      }
      if (!columns.rows.some((row) => row.name === 'request_json')) {
        await tx.execute("ALTER TABLE page_views ADD COLUMN request_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(request_json))");
        result = 'upgraded';
      }
    }
    // Leave all existing indexes in place; avoid duplicating a differently named equivalent index.
    const indexes = await tx.execute('PRAGMA index_list(page_views)');
    let hasIndex = false;
    for (const index of indexes.rows) {
      if (index.partial) continue;
      const info = await tx.execute({ sql: 'SELECT name FROM pragma_index_info(?) ORDER BY seqno', args: [index.name] });
      if (info.rows.length === 2 && info.rows[0].name === 'path' && info.rows[1].name === 'created_at') hasIndex = true;
    }
    if (!hasIndex) await tx.execute(PAGE_VIEWS_INDEX_SQL);
    await tx.execute(TOTALS_SQL);
    await tx.execute(MONTHLY_TOTALS_SQL);
    await tx.execute(DEMO_CONTRIBUTIONS_SQL);
    const otherIdentifiers = await tx.execute({ sql: 'SELECT id FROM totals WHERE id != ?', args: [1] });
    if (otherIdentifiers.rows.length) throw new Error('Unexpected existing totals identifier; manual review required.');
    await tx.execute({ sql: 'INSERT INTO totals (id) VALUES (?) ON CONFLICT (id) DO NOTHING', args: [1] });
    await tx.commit();
    return result;
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally { tx.close(); }
}
