import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createTursoConnection } from '../server/turso.mjs';

// Explicitly load the repository's ignored .env, independently of the working directory.
// Credentials stay in the Node process; no Astro/Vite public variables are used.
const id = randomUUID();
const expected = `connection-check-${randomUUID()}`;
let db;
let cleanupNeeded = false;
let stage = 'loading .env';

// Do not print raw SDK errors, URLs, headers, causes or stacks: they may contain secrets.
function safeError(error) {
  const code = error && typeof error === 'object' ? error.code : undefined;
  const hints = {
    ENOENT: 'The repository .env file could not be found.',
    UNAUTHORIZED: 'Authentication failed. Check the Turso token and database access.',
    FORBIDDEN: 'Access denied. The token must allow table creation, reads and writes.',
    SERVER_ERROR: 'Turso returned a server error. Check service availability and database access.',
    SQLITE_AUTH: 'The token does not permit this operation.',
    SQLITE_READONLY: 'The database or token is read-only.',
    SQLITE_ERROR: 'The connection-test SQL could not be executed. Check database permissions and table schema.',
    FETCH_ERROR: 'The network request failed. Check connectivity and the database URL.',
  };
  if (typeof code === 'string' && Object.hasOwn(hints, code)) return `${code}: ${hints[code]}`;
  // Allow only our own static validation/verification errors, never arbitrary messages.
  const message = error instanceof Error ? error.message : '';
  const safeMessages = [
    'Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the server environment.',
    'TURSO_DATABASE_URL must be a valid remote database URL.',
    'TURSO_DATABASE_URL must use libsql:// or https:// without embedded credentials.',
    'The inserted test row did not match the expected value.',
    'The test row is still present after deletion.',
  ];
  return safeMessages.includes(message) ? message
    : 'Operation failed. Check connectivity, the database URL, token permissions and service availability.';
}

try {
  loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
  stage = 'creating the server connection';
  db = createTursoConnection();
  stage = 'creating the dedicated connection-test table';
  await db.execute(`CREATE TABLE IF NOT EXISTS _turso_connection_test (
    id TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  stage = 'inserting the test row';
  // Attempt cleanup even if INSERT succeeds remotely but its response is lost.
  cleanupNeeded = true;
  await db.execute({ sql: 'INSERT INTO _turso_connection_test (id, value) VALUES (?, ?)', args: [id, expected] });
  stage = 'reading and verifying the test row';
  const result = await db.execute({ sql: 'SELECT value FROM _turso_connection_test WHERE id = ?', args: [id] });
  if (result.rows.length !== 1 || result.rows[0].value !== expected) {
    throw new Error('The inserted test row did not match the expected value.');
  }
} catch (error) {
  process.exitCode = 1;
  console.error(`Turso connection check failed while ${stage}: ${safeError(error)}`);
} finally {
  if (db && cleanupNeeded) {
    try {
      await db.execute({ sql: 'DELETE FROM _turso_connection_test WHERE id = ?', args: [id] });
      const remaining = await db.execute({ sql: 'SELECT id FROM _turso_connection_test WHERE id = ?', args: [id] });
      if (remaining.rows.length) throw new Error('The test row is still present after deletion.');
    } catch (error) {
      process.exitCode = 1;
      console.error(`Turso test-row cleanup failed: ${safeError(error)} Test row ID: ${id}`);
    }
  }
  db?.close();
}

if (!process.exitCode) {
  console.log('Turso connection check passed: test table ready, unique row inserted, value verified, and row deletion verified.');
}
