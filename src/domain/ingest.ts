import { z } from 'zod'
import { achievementSchema, opportunitySchema, type Achievement, type Opportunity } from './schema'
import { opportunityKey } from './records'

/** Stable externally authored interchange format; no private CV contents in automated leads. */
export const importPackageSchema = z.object({
  format: z.enum(['tondi/import-v1','career-launchpad/import-v1']),
  opportunities: z.array(opportunitySchema).max(1500).default([]),
  achievements: z.array(achievementSchema).max(500).default([]),
}).refine(p => p.opportunities.length+p.achievements.length>0, {message:'Paket harus memuat minimal satu item'})

export type ImportPackage = z.infer<typeof importPackageSchema>
export type ImportPreview = {ok:true; package:ImportPackage; inserted:number; conflicts:number; duplicates:number; warnings:string[]} | {ok:false; errors:string[]}

export function parseImport(input: string, existing: {opportunities:Opportunity[];achievements:Achievement[]}):ImportPreview {
  if(new Blob([input]).size>2_000_000) return {ok:false,errors:['Ukuran JSON melebihi 2 MB. Pecah menjadi beberapa batch.']}
  let payload:unknown
  try{ payload=JSON.parse(input) }catch{return {ok:false, errors:['JSON tidak valid: cek koma, tanda kutip, dan kurung.']}}
  // Support one direct item, array of opportunities, or the canonical mixed batch envelope.
  if(Array.isArray(payload)) payload={format:'tondi/import-v1',opportunities:payload,achievements:[]}
  else if(payload && typeof payload==='object' && !('format' in payload) && 'type' in payload && 'organizer' in payload) payload={format:'tondi/import-v1',opportunities:[payload],achievements:[]}
  const res=importPackageSchema.safeParse(payload)
  if(!res.success) return {ok:false,errors:res.error.issues.slice(0,15).map(i=>`${i.path.join('.')||'root'}: ${i.message}`)}
  const ids=new Set<string>();const naturalKeys=new Set<string>();const warnings:string[]=[];let duplicates=0;let conflicts=0;let inserted=0
  const oppIds=new Set(existing.opportunities.map(o=>o.id))
  const existingKeys=new Set(existing.opportunities.map(opportunityKey))
  for(const o of res.data.opportunities){
    const key=opportunityKey(o)
    if(ids.has('o:'+o.id) || naturalKeys.has(key)){duplicates++;warnings.push(`Duplikat dalam paket: ${o.title}`)}
    else if(oppIds.has(o.id) || existingKeys.has(key)){conflicts++;warnings.push(`Sudah ada: ${o.organizer} — ${o.title}`)}
    else inserted++
    ids.add('o:'+o.id);naturalKeys.add(key)
  }
  const achIds=new Set(existing.achievements.map(a=>a.id)); const batchIds=new Set<string>()
  for(const a of res.data.achievements){
    if(batchIds.has(a.id)){duplicates++; warnings.push(`Duplikat achievement: ${a.title}`)}
    else if(achIds.has(a.id)){conflicts++;warnings.push(`Achievement sudah ada: ${a.title}`)}
    else inserted++
    batchIds.add(a.id)
  }
  return {ok:true,package:res.data,inserted,conflicts,duplicates,warnings:warnings.slice(0,25)}
}

export function normalizePackage(pkg:ImportPackage):ImportPackage {
  const opp=new Map<string,Opportunity>();const natural=new Set<string>()
  for(const o of pkg.opportunities){const k=opportunityKey(o);if(!opp.has(o.id)&&!natural.has(k)){opp.set(o.id,o);natural.add(k)}}
  const ach=new Map<string,Achievement>();for(const a of pkg.achievements)if(!ach.has(a.id))ach.set(a.id,a)
  return {...pkg,opportunities:[...opp.values()],achievements:[...ach.values()]}
}
