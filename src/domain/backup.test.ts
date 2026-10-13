import { describe, expect, it } from 'vitest'
import { createSeed, seedData } from '../data/seed'
import { backupFileName, createBackup, parseBackup, toCsv } from './backup'

describe('seed data (converted from Career_Launchpad_Tracker.xlsx)', () => {
  it('has every sheet with the expected row counts', () => {
    expect(seedData.competencies).toHaveLength(20)
    expect(seedData.roadmap).toHaveLength(24)
    expect(seedData.resources).toHaveLength(40)
    expect(seedData.capstones).toHaveLength(4)
    expect(seedData.benchmark).toHaveLength(7)
    expect(seedData.weeklyReviews).toHaveLength(24)
  })
  it('never pre-fills competency scores (baseline must come from a real test)', () => {
    expect(seedData.competencies.every((c) => c.baseline === null && c.current === null)).toBe(true)
  })
  it('references only resources that exist', () => {
    const ids = new Set(seedData.resources.map((r) => r.id))
    const refs = [...seedData.competencies, ...seedData.roadmap].flatMap((x) => x.resourceIds)
    expect(refs.filter((r) => !ids.has(r))).toEqual([])
  })
  it('createSeed returns an independent copy', () => {
    const a = createSeed()
    a.settings.ownerName = 'changed'
    expect(seedData.settings.ownerName).not.toBe('changed')
  })
})

describe('backup round-trip', () => {
  it('parses its own export', () => {
    const data = createSeed()
    data.competencies[0]!.baseline = 3
    const result = parseBackup(JSON.stringify(createBackup(data)))
    expect(result.ok && result.data.competencies[0]?.baseline).toBe(3)
  })
  it('accepts raw tracker data without the envelope', () => {
    expect(parseBackup(JSON.stringify(createSeed())).ok).toBe(true)
  })
  it('rejects invalid JSON without throwing', () => {
    expect(parseBackup('{oops')).toEqual({ ok: false, errors: ['File bukan JSON yang valid.'] })
  })
  it('rejects out-of-range scores with a readable path', () => {
    const data = createSeed() as unknown as { competencies: { baseline: number }[] }
    data.competencies[0]!.baseline = 9
    const result = parseBackup(JSON.stringify(data))
    expect(result).toMatchObject({ ok: false, errors: [expect.stringMatching(/^competencies\.0\.baseline/)] })
  })
  it('names files by date', () => {
    expect(backupFileName(new Date('2026-10-13T10:00:00Z'))).toBe('tondi-backup-2026-10-13.json')
  })
})

describe('toCsv', () => {
  it('quotes commas, quotes and newlines', () => {
    const csv = toCsv(
      [{ a: 'x, y', b: 'say "hi"', c: ['R01', 'R02'] }],
      [
        { key: 'a', label: 'A' },
        { key: 'b', label: 'B' },
        { key: 'c', label: 'C' },
      ],
    )
    expect(csv).toBe('A,B,C\n"x, y","say ""hi""","R01;R02"')
  })
})
