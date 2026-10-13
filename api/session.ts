import { createHmac } from 'node:crypto'
import { authenticated, clearCookie, configured, passwordValid, sessionCookie } from './lib/auth'
import { failures, registerFailedLogin } from './lib/db'
import { json, readJson, sameOrigin } from './lib/http'
export function GET(req:Request){return json({authenticated:authenticated(req),configured:configured()})}
export async function POST(req:Request){
  if(!sameOrigin(req))return json({error:'Origin mismatch'},403)
  if(!configured())return json({error:'Server belum dikonfigurasi'},503)
  try{
    const input=await readJson(req,4096) as {email?:string,password?:string}
    if(typeof input.email!=='string'||typeof input.password!=='string')return json({error:'Kredensial tidak valid'},400)
    const ip=req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-real-ip')||'unknown'
    const key=createHmac('sha256',process.env.TONDI_SESSION_SECRET!).update(ip).digest('hex')
    if(await failures(key)>=7)return json({error:'Terlalu banyak percobaan. Coba lagi setelah 15 menit.'},429)
    if(!await passwordValid(input.email,input.password)){
      await registerFailedLogin(key)
      return json({error:'Email atau password tidak sesuai'},401)
    }
    return json({authenticated:true},200,{'Set-Cookie':sessionCookie(req)})
  }catch{return json({error:'Login gagal'},400)}
}
export function DELETE(req:Request){if(!sameOrigin(req))return json({error:'Origin mismatch'},403);return json({authenticated:false},200,{'Set-Cookie':clearCookie(req)})}
