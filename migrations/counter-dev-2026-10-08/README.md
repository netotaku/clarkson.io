# Applied approximate baseline

Applied on 8 October 2026 with explicit approval: **2,791 legacy hits**, plus all
preserved and subsequent live visits. Application removed the 100 marked demo
request rows and their 100 captured / 65 legacy contributions, preserving two
unmarked live rows. The resulting total was 2,793. An identical rerun was verified
to make no changes.

`source.csv` is the supplied `counter_stats_all_2026-10-8_clar-ky.csv`, unchanged.
Its SHA-256 is `7fd9af5bb401a522cfc987e6c99b1501e2c7c72b000c3d39914f32b136ef09a8`.
`plan.json` records the approved approximate interpretation. The database's
`counter_dev_20261008_import` receipt stores that plan, source checksum, application
time and unknown source cut-off. Generated development reports have been removed;
the source and migration remain for provenance and repeatability.

## Source interpretation

| Export figure | Total | Interpretation |
| --- | ---: | --- |
| `page` (84 paths) | 2,791 | Recorded pageviews; approved approximate baseline |
| `date` | 1,123 | Separate dated visitor/entry metric |
| `date`, 2025 only | 547 | May–December 2025 visitor subtotal |
| `date`, 2026 only | 576 | January–7 October 2026 visitor subtotal |

The earlier 1,061 figure is not this file's page total. The dated labels span
13 May 2025–7 October 2026, but do not establish the pageview metric's exact period.
The filename's `all` is a selected range, not proof of complete lifetime history.

Counter.dev's [tracking script](https://github.com/ihucos/counter.dev/blob/e2f2ac5a472a248998c8f9eab64334c1c33d90dc/docs/script.js)
sends immediate page beacons separately from delayed/session-conditioned visitor
calls. Its [page endpoint](https://github.com/ihucos/counter.dev/blob/e2f2ac5a472a248998c8f9eab64334c1c33d90dc/backend/endpoints/trackpage.go)
does not include the visitor `date` dimension. Its
[storage implementation](https://github.com/ihucos/counter.dev/blob/e2f2ac5a472a248998c8f9eab64334c1c33d90dc/backend/models/site.go)
also trims ranked dimensions. Consequently dated visitors cannot supply monthly
pageviews or prove complete pageview coverage.

The approved total retains all source page counts, including 15 image-like path
counts and probe/obsolete paths. Exact source coverage, reset history and export
cut-off remain unknown; that uncertainty was explicitly accepted for this fun
counter. `liveCaptureFromUTC` records the earliest preserved capture, not a claimed
CSV export time. Counter.dev continues running independently.

Historical monthly page visits remain unknown, not estimated from visitors. No
historical `page_views` rows or monthly counts were fabricated. The aggregate reader
returns `null` through the live-counting start month; later complete live months
remain available. The browser's orange curve is decorative and does not replace the
original response data or enter the database.

## Maintenance

```sh
npm run db:migrate-counter-dev -- --dry-run
```

The default is read-only. No migration command belongs in the deployment build.
The explicit `--apply` alternative is transactional and idempotent for this exact
plan. It verifies ownership and provenance, removes only the known demo/local-test
batches, sets (never repeatedly adds) legacy hits, and preserves real captures.
It refuses unrelated legacy provenance or inconsistent counters. The source-verified
alternative still requires a confirmed interval and refuses overlapping captures.
