import { createTursoConnection } from '../../server/turso.mjs';
import { captureMode } from '../../server/capture-mode.mjs';
import { CaptureError, validateCaptureRequest, recordPageVisit } from '../../server/capture-page-visit';

export default async (request: Request) => {
  const headers = { 'Cache-Control': 'no-store', 'Netlify-CDN-Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', ...(request.method !== 'POST' ? {Allow: 'POST'} : {}) };
  let db;
  try {
    const mode = captureMode();
    if (!mode.enabled) {
      return Response.json({error: 'Capture disabled'}, {status: 403, headers});
    }
    const {path, snapshot} = await validateCaptureRequest(request);
    if (mode.testBatch) snapshot.testBatch = mode.testBatch;
    db = createTursoConnection();
    await recordPageVisit(db, path, snapshot);
    return new Response(null, {status: 204, headers});
  } catch (error) {
    const status = error instanceof CaptureError ? error.status : 503;
    return Response.json({error: error instanceof CaptureError ? error.message : 'Capture unavailable'}, {status, headers});
  } finally { db?.close(); }
};
