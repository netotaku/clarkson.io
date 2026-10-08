# Hit counter

The footer counter loads `/.netlify/functions/hit-counter` at runtime. The Astro
build does not read Turso. The response contains `totalHits`, `legacyHits`,
`capturedHits`, ordered `monthly` month/count values and UTC `asOf`. The full
response remains available on the component as `hitCounterData`.

The orange SVG is an illustrative upward trend, not measured monthly history.
Its points stay in browser code. Real monthly values preserve unknown (`null`)
versus zero; the imported historical period remains unknown. Loading/error states
never show a fabricated zero. Successful reads allow 15 minutes of Netlify CDN
caching; errors are uncached. There is no polling.

## Production configuration

Set these in Netlify before deploying:

- `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`: Functions scope.
- `HIT_COUNTER_CAPTURE_ENABLED=true`: Production context, Builds and Functions scopes.
- Leave capture disabled for other deploy contexts unless deliberately testing.
- Leave `HIT_COUNTER_LOCAL_TEST` unset in production; it is a Netlify Dev override.

The existing database is already initialized and its approximate baseline applied.
No migration needs to run during builds or deployment. After deployment, check the
read function returns the baseline plus live visits and a page visit produces an
uncached 204 POST to `/.netlify/functions/capture-page-visit`.

## Storage and capture

- `page_views`: `id`, normalized `path`, UTC ISO `created_at`, valid TEXT `request_json`.
- `totals`: singleton `id = 1`, non-negative integer `legacy_hits` / `captured_hits`.
- `monthly_totals`: UTC `YYYY-MM` primary key and the same counters.
- `counter_dev_20261008_import`: applied baseline provenance and original plan.
- `hitcounter_demo_contributions`: ownership ledger retained for migration cleanup;
  production demo data has been removed.

The total is `legacy_hits + captured_hits`. Monthly values are a breakdown, never
additional hits. The approved approximate legacy baseline is **2,791**, with an
unknown source cut-off explicitly accepted. See the
[applied migration](../migrations/counter-dev-2026-10-08/README.md).

The shared layout registers one `astro:page-load` listener for initial loads and
Astro client navigation. Each page has a per-tab 30-second sessionStorage cooldown,
including refreshes. Query/fragment-only changes, prefetches, assets and badge reads
do not count. Storage failure falls back to memory; that fallback survives Astro
navigation but not a full refresh. Failed attempts are not retried.

The POST validates method, same origin, JSON content type, a maximum 2 KiB payload
and the page path. It assembles bounded metadata: method, optional referrer
hostname, user agent, viewport and allowlisted `accept-language`. It stores no
cookies, authorization, raw IPs, full referrer URLs or arbitrary request bodies.

One write transaction inserts the request row, increments site captured hits and
upserts/increments the current UTC month's captured hits. One server timestamp
sets both the visit time and month. Legacy counts are untouched. A 204 is returned
only after commit; capture responses are never cached.

## Local testing and maintenance

The ignored `.env` holds the existing Turso URL/token. From the project root:

```sh
HIT_COUNTER_LOCAL_TEST=true netlify dev --offline
```

Open `http://localhost:8888` (not Astro's underlying 4321 port). Netlify Dev provides
Functions and `NETLIFY_DEV=true`; the explicit override enables capture and the
server assigns `testBatch: "hitcounter-local-v1"`. Offline mode only skips Netlify
account access; it still connects to the existing Turso database. Plain Astro
dev/preview does not provide Functions.

Stop local capture, then remove only its marked contributions:

```sh
npm run db:cleanup-local
```

Cleanup counts marked rows by UTC month, subtracts exactly those captured
contributions and deletes the rows in one write transaction. It preserves legacy,
real visits and demo ownership, safely reruns, and aborts on inconsistent counters.

Other manual commands:

- `npm run db:check`: isolated connection-test row, removed afterwards.
- `npm run db:setup`: safe, repeatable schema initialization/upgrade.
- `npm run db:migrate-counter-dev -- --dry-run`: inspect the applied baseline;
  applying the identical plan is idempotent, but not required for deployment.
- `node --test tests/*.test.mjs`: isolated tests; fixtures never seed shared Turso.

There is no public demo-seeding command or development sandbox route.
