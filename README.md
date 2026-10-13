# PilotCompatible

A lightweight static Vite app for finding US-market vehicles with comma.ai openpilot compatibility and jumping into pre-built marketplace searches.

## Requirements

- Node.js `^20.19.0 || >=22.12.0` to match Vite 7.

## Scripts

- `npm run dev` starts the local Vite server.
- `npm run build` regenerates the sitemap and creates the production build.
- `npm run build:sitemap` refreshes `public/sitemap.xml` with the home page, canonical blog index, and every post in `posts/`.
- `npm run indexnow:submit` submits the current sitemap URLs to IndexNow after a production deploy.
- `npm test` runs the public-readiness regression tests.
- `npm run lint` checks JavaScript syntax and repository hygiene.
- `npm run format` trims trailing whitespace and ensures final newlines.
- `npm run build:data` regenerates compatibility data from a saved comma.ai vehicles HTML page at `/tmp/comma-vehicles.html`.

## IndexNow

The IndexNow key file is published from `public/` so search engines can verify ownership of `https://www.pilotcompatible.com`.

After deploying a production build:

1. Confirm the key file is reachable at `https://www.pilotcompatible.com/67a6e289566a459f83636eb5efcf94ef.txt`.
2. Confirm the sitemap is reachable at `https://www.pilotcompatible.com/sitemap.xml`.
3. Run `npm run indexnow:submit` to submit every URL from `public/sitemap.xml`.

Compatibility data comes from `https://comma.ai/vehicles`; the baseline data was generated on July 30, 2026. US-market additions were verified on October 11, 2026 against the chart last updated October 6, 2026; existing entries were preserved.
