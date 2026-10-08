import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {loadEnvFile} from 'node:process';
import {fileURLToPath} from 'node:url';
import {createTursoConnection} from '../server/turso.mjs';
import {removeDemo, SEED_BATCH} from '../server/demo-contributions.mjs';
import {removeLocalCapture} from '../server/cleanup-local-capture.mjs';
import {LOCAL_TEST_BATCH} from '../server/capture-mode.mjs';

const directory = new URL('../migrations/counter-dev-2026-10-08/', import.meta.url);
const expectedHash = '7fd9af5bb401a522cfc987e6c99b1501e2c7c72b000c3d39914f32b136ef09a8';
const receiptTable = 'counter_dev_20261008_import';
const demo = "COALESCE(json_extract(request_json, '$.seedBatch') = ?, 0)";
const local = "COALESCE(json_extract(request_json, '$.testBatch') = ?, 0)";
const real = `NOT (${demo}) AND NOT (${local})`;
const sum = (rows, field) => rows.reduce((n, r) => n + Number(r[field]), 0);

export async function loadMigrationSource() {
  const source = await readFile(new URL('source.csv', directory));
  const plan = JSON.parse(await readFile(new URL('plan.json', directory), 'utf8'));
  if (createHash('sha256').update(source).digest('hex') !== expectedHash || plan.sha256 !== expectedHash) throw new Error('Source checksum mismatch');
  // Deliberately specific to this pinned export, whose fields contain no CSV quotes/commas.
  const lines = source.toString('utf8').trim().split(/\r?\n/);
  if (lines.shift() !== 'dimension,type,count') throw new Error('Unexpected CSV');
  const dimensions = {};
  for (const line of lines) {
    const [dimension, value, raw, extra] = line.split(',');
    const count = Number(raw);
    if (!dimension || !value || extra !== undefined || !/^\d+$/.test(raw) || !Number.isSafeInteger(count)) throw new Error('Unexpected CSV row');
    dimensions[dimension] = (dimensions[dimension] ?? 0) + count;
  }
  if (dimensions.page !== 2791 || dimensions.date !== 1123 || plan.proposedLegacyHits !== dimensions.page || plan.sourceMetric !== 'page') throw new Error('Unexpected source totals');
  if (Object.keys(plan.monthlyLegacyHits).length) throw new Error('This export supplies no monthly pageview counts');
  return {plan, dimensions};
}

