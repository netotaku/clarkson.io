// Server-only: keep this outside src and never import it from a browser script.
// Client choice: https://docs.turso.tech/sdk/ts/quickstart (remote libSQL).
import { env } from 'node:process';
import { createClient } from '@libsql/client';

// Astro supplies its private build environment; manual scripts use Node's environment.
export function createTursoConnection(environment = env) {
  const url = environment.TURSO_DATABASE_URL?.trim();
  const authToken = environment.TURSO_AUTH_TOKEN?.trim();
  if (!url || !authToken) {
    throw new Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the server environment.');
  }

  let parsed;
  try { parsed = new URL(url); } catch {
    throw new Error('TURSO_DATABASE_URL must be a valid remote database URL.');
  }
  if (!['libsql:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) {
    throw new Error('TURSO_DATABASE_URL must use libsql:// or https:// without embedded credentials.');
  }

  return createClient({
    url,
    authToken,
    // Bound each request, including cleanup, without logging request details.
    fetch: (input, init) => fetch(input, {
      ...init,
      signal: init?.signal
        ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)])
        : AbortSignal.timeout(15000),
    }),
  });
}
