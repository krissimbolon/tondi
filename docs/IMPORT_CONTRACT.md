# Import contract — `tondi/import-v1`

The canonical interchange shape is a **single JSON object**:

```json
{"format":"tondi/import-v1", "opportunities":[...], "achievements":[...]}
```

A bare opportunity object or an array of opportunity objects is also accepted. See `examples/import-single.json` and `examples/import-batch.json`. A package must contain at least one record. Maximum 1,500 opportunities, 500 achievements, or 2 MB of JSON per import. Large exports should be sharded.

## Opportunity (minimal mandatory properties)

| Property | Type | Meaning |
|---|---|---|
| `id` | string | Stable deterministic external ID; same opportunity keeps same ID on later refreshes |
| `type` | enum | `pelatihan`, `lomba`, `ujian`, `tes`, `kompetisi`, `challenge`, `event`, `beasiswa`, `internship`, `job`, `project`, `volunteer`, `fellowship`, `lainnya` |
| `title` | string | Original title, not fabricated |
| `organizer` | string | Actual organizer, not merely a tagged account |
| `sourceUrl` | HTTP(S) URL | Direct event/post link, not generic homepage unless nothing more specific is available |

Optional: `description`, `registrationUrl`, `deadline`, `startDate`, `endDate`, `mode`, `location`, `cost`, `eligibility`, `tags`, `status`, `sourceKind`, `verifiedAt`, `notes`.

All dates must be ISO `YYYY-MM-DD`, or `null` if unknown. Never invent deadlines or eligibility. Registration status `open` requires verification from original source. `sourceKind` = `official`, `partner`, `media`, `unverified`.

**Import behavior:** strict Zod validation, dry-run preview, duplicate detection by ID **and** organization/title, `skip`/`update` on ID conflicts, no overwrite of different-ID natural-key collisions, user confirmation, browser-local persistence. A backup JSON is a *different* format intended to replace ALL tracker data; it must not be confused with an import batch.

## Achievement & CV evidence

Achievement fields: `id`, `title`, `organization`, `provenance` are required. Optional: `opportunityId`, `role`, `contribution`, `outcome`, dates, `resultStatus`, `skillTags`, `publiclyVisible`, `evidences[]`, `metrics[]`.

`provenance` = employment, internship, volunteering, academic, competition, course, exam, project, simulation, other.

Evidence fields: `id`, `label`, HTTP(S) `url`, `type`, `visibility` (`public|private`), `issuer`.

Metric fields: `id`, `label`, `kind` (`before_after|absolute|rank|score`), `unit`, `baseline`, `result`, `sampleSize`, `method`, `evidenceIds`, `claimScope` (`team|individual`), `allowedInCv`. `baseline` is required for `before_after` and must not be invented. Percent change derived as `(result - baseline)/baseline * 100` where baseline is nonzero. Labels indicate observed change, not automatically causality.

CV inclusion requires all of: achievement `publiclyVisible`, an attached *public* evidence URL, `allowedInCv=true` for the metric, non-simulation provenance, and a matching evidence ID. This is a **presentation/traceability gate**, NOT cryptographic verification that an issuer actually signed the claim. Do not claim the app implements W3C Verifiable Credentials.

## Prompt for ChatGPT or another researcher

> Convert the identified public opportunities into only valid JSON conforming to `tondi/import-v1`. Never invent event date, price, status, deadline, registration URL or organizer. Assign stable IDs derived from organizer + original post ID or canonical URL. Use `null` for unknown dates and `""` for unavailable optional text. Deduplicate across websites/social posts. Use the direct original post URL. Distinguish organizer from media/partner and set `sourceKind` accurately. If there is no verified lead, output no import data and explain the limitation instead of generating placeholders. Do not invent achievements or metrics: import those only from outcome evidence actually supplied by the user.

After generating JSON, paste/upload via `/app/impor` and inspect the dry run. Prefer tracking opportunities early, even if the application form has not yet opened. Update their status as it changes.


Backward compatibility: old `career-launchpad/import-v1` files are still accepted by the parser; new exports use `tondi/import-v1`.
