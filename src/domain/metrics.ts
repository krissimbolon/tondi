import { daysBetween } from './dates'
import type { Application, Competency, GoNoGo, TrackerData } from './schema'

export const TOTAL_WEEKS = 24

/**
 * Programme week for a given day: 0 = not started yet, 1–24 = active week, 25 = programme finished.
 */
export function programmeWeek(startDate: string, today: string): number {
  const days = daysBetween(startDate, today)
  if (days < 0) return 0
  return Math.min(TOTAL_WEEKS + 1, Math.floor(days / 7) + 1)
}

/** Score used for gap analysis: latest test if any, otherwise baseline. */
export function effectiveScore(c: Competency): number | null {
  return c.current ?? c.baseline
}

/** Same formula as the workbook: MAX(0, target − score); null when untested. */
export function competencyGap(c: Competency): number | null {
  const s = effectiveScore(c)
  return s === null ? null : Math.max(0, c.target - s)
}

/**
 * Readiness = share of target reached across *tested* competencies (0–100).
 * Untested skills are excluded, not counted as zero — and reported separately so the number is never inflated.
 */
export function readiness(competencies: Competency[]): {
  percent: number | null
  tested: number
  total: number
} {
  const tested = competencies.filter((c) => effectiveScore(c) !== null)
  if (tested.length === 0) return { percent: null, tested: 0, total: competencies.length }
  const sum = tested.reduce((acc, c) => acc + Math.min(effectiveScore(c) ?? 0, c.target) / c.target, 0)
  return {
    percent: Math.round((sum / tested.length) * 100),
    tested: tested.length,
    total: competencies.length,
  }
}

/** KPI block mirroring the workbook's 00_Dashboard sheet. */
export function dashboardKpis(data: TrackerData) {
  return {
    competenciesMapped: data.competencies.length,
    competenciesValidated: data.competencies.filter((c) => c.status === 'Divalidasi').length,
    gapsFilled: data.competencies.filter((c) => c.baseline !== null).length,
    weeksDone: data.roadmap.filter((w) => w.status === 'Selesai').length,
    capstonesDone: data.capstones.filter((p) => p.status === 'Selesai').length,
    applicationsSent: data.applications.filter((a) =>
      ['Dikirim', 'Tes/Interview', 'Ditolak', 'Diterima'].includes(a.status),
    ).length,
  }
}

export type GoNoGoVerdict = 'GO' | 'NO-GO' | 'BELUM LENGKAP'

/**
 * Playbook rule: apply only when A (eligible) … E (mandatory requirements met) all hold.
 * Explicit "N" eligibility is an immediate NO-GO.
 */
export function goNoGoVerdict(app: Pick<Application, 'eligibility' | 'goNoGo'>): GoNoGoVerdict {
  if (app.eligibility === 'N') return 'NO-GO'
  const checks: (keyof GoNoGo)[] = [
    'eligible',
    'available',
    'criteriaMatched',
    'packageReady',
    'mandatoryMet',
  ]
  return checks.every((k) => app.goNoGo[k]) && app.eligibility === 'Y' ? 'GO' : 'BELUM LENGKAP'
}

const OPEN_STATUSES = new Set(['Dipantau', 'Disiapkan'])

/** Open applications with a deadline within `withinDays`, soonest first (overdue included). */
export function upcomingDeadlines(apps: Application[], today: string, withinDays = 21) {
  return apps
    .filter((a) => a.deadline && OPEN_STATUSES.has(a.status))
    .map((a) => ({ app: a, daysLeft: daysBetween(today, a.deadline as string) }))
    .filter((x) => x.daysLeft <= withinDays)
    .sort((a, b) => a.daysLeft - b.daysLeft)
}
