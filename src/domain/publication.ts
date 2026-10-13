import published from '../data/published.json' with { type: 'json' }
import { z } from 'zod'
import { achievementSchema, publicProfileSchema, type Achievement, type PublicProfile } from './schema.js'

export const publicationSchema=z.object({
  format:z.literal('tondi/public-v1'),
  publicProfile:publicProfileSchema,
  achievements:z.array(achievementSchema),
})
export type Publication={format:'tondi/public-v1',publicProfile:PublicProfile,achievements:Achievement[]}
export const bundledPublication:Publication=publicationSchema.parse(published)
export function publishablePackage(publicProfile:PublicProfile, achievements:Achievement[]):Publication{
  return publicationSchema.parse({format:'tondi/public-v1',publicProfile,achievements:achievements.filter(a=>a.publiclyVisible && a.provenance!=='simulation' && a.evidences.some(e=>e.visibility==='public' && e.url)).map(a=>({
    ...a, evidences:a.evidences.filter(e=>e.visibility==='public'),
    metrics:a.metrics.filter(m=>m.allowedInCv && m.evidenceIds.some(id=>a.evidences.some(e=>e.id===id&&e.visibility==='public')))
      .map(m=>({...m,evidenceIds:m.evidenceIds.filter(id=>a.evidences.some(e=>e.id===id&&e.visibility==='public'))}))
  }))})
}
