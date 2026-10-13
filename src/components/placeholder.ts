/** "[ISI: …]" marks content Chris still has to fill in (see src/content/). */
export function isPlaceholder(value: string | undefined | null): boolean {
  return !value || value.trim().startsWith('[ISI')
}

/** Removes placeholders from a list in production builds — keeps them visible (highlighted) in dev. */
export function visible<T>(items: T[], pick: (item: T) => string, dev = import.meta.env.DEV): T[] {
  return dev ? items : items.filter((i) => !isPlaceholder(pick(i)))
}
