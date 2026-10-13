import { useEffect, useMemo, useState } from 'react'
import { Seo } from '../../components/Seo'
import { downloadText } from '../../components/download'
import { trackerDataSchema, type TrackerData } from '../../domain/schema'
import { useTracker } from '../../store/tracker'

const sections: Array<{key:keyof TrackerData;title:string;description:string}>= [
  {key:'opportunities',title:'Kesempatan',description:'Kegiatan, pelatihan, kompetisi, tes, beasiswa dan job offers'},
  {key:'achievements',title:'Capaian dan bukti',description:'Riwayat yang dapat diaudit untuk CV'},
  {key:'applications',title:'Lamaran',description:'Proses seleksi dan hasilnya'},
  {key:'resources',title:'Pustaka resources',description:'Kursus, referensi dan pelatihan'},
  {key:'benchmark',title:'Benchmark pekerjaan',description:'Komparasi kualifikasi lowongan'},
  {key:'roadmap',title:'Roadmap',description:'Rencana belajar mingguan'},
  {key:'capstones',title:'Project templates',description:'Proyek praktik dan target penyelesaian'},
  {key:'weeklyReviews',title:'Catatan aktivitas',description:'Dokumentasi mingguan'},
  {key:'quickstart',title:'Checklist',description:'Langkah awal'},
  {key:'publicProfile',title:'Profil publik',description:'Nama, institusi dan ringkasan CV'},
  {key:'settings',title:'Pengaturan program',description:'Tanggal mulai dan nama pemilik'},
  {key:'competencies',title:'Matriks historis',description:'Data kompatibilitas lama, bukan ukuran kemampuan pada CV'},
]
export default function ContentStudio(){
  const data=useTracker(s=>s.data),replaceAll=useTracker(s=>s.replaceAll)
  const [section,setSection]=useState<keyof TrackerData>('benchmark')
  const [selected,setSelected]=useState(-1),[raw,setRaw]=useState(''),[error,setError]=useState(''),[saved,setSaved]=useState('')
  const value=data[section],isArray=Array.isArray(value)
  const entries=isArray?value as Array<unknown>:[]
  const item=isArray?(selected>=0?entries[selected]:{}):value
  const existing=useMemo(()=>JSON.stringify(item,null,2),[item])
  useEffect(()=>{setRaw(existing);setError('');setSaved('')},[section,selected,existing])
  const changeSection=(v:keyof TrackerData)=>{setSection(v);setSelected(-1)}
  const commit=()=>{
    try{
      const parsed=JSON.parse(raw) as unknown
      const updated=isArray?{...data,[section]:selected<0?[...entries,parsed]:entries.map((v,i)=>i===selected?parsed:v)}:{...data,[section]:parsed}
      const result=trackerDataSchema.safeParse(updated)
      if(!result.success){setError(result.error.issues.slice(0,8).map(x=>`${x.path.join('.')}: ${x.message}`).join('\n'));return}
      replaceAll(result.data);setSaved('Validasi berhasil. Perubahan masuk antrean sinkronisasi server.');setError('')
    }catch(e){setError(e instanceof Error?e.message:String(e))}
  }
  const remove=()=>{
    if(!isArray||selected<0||!window.confirm('Hapus item dari draft?'))return
    const result=trackerDataSchema.safeParse({...data,[section]:entries.filter((_,i)=>i!==selected)})
    if(!result.success){setError(result.error.message);return}
    replaceAll(result.data);setSelected(-1);setSaved('Item dihapus dari draft.')
  }
  const itemName=(v:unknown,i:number)=>{if(!v||typeof v!=='object')return `#${i+1}`;const x=v as Record<string,unknown>;return String(x.title||x.name||x.position||x.action||x.focus||x.org||x.id||`Item ${i+1}`)}
  return <div className="stack"><Seo title="Content Studio" noindex/><div className="page-head"><div><h1>Content Studio</h1><p>Ubah konten Tondi satuan atau per kategori melalui JSON. Semua bagian divalidasi sebelum disimpan, tanpa perubahan source code.</p></div></div>
    <div className="card"><div className="form-grid"><div className="field"><label htmlFor="cs-section">Koleksi</label><select id="cs-section" value={section} onChange={e=>changeSection(e.target.value as keyof TrackerData)}>{sections.map(s=><option key={s.key} value={s.key}>{s.title}</option>)}</select></div>
    {isArray&&<div className="field"><label htmlFor="cs-record">Item</label><select id="cs-record" value={selected} onChange={e=>setSelected(Number(e.target.value))}><option value={-1}>+ Buat item baru</option>{entries.map((v,i)=><option key={i} value={i}>{itemName(v,i)}</option>)}</select></div>}</div>
    <p className="subtle">{sections.find(s=>s.key===section)?.description}. {isArray?`${entries.length} item tersimpan.`:'Objek tunggal.'}</p>
    <div className="field"><label htmlFor="cs-json">Editor JSON {selected<0&&isArray?'(item baru)':''}</label><textarea id="cs-json" value={raw} spellCheck={false} onChange={e=>{setRaw(e.target.value);setSaved('')}} style={{fontFamily:'ui-monospace,Consolas,monospace',minHeight:330,fontSize:12}}/></div>
    {error&&<div className="callout callout-danger" role="alert" style={{whiteSpace:'pre-wrap'}}>{error}</div>}
    {saved&&<div className="callout callout-info" role="status">{saved}</div>}
    <div className="row"><button className="btn btn-primary" onClick={commit}>Validasi & simpan</button><button className="btn" onClick={()=>{setRaw(existing);setError('')}}>Batalkan edit</button><button className="btn" onClick={()=>downloadText(`tondi-${section}.json`,JSON.stringify(value,null,2))}>Export koleksi</button>{isArray&&selected>=0&&<button className="btn" onClick={remove}>Hapus item</button>}</div></div>
    <div className="card"><h2>Batch import</h2><p>Untuk menambahkan daftar kesempatan dan capaian sekaligus, gunakan Import JSON. Editor di sini dipakai untuk mengubah koleksi lain atau merevisi satu item secara presisi.</p><a className="btn" href="/app/impor">Buka Import Center</a></div>
  </div>
}
