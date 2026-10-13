import type { Achievement, Metric, Opportunity } from './schema'

export const opportunityKey = (o: Pick<Opportunity,'title'|'organizer'|'sourceUrl'>) =>
  `${o.organizer.trim().toLowerCase()}|${o.title.trim().toLowerCase()}`

export type ProofSummary = { total: number; public: number; credentialled: number; metricCount: number }
export function proofSummary(records: Achievement[]): ProofSummary {
  return {
    total: records.length,
    public: records.filter(x => x.publiclyVisible).length,
    credentialled: records.filter(x => x.evidences.some(e => e.url && e.visibility === 'public')).length,
    metricCount: records.flatMap(x => verifiedMetrics(x)).length,
  }
}

export function metricHasPublicEvidence(m: Metric, record: Achievement): boolean {
  return m.allowedInCv && m.evidenceIds.some(id => record.evidences.some(e => e.id === id && e.visibility === 'public' && /^https?:\/\//.test(e.url)))
}
export function verifiedMetrics(record: Achievement): Metric[] {
  if (!record.publiclyVisible || record.provenance === 'simulation') return []
  return record.metrics.filter(m => metricHasPublicEvidence(m, record))
}
function readable(n:number):string { return Number.isInteger(n) ? n.toLocaleString('en-US') : Number(n.toFixed(2)).toLocaleString('en-US') }
export function describeMetric(m: Metric):string {
  const result = `${readable(m.result)} ${m.unit}`
  if (m.kind === 'before_after' && m.baseline !== null) {
    const relative = m.baseline !== 0 ? ` (${readable(Math.abs((m.result-m.baseline)/m.baseline*100))}% ${m.result < m.baseline ? 'decrease' : 'increase'})` : ''
    return `${readable(m.baseline)} → ${result}${relative}${m.sampleSize ? `; n=${m.sampleSize.toLocaleString('en-US')}` : ''}`
  }
  if (m.kind === 'rank') return `Rank ${readable(m.result)}${m.sampleSize ? ` of ${m.sampleSize.toLocaleString('en-US')}` : ''}`
  return `${result}${m.sampleSize ? `; n=${m.sampleSize.toLocaleString('en-US')}` : ''}`
}
export function publicCvAchievements(records: Achievement[]) {
  return records.filter(x => x.publiclyVisible && x.evidences.some(e => e.visibility==='public')).map(x => ({
    ...x,
    publicEvidences: x.evidences.filter(e => e.visibility === 'public'),
    cvMetrics: verifiedMetrics(x),
  }))
}
