import { authenticated } from './lib/auth'
import { getDraft, writeDraft } from './lib/db'
import { json, readJson, sameOrigin } from './lib/http'
import { trackerDataSchema } from '../src/domain/schema'
import { createSeed } from '../src/data/seed'
export async function GET(req:Request){
  if(!authenticated(req))return json({error:'Unauthorized'},401)
  try{const doc=await getDraft();return json(doc?{data:doc.draft,version:doc.version}:{data:createSeed(),version:0})}
  catch{return json({error:'Database unavailable or schema not initialized'},503)}
}
export async function PUT(req:Request){
  if(!authenticated(req))return json({error:'Unauthorized'},401)
  if(!sameOrigin(req))return json({error:'Origin mismatch'},403)
  try{
    const input=await readJson(req,1_200_000) as {version:number,data:unknown}
    if(!Number.isInteger(input.version)||input.version<0)return json({error:'Invalid version'},400)
    const result=trackerDataSchema.safeParse(input.data)
    if(!result.success)return json({error:'Data tidak lolos validasi',issues:result.error.issues.slice(0,8)},422)
    const version=await writeDraft(result.data,input.version)
    if(version===undefined)return json({error:'Conflict: server updated elsewhere'},409)
    return json({version})
  }catch{return json({error:'Failed to save. No changes committed.'},400)}
}
