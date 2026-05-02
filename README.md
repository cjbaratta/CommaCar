# Comma Car Finder

A lightweight static Vite app for finding US-market vehicles with comma.ai openpilot compatibility and jumping into pre-built marketplace searches.

## Requirements

- Node.js `^20.19.0 || >=22.12.0` to match Vite 7.

## Scripts

- `npm run dev` starts the local Vite server.
- `npm run build` creates the production build.
- `npm test` runs the public-readiness regression tests.
- `npm run lint` checks JavaScript syntax and repository hygiene.
- `npm run format` trims trailing whitespace and ensures final newlines.
- `npm run build:data` regenerates compatibility data from a saved comma.ai vehicles HTML page at `/tmp/comma-vehicles.html`.

Compatibility data comes from `https://comma.ai/vehicles`; the checked-in data was generated on May 1, 2026 from a source page last updated February 20, 2026.