async function inspect(tx, plan) {
  const site = (await tx.execute({sql:'SELECT * FROM totals WHERE id = ?', args:[1]})).rows[0];
  if (!site) throw new Error('Missing totals');
  const months = (await tx.execute('SELECT * FROM monthly_totals ORDER BY month')).rows;
  const owned = (await tx.execute({sql:'SELECT * FROM hitcounter_demo_contributions WHERE seed_batch = ? ORDER BY month', args:[SEED_BATCH]})).rows;
  const marked = async (predicate, marker) => (await tx.execute({sql:`SELECT substr(created_at, 1, 7) AS month, COUNT(*) AS count FROM page_views WHERE ${predicate} GROUP BY 1 ORDER BY 1`, args:[marker]})).rows.map(r=>({month:String(r.month),count:Number(r.count)}));
  const demoRows = await marked(demo, SEED_BATCH);
  const testRows = await marked(local, LOCAL_TEST_BATCH);
  const realVisits = (await tx.execute({sql:`SELECT COUNT(*) AS count, MIN(created_at) AS first, MAX(created_at) AS last FROM page_views WHERE ${real}`,args:[SEED_BATCH,LOCAL_TEST_BATCH]})).rows[0];
  const receiptExists = (await tx.execute({sql:"SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",args:[receiptTable]})).rows.length;
  const receipt = receiptExists ? (await tx.execute(`SELECT * FROM ${receiptTable} WHERE id = 1`)).rows[0] : undefined;
  const blockers = [];
  const start = plan.sourcePeriod.fromInclusiveUTC;
  const cutoff = plan.sourcePeriod.cutoffExclusiveUTC;
  const illustrative = plan.basis === 'illustrative-baseline' && plan.illustrativeBaselineApproved === true;
  const validTime = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
  if (!illustrative && (!validTime(start) || !validTime(cutoff) || start >= cutoff || !plan.sourcePeriod.timezone || !plan.coverageConfirmed)) blockers.push('Source period, timezone and exclusive UTC cut-off are not confirmed. Date labels do not date pageviews.');
  if (illustrative && (!validTime(plan.liveCaptureFromUTC) || Date.parse(plan.liveCaptureFromUTC) > Date.now() ||
      (realVisits.first && realVisits.first < plan.liveCaptureFromUTC))) blockers.push('The declared live-capture boundary must preserve all existing real captures.');
  if (validTime(cutoff) && Date.parse(cutoff) > Date.now()) blockers.push('Historical cut-off cannot be in the future.');
  if (!plan.recordedPageTotalPolicyConfirmed) blockers.push('Confirm retaining all 2,791 recorded pageviews, including image-like/probe paths and source counting differences.');
  const doubled = (await tx.execute({sql:`SELECT COUNT(*) AS count FROM page_views WHERE ${demo} AND ${local}`,args:[SEED_BATCH,LOCAL_TEST_BATCH]})).rows[0].count;
  if (Number(doubled)) blockers.push('A row has both demo and local-test ownership; resolve before removal.');
  if (sum(owned,'captured_hits') !== sum(demoRows,'count') || demoRows.some(r=>Number(owned.find(o=>o.month===r.month)?.captured_hits) !== r.count)) blockers.push('Demo ownership and logs do not match.');
  const capturedToRemove = sum(demoRows,'count') + sum(testRows,'count');
  const legacyToRemove = sum(owned,'legacy_hits');
  if (Number(site.captured_hits) < capturedToRemove || Number(site.legacy_hits) < legacyToRemove) blockers.push('Site counters cannot cover marked contributions.');
  for (const month of new Set([...owned.map(r=>r.month),...testRows.map(r=>r.month)])) {
    const stored = months.find(r=>r.month===month);
    const d = owned.find(r=>r.month===month);
    const captured = Number(d?.captured_hits??0) + Number(testRows.find(r=>r.month===month)?.count??0);
    if (!stored || Number(stored.captured_hits) < captured || Number(stored.legacy_hits) < Number(d?.legacy_hits??0)) blockers.push(`Month ${month} cannot cover marked contributions.`);
  }
  // Refuse to overwrite unrelated historical imports or unknown legacy provenance.
  const remainingLegacy = Number(site.legacy_hits) - legacyToRemove;
  if (remainingLegacy !== (receipt ? plan.proposedLegacyHits : 0)) blockers.push('Non-demo legacy total has unconfirmed provenance; refuse to overwrite it.');
  if (months.some(r=>Number(r.legacy_hits)-Number(owned.find(d=>d.month===r.month)?.legacy_hits??0) !== 0)) blockers.push('Existing non-demo monthly legacy values require review.');
  if (receipt && receipt.plan_json !== JSON.stringify(plan)) blockers.push('An applied receipt differs from this plan; refuse to replace its provenance.');
  let overlap = null;
  if (validTime(start) && validTime(cutoff)) {
    overlap = Number((await tx.execute({sql:`SELECT COUNT(*) AS count FROM page_views WHERE ${real} AND created_at >= ? AND created_at < ?`,args:[SEED_BATCH,LOCAL_TEST_BATCH,start,cutoff]})).rows[0].count);
    if (overlap) blockers.push(`${overlap} preserved captured visits fall inside the proposed historical period. Re-export/truncate the source; do not delete real visits.`);
  }
  return {
    mode:'dry-run; no changes committed', asOf:new Date().toISOString(), source:plan.sourceFile, sourceSha256:plan.sha256,
    dimensions: {page:2791,date:1123,date2025:547,date2026:576},
    proposedLegacyHits:plan.proposedLegacyHits, sourceSelection:plan.sourceSelection,
    basis:illustrative ? 'User-approved approximate baseline; overlap/coverage uncertainty accepted for this fun counter' : 'Source-verified history',
    liveCaptureFromUTC:plan.liveCaptureFromUTC ?? null,
    observedDateLabels:plan.observedDateLabels, sourcePeriod:plan.sourcePeriod, scope:plan.scope,
    monthlyLegacyHits:plan.unknownHistoricalMonths.map(month=>({month,count:null})),
    missingHistory:'History before the first retained date label, tracking start/resets, and exact pageview coverage/cut-off are unverified. This is not a complete lifetime total.',
    remove:{demo:{batch:SEED_BATCH,rows:sum(demoRows,'count'),capturedHits:sum(demoRows,'count'),legacyHits:legacyToRemove,monthly:owned.map(r=>({month:r.month,legacyHits:Number(r.legacy_hits),capturedHits:Number(r.captured_hits)}))},localTest:{batch:LOCAL_TEST_BATCH,rows:sum(testRows,'count'),capturedHits:sum(testRows,'count'),monthly:testRows}},
    preserve:{requestRows:Number(realVisits.count),firstCapture:realVisits.first,lastCapture:realVisits.last,capturedHits:Number(site.captured_hits)-capturedToRemove},
    proposedSiteTotal:plan.proposedLegacyHits+Number(site.captured_hits)-capturedToRemove,
    overlappingCapturedRows:overlap,
    possibleCaptureGap:validTime(cutoff) && realVisits.first && cutoff < realVisits.first
      ? {from:cutoff,to:realVisits.first,status:'No retained captured rows in this interval; missing visits cannot be inferred as zero.'} : null,
    blockers,
  };
}

