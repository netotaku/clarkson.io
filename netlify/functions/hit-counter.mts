import { createTursoConnection } from '../../server/turso.mjs';
import { readHitCounterData } from '../../server/hit-counter-data';

export default async (request: Request) => {
  if (request.method !== 'GET') {
    return new Response(null, { status: 405, headers: { Allow: 'GET', 'Cache-Control': 'no-store' } });
  }
  let db;
  try {
    // Runtime environment only. No credentials or database queries in the Astro build.
    db = createTursoConnection();
    const data = await readHitCounterData(db);
    return Response.json(data, { headers: {
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Netlify-CDN-Cache-Control': 'public, s-maxage=900, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch {
    // Never expose SDK errors, connection details, or a misleading zero total.
    return Response.json({ error: 'Hit counter unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  } finally { db?.close(); }
};
