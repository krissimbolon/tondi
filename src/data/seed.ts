import rawSeed from './seed.json' with { type: 'json' }
import { trackerDataSchema, type TrackerData } from '../domain/schema.js'

/**
 * Initial data, converted 1:1 from Career_Launchpad_Tracker.xlsx (13 Oct 2026 edition).
 * Parsed through the schema at load time so a bad edit to seed.json fails fast (and in CI).
 */
export const seedData: TrackerData = trackerDataSchema.parse(rawSeed)

/** Fresh deep copy so callers can never mutate the seed. */
export function createSeed(): TrackerData {
  return structuredClone(seedData)
}
