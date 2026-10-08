import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@libsql/client';
import {ensurePageViewsSchema} from '../server/page-views-schema.mjs';
import {normalizePagePath} from '../src/lib/page-path.ts';
import {validateCaptureRequest, recordPageVisit} from '../server/capture-page-visit.ts';

function request(payload, options={}) {
 return new Request('https://clar.ky/.netlify/functions/capture-page-visit', {
  method:'POST', headers:{origin:'https://clar.ky','content-type':'application/json',...options.headers},
  body:JSON.stringify(payload), ...options,
 });
}
const snapshot={schemaVersion:1,method:'POST',headers:{}};

test('paths normalize trailing slashes and reject assets, internal routes, URLs and traversal',()=>{
 assert.equal(normalizePagePath('/blog/example/'),'/blog/example');
 assert.equal(normalizePagePath('/'),'/');
 for(const path of ['//example.com','https://example.com','/x?foo=1','/x#y','/../x','/%2e%2e/x','/x%2fy','/_astro/x','/.netlify/functions/hit-counter','/image.webp','/x\\y']) assert.equal(normalizePagePath(path),undefined,path);
});

test('validates bounded same-origin JSON and assembles only the snapshot allowlist',async()=>{
 const req=request({path:'/cv/', viewport:{width:800,height:600},referrerHostname:'example.org'});
 for(const [key,value] of Object.entries({'cookie':'private=1','authorization':'secret','x-forwarded-for':'192.0.2.1','referer':'https://example.org/private?q=secret','user-agent':'x'.repeat(600),'accept-language':'en-GB'}))req.headers.set(key,value);
 const result=await validateCaptureRequest(req);
 assert.equal(result.path,'/cv');
 assert.deepEqual(result.snapshot,{...snapshot,viewport:{width:800,height:600},referrerHostname:'example.org',userAgent:'x'.repeat(512),headers:{'accept-language':'en-GB'}});
 for(const [req,status] of [
  [new Request('https://clar.ky/',{method:'GET'}),405],
  [request({path:'/'},{headers:{origin:'https://evil.test','content-type':'application/json'}}),403],
  [request({path:'/'},{headers:{'content-type':'application/json'}}),403],
  [request({path:'/'},{headers:{origin:'https://clar.ky','content-type':'text/plain'}}),415],
  [request({path:'/',extra:'x'.repeat(3000)}),413],
  [request({path:'/asset.png'}),400],
  [request({path:'/',cookie:'no'}),400],
 ]) await assert.rejects(validateCaptureRequest(req),e=>e.status===status);
 const optional=await validateCaptureRequest(request({path:'/',viewport:{width:-1,height:50},referrerHostname:'192.0.2.1'}));
 assert.equal(optional.snapshot.viewport,undefined);assert.equal(optional.snapshot.referrerHostname,undefined);
});

test('one committed visit increments all three tables and preserves legacy counts',async()=>{
 const db=createClient({url:':memory:'});
 try {
  await ensurePageViewsSchema(db);
  await db.execute('UPDATE totals SET legacy_hits=17,captured_hits=3');
  await db.execute("INSERT INTO monthly_totals VALUES ('2026-10', 9, 2)");
  await recordPageVisit(db,'/test-capture',snapshot,new Date('2026-10-31T23:59:59.999Z'));
  assert.equal((await db.execute('SELECT captured_hits FROM totals')).rows[0].captured_hits,4);
  assert.equal((await db.execute('SELECT legacy_hits FROM totals')).rows[0].legacy_hits,17);
  assert.deepEqual({... (await db.execute('SELECT * FROM monthly_totals')).rows[0]}, {month:'2026-10',legacy_hits:9,captured_hits:3});
  const row=(await db.execute('SELECT * FROM page_views')).rows[0];
  assert.equal(row.created_at,'2026-10-31T23:59:59.999Z');assert.deepEqual(JSON.parse(row.request_json),snapshot);
  await recordPageVisit(db,'/test-capture',snapshot,new Date('2026-11-01T00:00:00.000Z'));
  assert.equal((await db.execute("SELECT captured_hits FROM monthly_totals WHERE month='2026-11'")).rows[0].captured_hits,1);
 } finally {db.close();}
});

