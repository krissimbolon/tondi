import { Link } from 'react-router'
import { Seo } from '../../components/Seo'
import { getLastExport } from '../../components/download'
import { Kpi } from '../../components/Kpi'
import { daysBetween,formatDate,todayIso } from '../../domain/dates'
import { proofSummary } from '../../domain/records'
import { useTracker } from '../../store/tracker'

export default function Dashboard(){
  const data=useTracker(s=>s.data), today=todayIso(),summary=proofSummary(data.achievements)
  const open=data.opportunities.filter(o=>['discovered','open','applied','accepted'].includes(o.status))
  const deadlines=open.filter(o=>o.deadline&&daysBetween(today,o.deadline)<=14).sort((a,b)=>(a.deadline??'').localeCompare(b.deadline??''))
  const upcoming=data.opportunities.filter(o=>o.startDate&&daysBetween(today,o.startDate)>=0&&daysBetween(today,o.startDate)<=30).sort((a,b)=>(a.startDate??'').localeCompare(b.startDate??''))
  const lastExport=getLastExport(),backupStale=!lastExport||daysBetween(lastExport.slice(0,10),today)>7
  return <div className="stack"><Seo title="Dashboard" noindex/><div className="page-head"><div><h1>Beranda Tondi</h1><p>Kelola kesempatan yang bisa diikuti dan dokumentasikan hasil yang benar-benar dapat dibuktikan · {formatDate(today)}.</p></div><Link className="btn btn-primary" to="/app/impor">+ Impor peluang JSON</Link></div>
    {backupStale&&<div className="callout callout-warn"><strong>Backup diperlukan:</strong> Simpan cadangan terpisah walaupun data draft telah tersinkronisasi ke server. <Link to="/app/pengaturan">Export backup JSON →</Link></div>}
    <div className="grid grid-kpi"><Kpi label="Peluang dipantau" value={data.opportunities.length}/><Kpi label="Terbuka / ditinjau" value={open.length}/><Kpi label="Rekam hasil" value={summary.total}/><Kpi label="Dengan bukti publik" value={summary.credentialled}/><Kpi label="Metrik siap CV" value={summary.metricCount}/><Kpi label="Lamaran terkirim" value={data.applications.filter(a=>['Dikirim','Tes/Interview','Diterima','Ditolak'].includes(a.status)).length}/></div>
    <div className="grid grid-2"><section className="card"><div className="card-title"><h2>Deadline terdekat</h2><Link to="/app/peluang">Semua peluang →</Link></div>{deadlines.length?deadlines.slice(0,12).map(o=><div className="row" key={o.id} style={{marginBottom:10}}><div style={{flex:1}}><strong>{o.title}</strong><div className="subtle">{o.organizer} · {o.deadline}</div></div><span className="badge badge-info">{o.type}</span></div>):<p className="muted">Belum ada tenggat yang terdata untuk 14 hari ke depan.</p>}</section>
    <section className="card"><div className="card-title"><h2>Agenda 30 hari</h2><Link to="/app/peluang">Pipeline →</Link></div>{upcoming.length?upcoming.slice(0,12).map(o=><div className="row" key={o.id} style={{marginBottom:10}}><div style={{flex:1}}><strong>{o.title}</strong><div className="subtle">{o.startDate} · {o.organizer}</div></div></div>):<p className="muted">Belum ada kegiatan yang diimpor untuk 30 hari ke depan.</p>}</section></div>
    <div className="grid grid-2"><section className="card"><h2>Bangun bukti, bukan skor diri</h2><p>Setelah mengikuti suatu kegiatan, dokumentasikan kontribusi, hasil, baseline, periode evaluasi, metrik, dan sumber resmi. Semua klaim dapat ditinjau sebelum masuk CV.</p><Link to="/app/bukti" className="btn">Rekam hasil & metrik →</Link></section><section className="card"><h2>CV berbasis rekam jejak</h2><p>CV Studio mengambil achievement yang memiliki izin publikasi dan bukti publik. Simulasi, partisipasi, dan pengalaman kerja tidak dicampuradukkan.</p><Link to="/app/cv-studio" className="btn">Buka CV Studio →</Link></section></div>
    <section className="card"><h2>Sumber lain tetap tersedia</h2><div className="row"><Link to="/app/resources">40 resources belajar →</Link><Link to="/app/roadmap">Roadmap →</Link><Link to="/app/lamaran">Pipeline lamaran →</Link><Link to="/app/benchmark">Benchmark lowongan →</Link></div><p className="subtle">Matriks penilaian pribadi lama tidak digunakan untuk menentukan kesiapan. Standar sekarang bersumber dari lowongan nyata dan bukti pekerjaan yang dapat ditelusuri.</p></section>
  </div>
}
