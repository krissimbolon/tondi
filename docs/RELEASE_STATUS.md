# Tondi v2.1 — release status (13 October 2026)

## Completed in source
- Tondi identity/branding with updated favicon, metadata, navigation and mobile UI refinements.
- Source application contains no private Instagram following or social credentials; Instagram OSINT remains a separate scheduled workflow.
- Owner-only editor gate with scrypt password verifier, HTTP-only signed eight-hour cookie, strict same-origin writes, and DB-backed login attempt throttle.
- Private JSONB draft, optimistic concurrency checks, autosave with explicit unsaved warnings, exportable backups.
- Manual filtered publication into separate public JSONB document; preview only for authenticated owner.
- CRUD for opportunities, achievement/evidence, CV profile, resources, plus generic Content Studio for all legacy collections.
- Single or batch JSON import with Zod validation and duplicate preview; historical contract backward compatibility.
- No subjective competence score used for CV; public metrics need user authorization and linkable supporting evidence.
- Dedicated SQL migration, CI pipeline targeting Vercel, and deployment runbook.

## Verified here
- TypeScript transpilation/syntax checked for 57 frontend/API source files, without missing-module errors being assessed.
- Backend authentication script tested with valid credential, wrong email/password, signed cookie and tampered cookie (7 assertions).
- `node scripts/check-publication.mjs` passes for empty published artifact.
- `node scripts/check-content.mjs` passes, with dead hard-coded profile sources removed.
- Vercel project `tondi` created in the connected team, status NOT LIVE.

## Blocked / not yet verified
- Node/npm registry unavailable in the container: dependency install, full typecheck, Vitest, Vite production bundle, browser E2E tests NOT completed.
- Neon organization is Vercel-managed: direct Neon project creation was refused. Must provision **separate Tondi database** via Vercel Storage/Neon integration; never share Pareso database.
- Production admin credentials must be configured by owner on Vercel (no passwords shared with chat).
- Full source not yet uploaded to connected GitHub/Vercel deployment. No actual production URL.
- Full lockfile must be refreshed by `npm install --package-lock-only` after the npm registry is reachable (new Neon driver was added to package metadata without registry integrity confirmation).

## Required release gates
1. Confirm `tondi` GitHub repository (new/private) and push this package's source.
2. Provision isolated Tondi Neon database in Vercel Storage.
3. Apply SQL and configure server-only environment variables.
4. Verify CI, preview build, authentication, JSON import, autosave, edit-on-second-device, conflicts, public CV privacy.
5. Connect preview to Vercel project, then production release only after tests.
