# Pinned evaluation snapshot

Source: <https://nf-osi.github.io/kg-pipeline/> (dashboard updated 2026-08-20 16:04 UTC,
captured the same day). Upstream: [nf-osi/kg-pipeline](https://github.com/nf-osi/kg-pipeline),
[nf-osi/asta-bench](https://github.com/nf-osi/asta-bench).

`node scripts/build-brief-figures.mjs` turns these into the brief's four SVG figures
and Table 1. The dashboard is live and the brief quotes frozen numbers, so the data is
pinned here rather than fetched at build time — a rebuild has to reproduce exactly the
figures that were published.

## What's here

| File | Contents |
|---|---|
| `runs.json` | The one research-tools discovery run the brief reports: claude-sonnet-5, question set v1.3, 2026-08-18, 46 questions, harness commit `aa78cfa`. |
| `pubs_runs.json` | The two Pub RAG runs the brief reports: claude-sonnet-5, 2026-08-19, 130 questions, one per phrasing (`precise` and `user_query`). |
| `questions.json` | Question wording only. Not in either file above, and Table 1 prints it. Optional — without it the four figures still build and the table is skipped. |

Both run files keep the dashboard's exact schema, so they are drop-in replacements for
the full downloads.

## Pruned, deliberately

The published `runs.json` carries 52 discovery runs and `pubs_runs.json` carries 8. Only
the three listed above are used, so the rest are not vendored: 560K → 68K. Re-download
the full files from the dashboard if you need to re-cut a figure for a different model
or question set.

## Refreshing

1. Re-download `runs.json` and `pubs_runs.json` from the dashboard.
2. Update the pins at the top of `scripts/build-brief-figures.mjs` if reporting a newer run.
3. Re-run the script and update the run dates in the captions and prose.
4. Optionally re-prune to just the reported runs.
