import type { Client } from '@libsql/client';
import { createRequestSnapshot } from './request-snapshot.ts';
import type { RequestSnapshot } from './request-snapshot.ts';
import { normalizePagePath } from '../src/lib/page-path.ts';

export class CaptureError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export async function validateCaptureRequest(request: Request) {
  if (request.method !== 'POST') throw new CaptureError(405, 'POST required');
  if (request.headers.get('origin') !== new URL(request.url).origin ||
      !['same-origin', null].includes(request.headers.get('sec-fetch-site'))) {
    throw new CaptureError(403, 'Same-origin request required');
  }
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new CaptureError(415, 'JSON required');
  }
  const limit = 2048;
  if (Number(request.headers.get('content-length')) > limit) throw new CaptureError(413, 'Payload too large');
  // Count actual bytes too: Content-Length may be missing or untrusted.
  const reader = request.body?.getReader();
  if (!reader) throw new CaptureError(400, 'Missing payload');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new CaptureError(413, 'Payload too large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  let payload;
  try {
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    payload = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes));
  } catch { throw new CaptureError(400, 'Invalid JSON'); }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) ||
      Object.keys(payload).some(key => !['path', 'viewport', 'referrerHostname'].includes(key))) {
    throw new CaptureError(400, 'Invalid payload');
  }
  const path = normalizePagePath(payload.path);
  if (!path) throw new CaptureError(400, 'Invalid page path');
  return {path, snapshot: createRequestSnapshot({method: request.method, headers: request.headers,
    viewport: payload.viewport, referrerHostname: payload.referrerHostname})};
}

export async function recordPageVisit(db: Client, path: string, snapshot: RequestSnapshot, now = new Date()) {
  const createdAt = now.toISOString();
  const month = createdAt.slice(0, 7);
  const tx = await db.transaction('write');
  try {
    const inserted = await tx.execute({sql: 'INSERT INTO page_views (path, created_at, request_json) VALUES (?, ?, ?)',
      args: [path, createdAt, JSON.stringify(snapshot)]});
    const updated = await tx.execute({sql: 'UPDATE totals SET captured_hits = captured_hits + 1 WHERE id = ?', args: [1]});
    if (updated.rowsAffected !== 1) throw new Error('Site totals row missing');
    await tx.execute({sql: `INSERT INTO monthly_totals (month, captured_hits) VALUES (?, ?)
      ON CONFLICT (month) DO UPDATE SET captured_hits = monthly_totals.captured_hits + excluded.captured_hits`, args: [month, 1]});
    await tx.commit();
    return {id: inserted.lastInsertRowid, month};
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally { tx.close(); }
}
