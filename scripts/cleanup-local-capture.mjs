import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { createTursoConnection } from '../server/turso.mjs';
import { cleanupLocalCapture } from '../server/cleanup-local-capture.mjs';
import { LOCAL_TEST_BATCH } from '../server/capture-mode.mjs';

let db;
try {
  loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
  db = createTursoConnection();
  const result = await cleanupLocalCapture(db);
  console.log(`Removed ${result.count} ${LOCAL_TEST_BATCH} visits and their captured totals. Other visits and legacy counts unchanged.`);
  if (result.monthly.length) console.table(result.monthly);
} catch {
  process.exitCode = 1;
  console.error('Local capture cleanup failed. No cleanup changes committed. Check .env, connectivity, schema and captured totals; inconsistent totals require review.');
} finally { db?.close(); }
