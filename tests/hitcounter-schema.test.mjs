import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { ensurePageViewsSchema } from '../server/page-views-schema.mjs';
import { demoVisits, seedPageViews } from '../scripts/seed-page-views.mjs';

const now = new Date('2026-10-07T12:00:00Z');
async function database() {
  const db = createClient({url: ':memory:'});
  await ensurePageViewsSchema(db);
  return db;
}
async function snapshot(db) {
  return Promise.all(['page_views', 'totals', 'monthly_totals', 'hitcounter_demo_contributions'].map(async table =>
    (await db.execute(`SELECT * FROM ${table} ORDER BY 1, 2`)).rows));
}

test('fresh schema and setup are rerunnable; aggregate constraints enforce integers and UTC months', async () => {
  const db = await database();
  try {
    const before = await snapshot(db);
    await ensurePageViewsSchema(db);
    assert.deepEqual(await snapshot(db), before);
    for (const sql of [
      'UPDATE totals SET captured_hits = -1', 'UPDATE totals SET legacy_hits = 1.5',
      'INSERT INTO totals (id) VALUES (2)', "INSERT INTO monthly_totals (month) VALUES ('2026-13')",
      "INSERT INTO monthly_totals (month, legacy_hits) VALUES ('2026-10', -1)",
    ]) await assert.rejects(db.execute(sql));
  } finally { db.close(); }
});

test('adopts the old log-only demo, replaces it once, and leaves a consistent 65+100 dataset', async () => {
  const db = await database();
  try {
    await db.batch(demoVisits(now).visits.map(v => ({sql: 'INSERT INTO page_views (path, created_at, request_json) VALUES (?, ?, ?)', args: [v.path, v.createdAt, v.requestJson]})), 'write');
    const seeded = await seedPageViews(db, false, now);
    assert.equal(seeded.removed, 100);
    assert.equal(seeded.legacy, 65); assert.equal(seeded.captured, 100);
    const first = await snapshot(db);
    await ensurePageViewsSchema(db);
    assert.deepEqual(await snapshot(db), first);
    await seedPageViews(db, false, now);
    assert.deepEqual(await snapshot(db), first);
    await seedPageViews(db, true, now);
    assert.equal((await db.execute('SELECT * FROM monthly_totals')).rows.length, 0);
    assert.equal((await db.execute('SELECT * FROM page_views')).rows.length, 0);
    assert.deepEqual({...((await db.execute('SELECT * FROM totals')).rows[0])}, {id: 1, legacy_hits: 0, captured_hits: 0});
    await seedPageViews(db, true, now);
  } finally {db.close();}
});

test('seeding/cleanup preserve real rows and aggregates, including real increments after seeding', async () => {
  const db = await database();
  try {
    await db.batch([
      {sql: 'INSERT INTO page_views (path, created_at, request_json) VALUES (?, ?, ?)', args: ['/real', '2026-10-05T00:00:00.000Z', '{}']},
      {sql: 'UPDATE totals SET legacy_hits = ?, captured_hits = ? WHERE id = ?', args: [43, 7, 1]},
      {sql: 'INSERT INTO monthly_totals (month, legacy_hits, captured_hits) VALUES (?, ?, ?)', args: ['2026-10', 43, 7]},
      {sql: 'INSERT INTO monthly_totals (month) VALUES (?)', args: ['2026-03']},
    ], 'write');
    const realRows = (await db.execute('SELECT * FROM page_views')).rows;
    await seedPageViews(db, false, now);
    await seedPageViews(db, false, now);
    assert.deepEqual({...((await db.execute('SELECT * FROM totals')).rows[0])}, {id:1, legacy_hits:108, captured_hits:107});
    // A real increment to a demo-created month must survive cleanup too.
    await db.batch([
      {sql: 'UPDATE totals SET captured_hits = captured_hits + ? WHERE id = ?', args:[1, 1]},
      {sql: 'UPDATE monthly_totals SET captured_hits = captured_hits + ? WHERE month = ?', args:[1, '2026-07']},
    ], 'write');
    await seedPageViews(db, true, now);
    assert.deepEqual((await db.execute('SELECT * FROM page_views')).rows, realRows);
    assert.deepEqual({...((await db.execute('SELECT * FROM totals')).rows[0])}, {id:1, legacy_hits:43, captured_hits:8});
    assert.deepEqual((await db.execute('SELECT * FROM monthly_totals ORDER BY month')).rows.map(r=>({...r})), [
      {month:'2026-03',legacy_hits:0,captured_hits:0}, {month:'2026-07',legacy_hits:0,captured_hits:1}, {month:'2026-10',legacy_hits:43,captured_hits:7},
    ]);
    const clean = await snapshot(db);
    await seedPageViews(db, true, now);
    assert.deepEqual(await snapshot(db), clean);
  } finally {db.close();}
});

test('ambiguous aggregates with unowned demo logs cause a full rollback', async () => {
  const db = await database();
  try {
    await db.execute({sql:'INSERT INTO page_views (path, request_json) VALUES (?, ?)', args:['/', JSON.stringify({schemaVersion:1,seedBatch:'hitcounter-demo-v1'})]});
    await db.execute('UPDATE totals SET captured_hits = 1');
    const before = await snapshot(db);
    await assert.rejects(seedPageViews(db, false, now), /ambiguous/);
    await assert.rejects(seedPageViews(db, true, now), /ambiguous/);
    assert.deepEqual(await snapshot(db), before);
  } finally {db.close();}
});
