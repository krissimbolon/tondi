import { trackerDataSchema, type TrackerData } from './schema'

export interface BackupFile {
  app: 'tondi'
  exportedAt: string
  data: TrackerData
}

export function createBackup(data: TrackerData, now = new Date()): BackupFile {
  return { app: 'tondi', exportedAt: now.toISOString(), data }
}

export type ImportResult = { ok: true; data: TrackerData } | { ok: false; errors: string[] }

/** Accepts either a full backup file or raw tracker data. Never throws. */
export function parseBackup(text: string): ImportResult {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, errors: ['File bukan JSON yang valid.'] }
  }
  const candidate =
    json &&
    typeof json === 'object' &&
    'data' in json &&
    ['tondi', 'career-launchpad'].includes(String((json as { app?: unknown }).app))
      ? (json as { data: unknown }).data
      : json
  const result = trackerDataSchema.safeParse(candidate)
  if (result.success) return { ok: true, data: result.data }
  return {
    ok: false,
    errors: result.error.issues.slice(0, 8).map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
  }
}

export function backupFileName(now = new Date()): string {
  return `tondi-backup-${now.toISOString().slice(0, 10)}.json`
}

/** CSV export (RFC 4180 quoting) — handy for pasting into Excel / Google Sheets. */
export function toCsv<T extends object>(rows: T[], columns: { key: keyof T; label: string }[]): string {
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : Array.isArray(v) ? v.join(';') : String(v)
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const header = columns.map((c) => escape(c.label)).join(',')
  const body = rows.map((r) => columns.map((c) => escape(r[c.key])).join(','))
  return [header, ...body].join('\n')
}
