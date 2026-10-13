export const json = (data: unknown, status=200, headers:Record<string,string>={}) => new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}})
export const noStore = () => ({'Cache-Control':'no-store'});
export function sameOrigin(req:Request):boolean {
  const origin=req.headers.get('origin');
  if(!origin) return false;
  try{return new URL(origin).origin===new URL(req.url).origin;}catch{return false}
}
export async function readJson(req:Request, max=750_000):Promise<unknown> {
  if(!(req.headers.get('content-type')||'').startsWith('application/json'))throw new Error('Content-Type must be application/json')
  const len=Number(req.headers.get('content-length')||0);if(len>max)throw new Error('Request too large')
  const text=await req.text();if(text.length>max)throw new Error('Request too large')
  return JSON.parse(text)
}
