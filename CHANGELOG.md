# Changelog

## 2026-10-13 — Evidence-first upgrade (source patch)

- Added structured, editable opportunity pipeline and batch JSON import with Zod validation and preview.
- Added evidence ledger with private/public proof separation, measurable before/after metrics, author contribution and provenance.
- Removed self-assessment/readiness percentages from dashboard, benchmark gap colouring, and manual match percentages in applications.
- Added CV Studio and publication snapshot: public visitors see a reviewed JSON artifact, never local/private drafts.
- Converted public Home, Portfolio and CV into runtime data-driven views; old capstone deep-link redirects to Portfolio.
- Added resource CRUD, Vercel config, documentation, contract examples, tests and privacy/publication checks.
- Removed `[ISI]` placeholder values from legacy TS content.

## Verification caveat

- Source syntax parse check: passed for 53 TS/TSX files.
- Publication snapshot static check: passed.
- JavaScript/JSON examples parse: passed.
- **npm dependency installation, semantic typecheck, Vitest, bundle, browser E2E and live deploy: not run** because the available container cannot reach npm registry and no matching career-launchpad Git repository/deployment exists among connected Vercel projects.
