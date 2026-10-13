import { useId } from 'react'

interface Props {
  label: string
  value: number | null
  min: number
  max: number
  onChange: (value: number | null) => void
  emptyLabel?: string
  /** Show the label visually (default: screen-reader only, e.g. inside table cells). */
  showLabel?: boolean
}

/** Select for a nullable integer score; the empty option means "not tested / not reviewed". */
export function ScoreSelect({
  label,
  value,
  min,
  max,
  onChange,
  emptyLabel = '—',
  showLabel = false,
}: Props) {
  const id = useId()
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  return (
    <>
      <label htmlFor={id} className={showLabel ? undefined : 'sr-only'}>
        {label}
      </label>
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="score"
      >
        <option value="">{emptyLabel}</option>
        {options.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </>
  )
}
