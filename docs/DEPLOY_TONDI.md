# Tondi — production deployment runbook

## Security / isolation
Tondi is a new independent Vercel + Neon project. **Never** reuse the Pareso database, session secrets, or admin credentials.

## 1. Database
Create a dedicated Neon project in Singapore, then run `sql/001_tondi.sql` in its SQL editor. Do not execute migrations on other projects.

## 2. Vercel environment variables (Production and Preview)
- `DATABASE_URL` — Neon pooled connection string; server only
- `TONDI_ADMIN_EMAIL` — your sole account email
- `TONDI_ADMIN_PASSWORD_HASH` — output of `node scripts/hash-password.mjs` (never store plaintext)
- `TONDI_SESSION_SECRET` — random 32+ character secret (generate locally, store only in Vercel env)
- Optional `TONDI_SESSION_VERSION=1`, increment to invalidate all old cookies.

Do not use any `VITE_` prefix for credentials. Do not paste passwords or environment values into this chat or a public repository. Until all env values exist, `/app` remains locked.

## 3. Deployment
Run `npm install`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run typecheck:api`; commit lockfile. Connect repository to a **new** `tondi` Vercel project, deploy to Preview; test login, imports, autosave and public publish. Promote only after tests pass.

## 4. Data lifecycle
- `/app` requires owner login. All edits autosave to a versioned JSONB draft with conflict detection.
- `/api/publication` exposes only the manually published, filtered record, not drafts.
- `POST /api/publication` requires owner login and explicitly publishes CV-approved evidence.
- Logout clears cookie but not other sessions; session expiry 8h. Rotate `TONDI_SESSION_VERSION` to invalidate all sessions.
- Batch import accepts validated `tondi/import-v1` and legacy `career-launchpad/import-v1`.
- Use **Export backup** periodically; Tondi is not a substitute for offsite backups.

## 5. Testing matrix
Unauthenticated GET `/api/tracker` -> 401; POST without Origin -> 403; invalid data -> 422; stale version -> 409; no secrets in browser build; public GET sees published only; login rate limit; private evidence never enters publication; profile drafts do not publish automatically.

## Important
This is an implementation plan and source code, not proof the deployed infrastructure works. CI, Vercel preview, and browser E2E must be verified before production release.
