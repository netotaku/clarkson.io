import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@libsql/client';
import {ensurePageViewsSchema} from '../server/page-views-schema.mjs';
import {seedPageViews} from './helpers/demo-page-views.mjs';
import {recordPageVisit} from '../server/capture-page-visit.ts';
import {readHitCounterData} from '../server/hit-counter-data.ts';
import {LOCAL_TEST_BATCH} from '../server/capture-mode.mjs';
import {loadMigrationSource,migrateCounterDev} from '../scripts/migrate-counter-dev-2026-10-08.mjs';

const {plan,dimensions}=await loadMigrationSource();
const snapshot={schemaVersion:1,method:'POST',headers:{}};
const tables=['page_views','totals','monthly_totals','hitcounter_demo_contributions'];
const rows=async db=>Promise.all(tables.map(async table=>(await db.execute(`SELECT * FROM ${table} ORDER BY 1`)).rows));
async function fixture(){
 const db=createClient({url:':memory:'});await ensurePageViewsSchema(db);
 await seedPageViews(db,false,new Date('2026-10-08T00:00:00Z'));
 await recordPageVisit(db,'/real',snapshot,new Date('2026-10-08T13:40:00Z'));
 await recordPageVisit(db,'/local',{...snapshot,testBatch:LOCAL_TEST_BATCH},new Date('2026-10-08T14:00:00Z'));
 return db;
}
// Hypothetical resolved values only for isolated transaction tests, NOT an approved plan.
const resolved=()=>({...structuredClone(plan),basis:'verified-source-period',illustrativeBaselineApproved:false,coverageConfirmed:true,recordedPageTotalPolicyConfirmed:true,sourcePeriod:{fromInclusiveUTC:'2025-05-13T00:00:00.000Z',cutoffExclusiveUTC:'2026-10-08T00:00:00.000Z',timezone:'UTC (test fixture only)'}});

test('pinned export totals and blocked dry run do not change the database',async()=>{
 assert.equal(dimensions.page,2791);assert.equal(dimensions.date,1123);
 const db=await fixture();try {
  const unresolved={...structuredClone(plan),basis:'verified-source-period',illustrativeBaselineApproved:false};
  const before=await rows(db);const summary=await migrateCounterDev(db,unresolved);
  assert.equal(summary.proposedLegacyHits,2791);assert.equal(summary.remove.demo.rows,100);assert.equal(summary.remove.demo.legacyHits,65);assert.equal(summary.remove.localTest.rows,1);
  assert.equal(summary.preserve.capturedHits,1);assert.equal(summary.monthlyLegacyHits.length,18);assert.ok(summary.monthlyLegacyHits.every(r=>r.count===null));assert.ok(summary.blockers.length);
  await assert.rejects(migrateCounterDev(db,unresolved,true));assert.deepEqual(await rows(db),before);
  assert.equal((await db.execute("SELECT * FROM sqlite_master WHERE name='counter_dev_20261008_import'")).rows.length,0);
 }finally{db.close();}
});

test('hypothetical resolved migration removes only owned contributions, preserves real visits and runs twice',async()=>{
 const db=await fixture();try {
  const approvedFixture=resolved();
  const realBefore=(await db.execute("SELECT * FROM page_views WHERE path='/real'")).rows;
  await migrateCounterDev(db,approvedFixture,true);const once=await rows(db);
  assert.equal(once[0].length,1);assert.deepEqual(once[0],realBefore);
  assert.deepEqual({...once[1][0]},{id:1,legacy_hits:2791,captured_hits:1});
  assert.deepEqual(once[2].map(r=>({...r})),[{month:'2026-10',legacy_hits:0,captured_hits:1}]);
  assert.equal(once[3].length,0);
  const counter=await readHitCounterData(db);
  assert.equal(counter.totalHits,2792);
  assert.ok(counter.monthly.filter(row=>row.month>='2025-05'&&row.month<='2026-10').every(row=>row.count===null));
  const receipt=(await db.execute('SELECT * FROM counter_dev_20261008_import')).rows[0];
  assert.equal(receipt.cutoff_exclusive_utc,approvedFixture.sourcePeriod.cutoffExclusiveUTC);assert.equal(receipt.source_sha256,plan.sha256);
  assert.ok(JSON.parse(receipt.plan_json).unknownHistoricalMonths.includes('2026-10'));
  await migrateCounterDev(db,approvedFixture,true);assert.deepEqual(await rows(db),once);
  assert.deepEqual((await db.execute('SELECT * FROM counter_dev_20261008_import')).rows[0],receipt);
 }finally{db.close();}
});

test('overlap blocks application without deleting preserved captures',async()=>{
 const db=await fixture();try {
  const conflicting=resolved();conflicting.sourcePeriod.cutoffExclusiveUTC='2026-10-08T15:00:00.000Z';
  const before=await rows(db);const summary=await migrateCounterDev(db,conflicting);
  assert.equal(summary.overlappingCapturedRows,1);
  await assert.rejects(migrateCounterDev(db,conflicting,true));assert.deepEqual(await rows(db),before);
 }finally{db.close();}
});

test('late migration failure rolls back cleanup, legacy replacement and receipt together',async()=>{
 const db=await fixture();try {
  await db.execute(`CREATE TRIGGER fail_import BEFORE UPDATE OF legacy_hits ON totals WHEN NEW.legacy_hits=2791 BEGIN SELECT RAISE(ABORT,'test failure'); END`);
  const before=await rows(db);
  await assert.rejects(migrateCounterDev(db,resolved(),true));assert.deepEqual(await rows(db),before);
  assert.equal((await db.execute("SELECT * FROM sqlite_master WHERE name='counter_dev_20261008_import'")).rows.length,0);
 }finally{db.close();}
});

test('approved illustrative baseline preserves live hits without inventing a historical cut-off',async()=>{
 const db=await fixture();try {
  const approximate={...structuredClone(plan),liveCaptureFromUTC:'2026-10-08T13:40:00.000Z'};
  await migrateCounterDev(db,approximate,true);
  const receipt=(await db.execute('SELECT * FROM counter_dev_20261008_import')).rows[0];
  assert.equal(receipt.cutoff_exclusive_utc,null);
  assert.equal(JSON.parse(receipt.source_period_json).fromInclusiveUTC,null);
  assert.equal((await readHitCounterData(db)).totalHits,2792);
  await recordPageVisit(db,'/new-live',snapshot,new Date('2026-10-08T15:00:00Z'));
  await migrateCounterDev(db,approximate,true);
  const data=await readHitCounterData(db);
  assert.equal(data.legacyHits,2791);assert.equal(data.capturedHits,2);assert.equal(data.totalHits,2793);
 }finally{db.close();}
});
