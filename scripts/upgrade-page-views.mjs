import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createTursoConnection } from '../server/turso.mjs';
import { ensurePageViewsSchema } from '../server/page-views-schema.mjs';

let db;
let cleanupNeeded = false;
let stage = 'loading the local environment';
const path = `/__schema_check__/${randomUUID()}`;
const snapshot = { schemaVersion: 1, method: 'GET', headers: { 'accept-language': 'en-GB' }, viewport: { width: 390, height: 844 } };
const json = JSON.stringify(snapshot);

try {
  loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
  db = createTursoConnection();
  stage = 'upgrading page_views';
  const result = await ensurePageViewsSchema(db);
  // Repeat immediately to verify that the upgrade is safe to rerun.
  if (await ensurePageViewsSchema(db) !== 'unchanged') throw new Error('Idempotence check failed');
  console.log('Site totals (id=1), monthly totals and demo ownership ledger ready; setup safely repeated.');
  stage = 'verifying request_json';
  const columns = await db.execute('PRAGMA table_info(page_views)');
  const column = columns.rows.find((row) => row.name === 'request_json');
  if (!column || column.type.toUpperCase() !== 'TEXT' || !column.notnull || column.dflt_value !== "'{}'") throw new Error('Column check failed');

  stage = 'inserting and reading temporary JSON';
  cleanupNeeded = true; // Also clean up if the server inserts but the response is lost.
  await db.execute({ sql: 'INSERT INTO page_views (path, request_json) VALUES (?, ?)', args: [path, json] });
  const read = await db.execute({ sql: 'SELECT id, path, created_at, request_json, json_valid(request_json) AS valid FROM page_views WHERE path = ?', args: [path] });
  if (read.rows.length !== 1 || read.rows[0].path !== path || read.rows[0].id == null || !read.rows[0].created_at ||
    read.rows[0].valid !== 1 || JSON.stringify(JSON.parse(read.rows[0].request_json)) !== json) throw new Error('JSON readback check failed');
  console.log(`page_views schema ${result}; repeat upgrade unchanged; TEXT JSON column and temporary-row readback verified.`);
} catch {
  process.exitCode = 1;
  // Never print SDK errors/stacks: these can contain connection details or credentials.
  console.error(`page_views upgrade/check failed while ${stage}. Check connectivity, database permissions and the existing schema.`);
} finally {
  if (db && cleanupNeeded) {
    try {
      await db.execute({ sql: 'DELETE FROM page_views WHERE path = ?', args: [path] });
      const remaining = await db.execute({ sql: 'SELECT id FROM page_views WHERE path = ?', args: [path] });
      if (remaining.rows.length) throw new Error('Cleanup check failed');
      console.log('Temporary verification row deleted and confirmed absent.');
    } catch {
      process.exitCode = 1;
      console.error(`Temporary-row cleanup failed; retry cleanup for path ${path}. Credentials were not logged.`);
    }
  }
  db?.close();
}