test('late write failure and missing singleton roll back log and aggregate changes',async()=>{
 const db=createClient({url:':memory:'});
 try {
  await ensurePageViewsSchema(db);
  await db.execute("CREATE TRIGGER fail_month BEFORE INSERT ON monthly_totals BEGIN SELECT RAISE(ABORT, 'test failure'); END");
  await assert.rejects(recordPageVisit(db,'/rollback-test',snapshot));
  assert.equal((await db.execute('SELECT COUNT(*) AS n FROM page_views')).rows[0].n,0);
  assert.equal((await db.execute('SELECT captured_hits FROM totals')).rows[0].captured_hits,0);
  await db.execute('DROP TRIGGER fail_month');await db.execute('DELETE FROM totals');
  await assert.rejects(recordPageVisit(db,'/rollback-test',snapshot));
  assert.equal((await db.execute('SELECT COUNT(*) AS n FROM page_views')).rows[0].n,0);
 } finally {db.close();}
});

const {captureMode, LOCAL_TEST_BATCH} = await import('../server/capture-mode.mjs');
const {cleanupLocalCapture} = await import('../server/cleanup-local-capture.mjs');

test('local capture requires its explicit override and assigns a server-only batch',async()=>{
 assert.deepEqual(captureMode({NETLIFY_DEV:'true',HIT_COUNTER_CAPTURE_ENABLED:'true'}),{enabled:false,testBatch:undefined});
 assert.deepEqual(captureMode({NETLIFY_DEV:'true',HIT_COUNTER_LOCAL_TEST:'true'}),{enabled:true,testBatch:LOCAL_TEST_BATCH});
 assert.deepEqual(captureMode({HIT_COUNTER_LOCAL_TEST:'true'}),{enabled:false,testBatch:undefined});
 assert.deepEqual(captureMode({HIT_COUNTER_CAPTURE_ENABLED:'true'}),{enabled:true,testBatch:undefined});
 await assert.rejects(validateCaptureRequest(request({path:'/',testBatch:LOCAL_TEST_BATCH})),e=>e.status===400);
});

test('local cleanup subtracts only marked contributions by month and safely runs twice',async()=>{
 const db=createClient({url:':memory:'});
 try {
  await ensurePageViewsSchema(db);
  const {seedPageViews}=await import('./helpers/demo-page-views.mjs');
  await seedPageViews(db,false,new Date('2026-10-08T00:00:00Z'));
  await recordPageVisit(db,'/real',snapshot,new Date('2026-10-08T00:00:00Z'));
  const tables=['page_views','totals','monthly_totals','hitcounter_demo_contributions'];
  const before=await Promise.all(tables.map(async table=>(await db.execute(`SELECT * FROM ${table} ORDER BY 1`)).rows));
  const marked={...snapshot,testBatch:LOCAL_TEST_BATCH};
  await recordPageVisit(db,'/local-a',marked,new Date('2026-09-30T23:59:59Z'));
  await recordPageVisit(db,'/local-a',marked,new Date('2026-10-01T00:00:00Z'));
  await recordPageVisit(db,'/local-b',marked,new Date('2026-10-08T00:00:00Z'));
  assert.deepEqual(await cleanupLocalCapture(db),{count:3,monthly:[{month:'2026-09',count:1},{month:'2026-10',count:2}]});
  assert.deepEqual(await cleanupLocalCapture(db),{count:0,monthly:[]});
  const after=await Promise.all(tables.map(async table=>(await db.execute(`SELECT * FROM ${table} ORDER BY 1`)).rows));
  assert.deepEqual(after,before);
 } finally {db.close();}
});

test('inconsistent monthly counters roll back the entire local cleanup',async()=>{
 const db=createClient({url:':memory:'});
 try {
  await ensurePageViewsSchema(db);
  await recordPageVisit(db,'/local',{...snapshot,testBatch:LOCAL_TEST_BATCH},new Date('2026-10-08T00:00:00Z'));
  await db.execute("UPDATE monthly_totals SET captured_hits=0 WHERE month='2026-10'");
  await assert.rejects(cleanupLocalCapture(db));
  assert.equal((await db.execute('SELECT COUNT(*) AS n FROM page_views')).rows[0].n,1);
  assert.equal((await db.execute('SELECT captured_hits FROM totals')).rows[0].captured_hits,1);
 } finally {db.close();}
});
