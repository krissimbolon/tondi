import { usePublicView } from '../domain/public-view'

/**
 * Per-page <title>/<meta>. React 19 hoists these into <head> automatically.
 * Tracker pages are marked noindex — they hold no public content.
 */
export function Seo({
  title,
  description,
  noindex,
}: {
  title: string
  description?: string
  noindex?: boolean
}) {
  const {publicProfile}=usePublicView()
  const full = `${title} · ${publicProfile.name || 'Tondi'}`
  return (
    <>
      <title>{full}</title>
      {description ? <meta name="description" content={description} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:title" content={full} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}
    </>
  )
}
