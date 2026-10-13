import { useId } from 'react'

interface Props<T extends string> {
  label: string
  value: T
  options: readonly T[]
  onChange: (value: T) => void
  hideLabel?: boolean
}

/** Accessible <select> bound to a string-literal union. */
export function SelectField<T extends string>({ label, value, options, onChange, hideLabel }: Props<T>) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : undefined}>
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}
