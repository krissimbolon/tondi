import { authenticated } from './lib/auth'
import { getDraft, getPublication, publish } from './lib/db'
import { json, readJson, sameOrigin } from './lib/http'
import { publishablePackage } from '../src/domain/publication'
import { trackerDataSchema } from '../src/domain/schema'
export async function GET(){
  try{const doc=await getPublication();return json(doc?.published||{format:'tondi/public-v1',publicProfile:{name:'',headline:'',location:'',summary:'',availability:'',email:'',linkedin:'',github:'',institution:'',degree:'',educationPeriod:'',languages:[]},achievements:[]})}
  catch{return json({error:'Publication unavailable'},503)}
}
export async function POST(req:Request){
  if(!authenticated(req))return json({error:'Unauthorized'},401)
  if(!sameOrigin(req))return json({error:'Origin mismatch'},403)
  try{
    const input=await readJson(req,4096) as {version:number}
    if(!Number.isInteger(input.version))return json({error:'Invalid version'},400)
    const doc=await getDraft();if(!doc||doc.version!==input.version)return json({error:'Draft changed; refresh before publish'},409)
    const parsed=trackerDataSchema.safeParse(doc.draft);if(!parsed.success)return json({error:'Data invalid'},422)
    const publicData=publishablePackage(parsed.data.publicProfile,parsed.data.achievements)
    const saved=await publish(publicData,input.version);if(!saved)return json({error:'Conflict'},409)
    return json({version:saved.version,publishedAt:saved.published_at,achievements:publicData.achievements.length})
  }catch{return json({error:'Could not publish'},400)}
}
