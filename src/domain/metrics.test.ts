import { describe, expect, it } from 'vitest'
import { createSeed } from '../data/seed'
import {
  competencyGap,
  dashboardKpis,
  goNoGoVerdict,
  programmeWeek,
  readiness,
  upcomingDeadlines,
} from './metrics'
import type { Application, Competency } from './schema'

const base = createSeed().competencies[0] as Competency

describe('programmeWeek', () => {
  it('is 0 before the start date', () => expect(programmeWeek('2026-10-13', '2026-10-12')).toBe(0))
  it('is 1 on the start date and through day 7', () => {
    expect(programmeWeek('2026-10-13', '2026-10-13')).toBe(1)
    expect(programmeWeek('2026-10-13', '2026-10-19')).toBe(1)
  })
  it('advances every 7 days', () => expect(programmeWeek('2026-10-13', '2026-10-20')).toBe(2))
  it('matches the workbook start of week 24', () =>
    expect(programmeWeek('2026-10-13', '2027-03-23')).toBe(24))
  it('caps at 25 after the programme', () => expect(programmeWeek('2026-10-13', '2028-01-01')).toBe(25))
})

describe('competencyGap (workbook formula MAX(0, target − score))', () => {
  it('is null when untested', () =>
    expect(competencyGap({ ...base, baseline: null, current: null })).toBeNull())
  it('uses the baseline when no current score', () =>
    expect(competencyGap({ ...base, target: 4, baseline: 2, current: null })).toBe(2))
  it('prefers the latest score over baseline', () =>
    expect(competencyGap({ ...base, target: 4, baseline: 2, current: 3 })).toBe(1))
  it('never goes negative', () =>
    expect(competencyGap({ ...base, target: 3, baseline: 5, current: null })).toBe(0))
})

describe('readiness', () => {
  it('reports null instead of 0% when nothing is tested', () => {
    expect(readiness([{ ...base, baseline: null }]).percent).toBeNull()
  })
  it('excludes untested skills and caps each skill at its target', () => {
    const r = readiness([
      { ...base, target: 4, baseline: 2 },
      { ...base, target: 4, baseline: 5 },
      { ...base, target: 4, baseline: null },
    ])
    expect(r).toEqual({ percent: 75, tested: 2, total: 3 })
  })
})

describe('dashboardKpis', () => {
  it('starts at zero for the seed', () => {
    expect(dashboardKpis(createSeed())).toEqual({
      competenciesMapped: 20,
      competenciesValidated: 0,
      gapsFilled: 0,
      weeksDone: 0,
      capstonesDone: 0,
      applicationsSent: 0,
    })
  })
})

const app = (over: Partial<Application> = {}): Application => ({
  id: 'a1',
  foundDate: '2026-10-13',
  org: 'Org',
  title: 'Project Assistant',
  url: '',
  eligibility: 'Y',
  deadline: null,
  status: 'Dipantau',
  match: null,
  fatalGap: '',
  nextAction: '',
  cvVersion: '',
  goNoGo: { eligible: true, available: true, criteriaMatched: true, packageReady: true, mandatoryMet: true },
  ...over,
})

describe('goNoGoVerdict', () => {
  it('is GO only when A–E all hold and eligibility is Y', () => expect(goNoGoVerdict(app())).toBe('GO'))
  it('is NO-GO when explicitly not eligible', () =>
    expect(goNoGoVerdict(app({ eligibility: 'N' }))).toBe('NO-GO'))
  it('is incomplete while eligibility is unknown', () =>
    expect(goNoGoVerdict(app({ eligibility: '?' }))).toBe('BELUM LENGKAP'))
  it('is incomplete when any check is missing', () =>
    expect(goNoGoVerdict(app({ goNoGo: { ...app().goNoGo, packageReady: false } }))).toBe('BELUM LENGKAP'))
})

describe('upcomingDeadlines', () => {
  it('returns open applications within the window, soonest first, including overdue', () => {
    const list = upcomingDeadlines(
      [
        app({ id: 'later', deadline: '2026-10-30' }),
        app({ id: 'soon', deadline: '2026-10-15' }),
        app({ id: 'overdue', deadline: '2026-10-10' }),
        app({ id: 'sent', deadline: '2026-10-14', status: 'Dikirim' }),
        app({ id: 'far', deadline: '2027-01-01' }),
      ],
      '2026-10-13',
    )
    expect(list.map((x) => x.app.id)).toEqual(['overdue', 'soon', 'later'])
    expect(list[1]?.daysLeft).toBe(2)
  })
})
