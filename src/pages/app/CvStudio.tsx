import { useState } from 'react'
import { useTondiCloud } from '../../cloud/TondiCloud'
import { Link } from 'react-router'
import { downloadText } from '../../components/download'
import { Seo } from '../../components/Seo'
import { publishablePackage } from '../../domain/publication'
import { publicProfileSchema, type PublicProfile } from '../../domain/schema'
import { useTracker } from '../../store/tracker'

const fields: {key:keyof Omit<PublicProfile,'languages'>;label:string; multiline?:boolean}[]=[
  {key:'name',label:'Nama profesional'}, {key:'headline',label:'Headline spesifik'},
  {key:'location',label:'Lokasi'}, {key:'availability',label:'Ketersediaan kerja/magang'},
  {key:'institution',label:'Institusi pendidikan'}, {key:'degree',label:'Program studi / gelar'},
  {key:'educationPeriod',label:'Periode studi'}, {key:'summary',label:'Ringkasan profesional berbukti',multiline:true},
  {key:'email',label:'Email publik'}, {key:'linkedin',label:'LinkedIn (URL)'},{key:'github',label:'GitHub (URL)'},
]
export default function CvStudio(){
  const cloud=useTondiCloud();const [publishResult,setPublishResult]=useState('');
  const profile=useTracker(s=>s.data.publicProfile),achievements=useTracker(s=>s.data.achievements),update=useTracker(s=>s.updatePublicProfile)
  const clean=publicProfileSchema.safeParse(profile)
  const published=clean.success ? publishablePackage(clean.data,achievements) : null
  const cvCount=published?.achievements.length ?? 0
  return <div className="stack"><Seo title="CV Studio" noindex/><div className="page-head"><div><h1>CV & Profile Studio</h1><p>Seluruh data publik diedit di web, tanpa mengubah file TypeScript. CV hanya menarik capaian dengan izin publikasi, jenis pengalaman yang jelas, dan bukti dapat ditelusuri.</p></div><a className="btn btn-primary" href="/cv?preview=1" target="_blank" rel="noopener noreferrer">Pratinjau CV privat ↗</a></div>
  <div className="callout callout-info">Perubahan draft tersimpan ke database pemilik. Pengunjung hanya melihat versi yang telah kamu terbitkan melalui tombol Publikasikan.</div>
  <section className="card"><h2>Identitas profesional & pendidikan</h2><div className="form-grid">{fields.map(f=><div className={`field${f.multiline?' span-all':''}`} key={f.key}><label htmlFor={'profile-'+f.key}>{f.label}</label>{f.multiline?<textarea id={'profile-'+f.key} rows={4} value={profile[f.key]} onChange={e=>update({[f.key]:e.target.value})}/>:<input id={'profile-'+f.key} value={profile[f.key]} onChange={e=>update({[f.key]:e.target.value})}/>}</div>)}</div></section>
  <section className="card"><div className="card-title"><h2>Bahasa & bukti level</h2><button className="btn btn-sm" onClick={()=>update({languages:[...profile.languages,{name:'',evidence:''}]})}>+ Tambah bahasa</button></div><p className="subtle">Hindari menulis CEFR/IELTS tanpa hasil ujian atau bukti lain.</p>{profile.languages.map((x,i)=><div className="row" key={i}><input aria-label={`Nama bahasa ${i+1}`} placeholder="Bahasa" value={x.name} onChange={e=>update({languages:profile.languages.map((v,j)=>i===j?{...v,name:e.target.value}:v)})}/><input aria-label={`Bukti kemampuan bahasa ${i+1}`} placeholder="Bukti / hasil tes (jika ada)" value={x.evidence} onChange={e=>update({languages:profile.languages.map((v,j)=>i===j?{...v,evidence:e.target.value}:v)})}/><button className="btn btn-sm" onClick={()=>update({languages:profile.languages.filter((_,j)=>i!==j)})}>Hapus</button></div>)}</section>
  {!clean.success && <div className="callout callout-danger" role="alert">URL profil tidak valid. Periksa LinkedIn/GitHub: harus URL lengkap HTTP(S). Snapshot belum bisa diekspor.</div>}
  <section className="card"><h2>Penerbitan CV berbukti</h2><p>{cvCount} capaian memenuhi filter publikasi. Angka hanya ditampilkan ketika memiliki bukti publik dan izin penggunaan pada CV.</p><div className="row"><Link className="btn" to="/app/bukti">Kelola bukti & metrik</Link><button className="btn" disabled={!published} onClick={()=>downloadText('published.json',JSON.stringify(published,null,2))}>Unduh snapshot publik JSON</button><button className="btn btn-primary" disabled={!published} onClick={async()=>{try{setPublishResult(await cloud.publish())}catch(e){setPublishResult(e instanceof Error?e.message:String(e))}}}>Publikasikan ke web</button><a href="/?preview=1" target="_blank" className="btn" rel="noopener noreferrer">Pratinjau privat ↗</a></div><p className="subtle">Draft dan publikasi terpisah. Setelah berhasil diterbitkan, data akan tersedia lewat API publik. Pastikan semua bukti publik memang boleh dibagikan.</p>{publishResult&&<output className="callout callout-info">{publishResult}</output>}</section>
  </div>
}
