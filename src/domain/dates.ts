/** Date helpers that work on ISO `YYYY-MM-DD` strings in local time (no timezone drift). */

export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export function todayIso(): string {
  return toIsoDate(new Date())
}

const DAY_MS = 86_400_000

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parseIsoDate(toIso).getTime() - parseIsoDate(fromIso).getTime()) / DAY_MS)
}

const formatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return formatter.format(parseIsoDate(iso))
}
