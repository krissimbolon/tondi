import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router'
import { useTracker } from '../store/tracker'
import { createBackup, backupFileName } from '../domain/backup'
import { downloadText } from '../components/download'
import type { TrackerData } from '../domain/schema'

type Mode='checking'|'login'|'setup'|'ready'|'error'|'conflict'
type SyncState='tersimpan'|'menyimpan'|'perubahan belum tersimpan'
interface CloudContextValue {
  mode:Mode; sync:SyncState; message:string; version:number;
  login:(email:string,password:string)=>Promise<string|null>;
  logout:()=>Promise<void>; publish:()=>Promise<string>;
  retry:()=>void;
}
const Context=createContext<CloudContextValue|null>(null)
export function useTondiCloud(){const c=useContext(Context);if(!c)throw new Error('TondiCloud provider missing');return c}
const api=(url:string,init?:RequestInit)=>fetch(url,{credentials:'same-origin',cache:'no-store',...init})
const body=(x:unknown)=>({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(x)})

export function CloudGate({children}:{children:React.ReactNode}){
  const [mode,setMode]=useState<Mode>('checking'), [sync,setSync]=useState<SyncState>('tersimpan')
  const [message,setMessage]=useState(''),[version,setVersion]=useState(0)
  const versionRef=useRef(0),acked=useRef(''),timer=useRef<ReturnType<typeof setTimeout>|null>(null)
  const busy=useRef(false), blocked=useRef(false),unsub=useRef<(()=>void)|null>(null)
  const stop=useCallback(()=>{if(timer.current)clearTimeout(timer.current);timer.current=null;unsub.current?.();unsub.current=null},[])
  const download=()=>downloadText(backupFileName(new Date()),JSON.stringify(createBackup(useTracker.getState().data,new Date()),null,2))
  const flush=useCallback(async ():Promise<boolean>=>{
    if(busy.current||blocked.current)return false
    const data=useTracker.getState().data,serialized=JSON.stringify(data)
    if(serialized===acked.current)return true
    busy.current=true;setSync('menyimpan')
    try{
      const response=await api('/api/tracker',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({version:versionRef.current,data})})
      if(response.status===409){blocked.current=true;setMode('conflict');setMessage('Data di server sudah berubah di perangkat lain. Unduh backup sebelum memuat ulang; tidak ada data yang ditimpa.');return false}
      if(response.status===401){blocked.current=true;setMode('login');setMessage('Sesi kedaluwarsa. Unduh backup sebelum login kembali.');return false}
      if(!response.ok){const d=await response.json().catch(()=>({}));throw new Error(d.error||`HTTP ${response.status}`)}
      const result=await response.json();versionRef.current=result.version;setVersion(result.version);acked.current=serialized
      setSync('tersimpan');setMessage('')
      return true
    }catch(e){blocked.current=true;setSync('perubahan belum tersimpan');setMessage(`Perubahan belum aman di server: ${e instanceof Error?e.message:String(e)}. Unduh backup dan coba kembali.`);return false}
    finally{busy.current=false;const next=JSON.stringify(useTracker.getState().data);if(!blocked.current&&next!==acked.current){if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{void flush()},1500)}}
  },[])
  const subscribe=useCallback(()=>{
    unsub.current?.();unsub.current=useTracker.subscribe(state=>{
      if(blocked.current)return
      if(JSON.stringify(state.data)===acked.current)return
      setSync('perubahan belum tersimpan')
      if(timer.current)clearTimeout(timer.current)
      timer.current=setTimeout(()=>{void flush()},1200)
    })
  },[flush])
  const load=useCallback(async()=>{
    stop();blocked.current=false;setMessage('');setMode('checking')
    try{
      const r=await api('/api/tracker');if(r.status===401){setMode('login');return}
      if(!r.ok)throw new Error('Database belum siap atau tidak tersedia')
      const value=await r.json() as {version:number,data:TrackerData}
      useTracker.getState().replaceAll(value.data)
      versionRef.current=value.version;setVersion(value.version)
      acked.current=JSON.stringify(value.data);setSync('tersimpan');subscribe();setMode('ready')
    }catch(e){setMode('error');setMessage(e instanceof Error?e.message:String(e))}
  },[stop,subscribe])
  useEffect(()=>{(async()=>{try{const r=await api('/api/session');if(!r.ok)throw new Error('Cannot connect to authentication service');const s=await r.json();if(!s.configured){setMode('setup')}else if(s.authenticated){await load()}else{setMode('login')}}catch(e){setMode('error');setMessage(e instanceof Error?e.message:String(e))}})();return()=>{stop()}},[load,stop])
  const login=async(email:string,password:string)=>{
    try{const r=await api('/api/session',body({email,password}));const d=await r.json();if(!r.ok)return d.error||'Login gagal';await load();return null}
    catch{return 'Tidak dapat terhubung ke server'}
  }
  const logout=async()=>{stop();await api('/api/session',{method:'DELETE'}).catch(()=>{});useTracker.getState().reset();setMode('login')}
  const publish=async()=>{
    if(timer.current){clearTimeout(timer.current);timer.current=null}
    let saved=await flush()
    if(!saved&&JSON.stringify(useTracker.getState().data)===acked.current)saved=true
    if(!saved)throw new Error('Selesaikan masalah sinkronisasi sebelum menerbitkan')
    const response=await api('/api/publication',body({version:versionRef.current}))
    const d=await response.json();if(!response.ok){if(response.status===409){blocked.current=true;setMode('conflict')}throw new Error(d.error||'Publikasi gagal')}
    versionRef.current=d.version;setVersion(d.version)
    return `Berhasil diterbitkan: ${d.achievements} capaian publik. Perubahan tampil bagi semua pengunjung.`
  }
  return <Context.Provider value={{mode,sync,message,version,login,logout,publish,retry:()=>{if(mode==='ready'){blocked.current=false;void flush()}else void load()}}}>
    {mode==='ready'?<><UnsavedGuard pending={sync!=='tersimpan'} onBackup={download}/><div className="cloud-banner" role="status"><span><strong>Tondi Studio</strong> · {sync} · revisi {version}</span><button className="btn btn-sm" onClick={()=>void logout()}>Keluar</button></div>{message&&<div className="callout callout-warn">{message}<button className="btn btn-sm" onClick={download}>Unduh backup</button><button className="btn btn-sm" onClick={()=>{blocked.current=false;void flush()}}>Ulangi simpan</button></div>}{children}</>:
      mode==='login'?<LoginForm login={login} message={message} onBackup={download}/>:
      <div className="stack" style={{paddingBlock:48,maxWidth:600,marginInline:'auto'}}><h1>Tondi</h1><div className="card">
      <h2>{mode==='checking'?'Menghubungkan data…':mode==='setup'?'Konfigurasi admin belum selesai':mode==='conflict'?'Konflik penyimpanan':'Layanan belum tersedia'}</h2>
      <p>{mode==='setup'?'Akses editor dinonaktifkan. Administrator perlu memasang koneksi database, email, password hash, dan session secret di Vercel.':message||'Memeriksa sesi dan data.'}</p>
      {mode!=='checking'&&<div className="row"><button className="btn btn-primary" onClick={()=>{void load()}}>Coba lagi</button>{mode==='conflict'&&<button className="btn" onClick={download}>Unduh backup lokal</button>}</div>}
      </div></div>}
  </Context.Provider>
}
function LoginForm({login,message,onBackup}:{login:CloudContextValue['login'],message:string,onBackup:()=>void}){
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false)
  return <section className="card" style={{maxWidth:460,margin:'48px auto'}}><h1>Masuk ke Tondi</h1><p>Studio privat untuk mengelola semua kegiatan, bukti, dan CV-mu.</p>
    <form onSubmit={async e=>{e.preventDefault();setLoading(true);setError(await login(email,password)||'');setLoading(false)}} className="stack">
      <div className="field"><label htmlFor="login-email">Email pemilik</label><input id="login-email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></div>
      <div className="field"><label htmlFor="login-password">Kata sandi</label><input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></div>
      {(error||message)&&<div className="callout callout-danger" role="alert">{error||message}<button className="btn btn-sm" onClick={onBackup} type="button">Backup jika ada data lokal</button></div>}
      <button className="btn btn-primary" disabled={loading} type="submit">{loading?'Memeriksa…':'Masuk'}</button>
    </form></section>
}

function UnsavedGuard({pending,onBackup}:{pending:boolean,onBackup:()=>void}) {
  const blocker=useBlocker(({currentLocation,nextLocation})=>pending && currentLocation.pathname.startsWith('/app') && !nextLocation.pathname.startsWith('/app'))
  useEffect(()=>{
    if(blocker.state!=='blocked')return
    const proceed=window.confirm('Perubahan Tondi belum tersimpan di server. Unduh backup JSON lalu tinggalkan editor?')
    if(proceed){onBackup();blocker.proceed()}else blocker.reset()
  // onBackup is intentionally not a dependency; no re-prompt when the parent rerenders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[blocker.state])
  useEffect(()=>{
    if(!pending)return
    const onBeforeUnload=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';}
    window.addEventListener('beforeunload',onBeforeUnload)
    return()=>window.removeEventListener('beforeunload',onBeforeUnload)
  },[pending])
  return null
}
