import { useEffect, useState } from 'react'
import { bundledPublication, type Publication, publicationSchema, publishablePackage } from './publication'
import { trackerDataSchema } from './schema'

/** Public fetch is strictly publication-only. The owner-only preview calls the authenticated draft API. */
export function usePublicView(): Publication {
  const [publication, setPublication] = useState<Publication>(bundledPublication)
  const preview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1'
  useEffect(() => {
    let active = true
    const endpoint = preview ? '/api/tracker' : '/api/publication'
    fetch(endpoint, { credentials: 'same-origin', cache: 'no-store' })
      .then(async r => { if (!r.ok) throw new Error('Not available'); return r.json() })
      .then(raw => {
        if (!active) return
        if (preview) {
          const result = trackerDataSchema.safeParse(raw.data)
          if (result.success) setPublication(publishablePackage(result.data.publicProfile, result.data.achievements))
        } else {
          const result = publicationSchema.safeParse(raw)
          if (result.success) setPublication(result.data)
        }
      }).catch(() => {})
    return () => { active = false }
  }, [preview])
  return publication
}
