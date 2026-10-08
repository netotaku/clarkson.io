# Turso hit-counter schema and demo data

Run `npm run db:setup` to initialise or safely upgrade the schema. It reuses the
server-only connection, explicitly loads the ignored `.env`, and can run repeatedly.
Existing request rows, JSON and the `(path, created_at)` index stay in place.

- `page_views` remains the request log: `id`, `path`, UTC ISO `created_at`, `request_json`.
- `totals` has one row with fixed `id = 1`, non-negative integer `legacy_hits` and `captured_hits`, both defaulting to zero.
- `monthly_totals` uses a UTC `YYYY-MM` primary key with the same two counters.
- `hitcounter_demo_contributions` records the exact aggregate contribution owned by each demo batch/month and whether it created the month row. It is cleanup bookkeeping, not another total to display.

The all-time value is `totals.legacy_hits + totals.captured_hits`. Monthly activity
is the equivalent sum in each monthly row. Monthly counts break down the site
total; never add them to the site total again. No per-page aggregates are created.
Setup does not infer aggregate counts from existing request history or overwrite
existing counters.

`npm run db:seed-demo` replaces `hitcounter-demo-v1` transactionally across the log,
site counter, monthly counters and ownership ledger. It produces 100 fake captured
hits on three paths, plus 65 legacy hits broken down over the latest 12 UTC
calendar months (current month included). Sparse and zero months are explicit.
Only captured hits have individual request rows. Counts and timestamps are fixed
relative to the calendar-month window, so repeating within a month gives the same
dataset. These numbers are fixtures, not a counter.dev import.

`npm run db:cleanup-demo` subtracts only the recorded demo contribution and deletes
only marked request rows. Existing real counts and later real increments survive.
Month rows created by the demo are removed only when their counters become zero
and no other batch owns a contribution. Pre-existing zero months are preserved.
The singleton site row remains, with real counts or zero. Repeated cleanup is safe.

Old marked demo logs without aggregates can be replaced safely. If those logs
coexist with non-zero aggregates but have no ownership ledger, the script refuses
to seed or clean up: it cannot determine whether the counters already include the
demo. Mismatched ledger/log counts or insufficient counters also fail and roll
back, rather than guessing or overwriting real data. Review provenance manually.

Counter.dev CSV import remains deferred: dated figures total **547**, while page
counts total **1,061**. The daily figures have not been confirmed as page visits.
Neither number is used as a baseline or converted into request rows.

## Future accepted live hits

One accepted hit must perform all three writes in **one write transaction**:

1. Insert exactly one `page_views` row.
2. Atomically increment `totals.captured_hits` for `id = 1`, using SQL addition.
3. Upsert the current UTC `YYYY-MM` row and atomically increment its `captured_hits`.

Use one server-side UTC timestamp to derive both the log timestamp and month.
Commit all three together or roll back all three. Do not read a counter into
JavaScript and write it back; concurrent hits must use SQL increments. Live writes
must never use the demo marker or update its ownership ledger. This step implements
schema/seed maintenance only, not capture, tracking, a badge or a cache.

Run `node --test tests/hitcounter-schema.test.mjs` for the isolated in-memory SQL
checks, including real-data preservation and refusal of ambiguous demo ownership.

## Runtime sandbox counter

`/sandbox` contains only `HitCounter` inside the shared site layout. Its static HTML
contains a loading em dash; the Astro build never queries Turso. Browser code fetches
`/.netlify/functions/hit-counter` on initial load and after Astro navigation. The full
response is retained as `hitCounterData` on the component element for the next graph
pass: `totalHits`, `legacyHits`, `capturedHits`, ordered `monthly` month/count values,
and UTC `asOf`. Missing months are `null`; stored zero months remain `0`.

The GET-only function reads aggregates in one read transaction. Set
`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Netlify's **Functions** environment;
they are never sent to the browser. For local testing, use `netlify dev` with the
ignored `.env`, then open `http://localhost:8888/sandbox`. Plain `npm run dev` and
`npm run preview` do not serve Netlify Functions and will show the unavailable state.

Successful responses use a 900-second Netlify CDN cache, with browser revalidation
and no stale-while-revalidate extension. Updated database totals therefore appear
after cache expiry on the next load/navigation, without rebuilding or redeploying.
There is no polling. Errors return uncached HTTP 503 and leave an em dash rather
than a false zero. `asOf` is the database read time of the cached snapshot.
