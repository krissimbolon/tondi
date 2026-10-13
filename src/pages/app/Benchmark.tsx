import { Badge } from '../../components/Badges'
import { Seo } from '../../components/Seo'
import { formatDate } from '../../domain/dates'
import { useTracker } from '../../store/tracker'

export default function Benchmark() {
  const benchmark = useTracker((s) => s.data.benchmark)
  const achievements = useTracker((s) => s.data.achievements)
  const skills = new Set(achievements.filter(a=>a.evidences.some(e=>e.visibility==='public')).flatMap(a=>a.skillTags.map(x=>x.toLowerCase())))

  return (
    <div className="stack">
      <Seo title="Benchmark" noindex />
      <div className="page-head">
        <div>
          <h1>Benchmark pasar kerja</h1>
          <p>
            Lowongan historis sebagai sumber persyaratan profesional. Tag kompetensi diberi konteks bukti rekam hasil, tanpa penilaian diri.
          </p>
        </div>
      </div>
      <div className="grid grid-2">
        {benchmark.map((b) => (
          <section className="card" key={`${b.org}-${b.position}`}>
            <div className="card-title">
              <h3>
                {b.org} — {b.position}
              </h3>
            </div>
            <p className="subtle">
              {b.location} · Tenggat {formatDate(b.deadline)}
            </p>
            <p>
              <strong>Syarat formal:</strong> {b.formalReq}
              <br />
              <strong>Kompetensi:</strong> {b.competencies}
            </p>
            <div className="row" style={{ marginBottom: 10 }}>
              {b.skillIds.map((sid) => (
                <span key={sid} title={`Skill benchmark ${sid}. Bandingkan dengan bukti proyek/tes yang kamu simpan, bukan skor diri.`}>
                  <Badge tone="neutral">{sid}{skills.has(sid.toLowerCase()) ? ' · ada bukti' : ''}</Badge>
                </span>
              ))}
            </div>
            <div className="callout">{b.statusNote}</div>
            <p style={{ marginTop: 10, marginBottom: 0 }}>
              <a href={b.url} target="_blank" rel="noopener noreferrer">
                Iklan asli ↗
              </a>
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}
