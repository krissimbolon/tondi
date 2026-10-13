import { neon } from '@neondatabase/serverless'
import type { TrackerData } from '../../src/domain/schema.js'
import type { Publication } from '../../src/domain/publication.js'
export function sql(){if(!process.env.DATABASE_URL)throw new Error('Database not configured');return neon(process.env.DATABASE_URL)}
export async function getDraft(){
  const rows=await sql()`SELECT draft, version FROM tondi_documents WHERE id=1`
  return rows[0] as undefined | {draft:TrackerData, version:number}
}
export async function writeDraft(data:TrackerData,version:number){
  const db=sql(); const draft=JSON.stringify(data)
  if(version===0){const r=await db`INSERT INTO tondi_documents(id,version,draft) VALUES(1,1,${draft}::jsonb) ON CONFLICT DO NOTHING RETURNING version`;return r[0]?.version as number|undefined}
  const r=await db`UPDATE tondi_documents SET draft=${draft}::jsonb,version=version+1,updated_at=now() WHERE id=1 AND version=${version} RETURNING version`
  return r[0]?.version as number|undefined
}
export async function getPublication(){const r=await sql()`SELECT published, published_at FROM tondi_documents WHERE id=1`;return r[0] as undefined|{published:Publication|null,published_at:string|null}}
export async function publish(data:Publication,version:number){const encoded=JSON.stringify(data);const r=await sql()`UPDATE tondi_documents SET published=${encoded}::jsonb, published_at=now(), version=version+1 WHERE id=1 AND version=${version} RETURNING version,published_at`;return r[0] as undefined|{version:number,published_at:string}}
export async function registerFailedLogin(key:string){await sql()`INSERT INTO tondi_login_attempts(identifier) VALUES(${key})`}
export async function failures(key:string){const r=await sql()`SELECT COUNT(*)::int AS attempts FROM tondi_login_attempts WHERE identifier=${key} AND created_at>now()-interval '15 minutes'`;return Number(r[0]?.attempts||0)}
