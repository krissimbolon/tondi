# Tondi

> Grow. Do. Prove.

A personal, evidence-first career and opportunity journal. Built from the original Claude prototype, with source-verified outcomes rather than subjective skill scores.

## Quickstart
1. Install Node.js 22.22+ and run `npm install`.
2. Configure a dedicated Neon project and server secrets as described in [Deployment Guide](docs/DEPLOY_TONDI.md).
3. Apply `sql/001_tondi.sql` to **Tondi only**.
4. Run `npm run verify` and `npm run typecheck:api` before deployment.
5. Deploy as a new Vercel project; sign in at `/app`.

## Core features
- Owner-only browser editor, editable collections, single/batch JSON import
- Versioned cloud autosave and optimistic concurrency protection
- Explicit publication of verified CV evidence; private records never public by default
- Opportunity and application pipelines, professional benchmark library, dashboard
- Read [JSON import contract](docs/IMPORT_CONTRACT.md) for ChatGPT-generated batches

## Current release status
Backend source is implemented, but end-to-end cloud deployment needs a dedicated Neon resource and Vercel env configuration. Do not claim production readiness until build, migrations, authentication, and browser E2E succeed.
