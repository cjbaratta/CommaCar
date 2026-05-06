# PilotCompatible

A lightweight static Astro site for finding US-market vehicles with comma.ai openpilot compatibility and jumping into pre-built marketplace searches. Blog posts are managed as Git-backed Markdown through TinaCMS and rendered to static HTML at build time.

## Requirements

- Node.js 20+.
- TinaCloud environment variables for production editing: `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN`.

## Scripts

- `npm run dev` starts TinaCMS with the local Astro dev server.
- `npm run dev:astro` starts Astro without TinaCMS.
- `npm run build` builds the Tina admin and the static Astro site.
- `npm test` runs the public-readiness regression tests against the latest `dist` build.
- `npm run lint` checks JavaScript syntax and repository hygiene.
- `npm run format` trims trailing whitespace and ensures final newlines.
- `npm run build:data` regenerates compatibility data from a saved comma.ai vehicles HTML page at `/tmp/comma-vehicles.html`.

Compatibility data comes from `https://comma.ai/vehicles`; the checked-in data was generated on May 1, 2026 from a source page last updated February 20, 2026.

## Content

Blog posts live in `src/content/blog`. TinaCMS generates its admin into `public/admin` during builds; that generated folder is intentionally ignored.
