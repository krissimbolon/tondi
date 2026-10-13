import { isPlaceholder } from './placeholder'

/**
 * Renders a public content string. "[ISI: …]" placeholders are highlighted in development
 * and hidden in production builds, so an unfinished field never leaks onto the live site.
 */
export function Txt({ children }: { children: string }) {
  if (!isPlaceholder(children)) return <>{children}</>
  if (import.meta.env.DEV) return <mark className="placeholder">{children}</mark>
  return null
}