export async function migrateCounterDev(db, plan, apply=false) {
  const tx = await db.transaction(apply ? 'write' : 'read');
  try {
    const summary = await inspect(tx, plan);
    if (!apply) { await tx.commit(); return summary; }
    if (summary.blockers.length) throw new Error('Migration blocked; resolve the dry-run findings first');
    await tx.execute(`CREATE TABLE IF NOT EXISTS ${receiptTable} (
      id INTEGER PRIMARY KEY CHECK (id = 1), source_file TEXT NOT NULL,
      source_sha256 TEXT NOT NULL, source_period_json TEXT NOT NULL CHECK (json_valid(source_period_json)),
      cutoff_exclusive_utc TEXT, legacy_hits INTEGER NOT NULL,
      plan_json TEXT NOT NULL CHECK (json_valid(plan_json)), applied_at TEXT NOT NULL
    )`);
    // Reuse existing removal logic under this SAME write transaction.
    await removeDemo(tx);
    await removeLocalCapture(tx);
    await tx.execute({sql:'UPDATE totals SET legacy_hits = ? WHERE id = ?',args:[plan.proposedLegacyHits,1]});
    // No historical monthly inserts: this CSV has no monthly pageview metric.
    // Unallocated legacy remains unknown in the receipt, not estimated as zero.
    await tx.execute({sql:`INSERT INTO ${receiptTable}
      (id,source_file,source_sha256,source_period_json,cutoff_exclusive_utc,legacy_hits,plan_json,applied_at)
      VALUES (?,?,?,?,?,?,?,?) ON CONFLICT (id) DO NOTHING`,args:[1,plan.sourceFile,plan.sha256,JSON.stringify(plan.sourcePeriod),plan.sourcePeriod.cutoffExclusiveUTC,plan.proposedLegacyHits,JSON.stringify(plan),new Date().toISOString()]});
    await tx.commit();
    return {...summary,mode:'applied'};
  } catch (error) { await tx.rollback(); throw error; }
  finally { tx.close(); }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(process.argv[1], 'file://'))) {
  let db;
  try {
    const args=process.argv.slice(2);
    if (args.some(arg=>!['--dry-run','--apply'].includes(arg)) || (args.includes('--dry-run')&&args.includes('--apply'))) throw new Error('Invalid arguments');
    const {plan}=await loadMigrationSource();
    loadEnvFile(fileURLToPath(new URL('../.env',import.meta.url)));
    db=createTursoConnection();
    console.log(JSON.stringify(await migrateCounterDev(db,plan,args.includes('--apply')),null,2));
  } catch {
    process.exitCode=1;
    console.error('Historical migration did not commit. Check the dry-run blockers, pinned source, .env, connectivity and schema. No credentials are logged.');
  } finally {db?.close();}
}
