import type { ReactNode } from 'react'

export function Kpi({ value, label, suffix }: { value: ReactNode; label: string; suffix?: string }) {
  return (
    <div className="kpi">
      <div className="kpi-value">
        {value}
        {suffix ? <small> {suffix}</small> : null}
      </div>
      <div className="kpi-label">{label}</div>
    </div>
  )
}

export function Progress({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, value))
  return <progress className="progress" aria-label={label} max={100} value={Math.round(pct)} />
}
