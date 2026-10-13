import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
const scrypt=promisify(scryptCallback)
const COOKIE='__Host-tondi_session'
const LOCAL_COOKIE='tondi_session'
const AGE=8*60*60
const key=()=>process.env.TONDI_SESSION_SECRET||''
export const configured=()=>Boolean(process.env.TONDI_ADMIN_EMAIL && process.env.TONDI_ADMIN_PASSWORD_HASH && key().length>=32 && process.env.DATABASE_URL)
function mac(message:string) {return createHmac('sha256',key()).update(message).digest('base64url')}
export async function passwordValid(email:string,password:string){
  const user=process.env.TONDI_ADMIN_EMAIL||''
  const encoded=process.env.TONDI_ADMIN_PASSWORD_HASH||''
  const [scheme,salt,reference]=encoded.split('$')
  if(!configured() || scheme!=='scrypt' || !salt || !reference || password.length>256) return false
  const derived=await scrypt(password,salt,64) as Buffer
  const expected=Buffer.from(reference,'hex')
  const pwOk=expected.length===derived.length&&timingSafeEqual(derived,expected)
  const a=Buffer.from(email.trim().toLowerCase().padEnd(250,' '))
  const b=Buffer.from(user.trim().toLowerCase().padEnd(250,' '))
  return a.length===b.length&&timingSafeEqual(a,b)&&pwOk
}
function token(){const msg=`v1.${Math.floor(Date.now()/1000)+AGE}.${randomBytes(16).toString('hex')}.${process.env.TONDI_SESSION_VERSION||'1'}`;return `${msg}.${mac(msg)}`}
function secure(req:Request){return new URL(req.url).protocol==='https:'}
export function sessionCookie(req:Request){const name=secure(req)?COOKIE:LOCAL_COOKIE;return `${name}=${token()}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${AGE}${secure(req)?'; Secure':''}`}
export function clearCookie(req:Request){return `${secure(req)?COOKIE:LOCAL_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure(req)?'; Secure':''}`}
export function authenticated(req:Request):boolean{
  if(!configured())return false
  const m=(req.headers.get('cookie')||'').match(/(?:^|;\s*)(?:__Host-tondi_session|tondi_session)=([^;]+)/)
  if(!m)return false
  const t=decodeURIComponent(m[1]);const parts=t.split('.');if(parts.length!==5||parts[0]!=='v1')return false
  const msg=parts.slice(0,4).join('.');const expected=mac(msg)
  const a=Buffer.from(parts[4]);const b=Buffer.from(expected)
  if(a.length!==b.length||!timingSafeEqual(a,b))return false
  return Number(parts[1])>Date.now()/1000 && parts[3]===(process.env.TONDI_SESSION_VERSION||'1')
}
