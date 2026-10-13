import type { ApplicationStatus, CompetencyStatus, ResourceStatus, WorkStatus } from '../domain/schema'
import type { GoNoGoVerdict } from '../domain/metrics'

type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'accent' | 'neutral'

const TONE: Record<string, Tone> = {
  // work
  'Belum mulai': 'neutral',
  Berjalan: 'info',
  Review: 'warn',
  Selesai: 'ok',
  // competency
  'Belum diuji': 'neutral',
  Diuji: 'info',
  Divalidasi: 'ok',
  // resources
  'Belum dibuka': 'neutral',
  Dilewati: 'neutral',
  // applications
  Dipantau: 'neutral',
  Disiapkan: 'info',
  Dikirim: 'accent',
  'Tes/Interview': 'warn',
  Ditolak: 'danger',
  Diterima: 'ok',
  Batal: 'neutral',
  // priority
  Kritis: 'danger',
  Tinggi: 'warn',
  Menengah: 'info',
  // go/no-go
  GO: 'ok',
  'NO-GO': 'danger',
  'BELUM LENGKAP': 'warn',
}

export function Badge({ children, tone }: { children: string; tone?: Tone }) {
  const t = tone ?? TONE[children] ?? 'neutral'
  return <span className={t === 'neutral' ? 'badge' : `badge badge-${t}`}>{children}</span>
}

export function StatusBadge({
  status,
}: {
  status: WorkStatus | CompetencyStatus | ResourceStatus | ApplicationStatus | GoNoGoVerdict | string
}) {
  return <Badge>{status}</Badge>
}
