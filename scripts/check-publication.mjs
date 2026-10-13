#!/usr/bin/env node
import { readFileSync } from 'node:fs'
const p=JSON.parse(readFileSync(new URL('../src/data/published.json',import.meta.url),'utf8'))
if(p.format!=='tondi/public-v1'||!Array.isArray(p.achievements)||!p.publicProfile||typeof p.publicProfile!=='object') throw Error('Format publikasi tidak valid')
const errs=[]
for(const a of p.achievements){
  if(!a.publiclyVisible) errs.push(`Tidak boleh menerbitkan item privat: ${a.id}`)
  for(const e of a.evidences||[]) if(e.visibility!=='public')errs.push(`Bukti privat ikut dalam publikasi: ${a.id}/${e.id}`)
  if(a.provenance==='simulation' && (a.metrics||[]).length)errs.push(`Simulasi tidak boleh mengandung metrik klaim publik: ${a.id}`)
  for(const m of a.metrics||[])if(!m.evidenceIds?.some(id=>a.evidences?.some(e=>e.id===id&&e.visibility==='public')))errs.push(`Metrik tanpa bukti publik: ${a.id}/${m.id}`)
}
if(errs.length){console.error(errs.join('\n'));process.exit(1)}
console.log(`✔ Published snapshot valid: ${p.achievements.length} achievements. Tidak ada bukti privat.`)
