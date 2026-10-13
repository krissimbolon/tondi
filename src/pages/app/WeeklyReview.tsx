import { useState } from 'react'
import { Seo } from '../../components/Seo'
import { formatDate, todayIso } from '../../domain/dates'
import { programmeWeek, TOTAL_WEEKS } from '../../domain/metrics'
import type { WeeklyReview as Review } from '../../domain/schema'
import { useTracker } from '../../store/tracker'

const QA_QUESTIONS = [
  'Apakah file dapat dibuka?',
  'Ada sumber untuk setiap angka/klaim?',
  'Angka bisa dihitung ulang?',
  'Penulis/peran jelas?',
  'Ada klaim yang tidak didukung bukti?',
  'Sudah direview pihak eksternal?',
]

const TEXT_FIELDS: { key: keyof Review; label: string; hint: string }[] = [
  { key: 'newEvidence', label: 'Bukti baru', hint: 'Artefak apa yang dihasilkan minggu ini? Sertakan link.' },
  {
    key: 'skillsTested',
    label: 'Tes, lomba, proyek, dan sertifikat yang diselesaikan',
    hint: 'Rinci aktivitas, hasil, organisasi penyelenggara, dan URL bukti. Rekam di Evidence ledger.' ,
  },
  { key: 'applications', label: 'Lamaran / EOI', hint: 'Posisi yang dilamar atau EOI yang dikirim.' },
  { key: 'blockers', label: 'Blocker', hint: 'Apa yang menghambat? Butuh bantuan siapa?' },
  { key: 'nextActions', label: 'Aksi minggu depan', hint: 'Maksimal 3 aksi konkret.' },
]

export default function WeeklyReview() {
  const reviews = useTracker((s) => s.data.weeklyReviews)
  const startDate = useTracker((s) => s.data.settings.startDate)
  const updateReview = useTracker((s) => s.updateReview)
  const current = Math.min(Math.max(programmeWeek(startDate, todayIso()), 1), TOTAL_WEEKS)
  const [selected, setSelected] = useState(current)
  const r = reviews.find((x) => x.week === selected)
  const filled = reviews.filter((x) => x.hours !== null || x.newEvidence.trim()).length

  return (
    <div className="stack">
      <Seo title="Weekly review" noindex />
      <div className="page-head">
        <div>
          <h1>Weekly review</h1>
          <p>Evidence review 30–45 menit di akhir setiap minggu. {filled} dari 24 minggu sudah diisi.</p>
        </div>
        <div className="field" style={{ minWidth: 200 }}>
          <label htmlFor="week-select">Minggu</label>
          <select id="week-select" value={selected} onChange={(e) => setSelected(Number(e.target.value))}>
            {reviews.map((x) => (
              <option key={x.week} value={x.week}>
                Minggu {x.week} — {formatDate(x.date)}
                {x.week === current ? ' (sekarang)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {r ? (
          <section className="card" aria-labelledby="review-form">
            <h2 id="review-form">
              Review minggu {r.week} <span className="subtle">· {formatDate(r.date)}</span>
            </h2>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="hours">Jam fokus aktual</label>
                <input
                  id="hours"
                  type="number"
                  min={0}
                  max={168}
                  step={0.5}
                  inputMode="decimal"
                  value={r.hours ?? ''}
                  onChange={(e) =>
                    updateReview(r.week, { hours: e.target.value === '' ? null : Number(e.target.value) })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="eng">Sesi English</label>
                <input
                  id="eng"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={r.englishSessions ?? ''}
                  onChange={(e) =>
                    updateReview(r.week, {
                      englishSessions: e.target.value === '' ? null : Math.round(Number(e.target.value)),
                    })
                  }
                />
              </div>
              {TEXT_FIELDS.map((f) => (
                <div className="field span-all" key={f.key}>
                  <label htmlFor={`f-${f.key}`}>{f.label}</label>
                  <textarea
                    id={`f-${f.key}`}
                    placeholder={f.hint}
                    value={String(r[f.key] ?? '')}
                    onChange={(e) => updateReview(r.week, { [f.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <p className="subtle" style={{ marginTop: 12, marginBottom: 0 }}>
              Tersimpan otomatis di browser ini.
            </p>
          </section>
        ) : null}

        <aside className="stack">
          <section className="card">
            <h2>Checklist QA bukti</h2>
            <p className="subtle">Jika ada jawaban “belum”, status minggu tetap Review — bukan Selesai.</p>
            <ol style={{ paddingLeft: 18, margin: 0 }}>
              {QA_QUESTIONS.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </section>
          <section className="card">
            <h2>Target alokasi waktu</h2>
            <p className="muted" style={{ marginBottom: 8 }}>
              20–25 jam/minggu, menyesuaikan kuliah & tugas akhir.
            </p>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li>35% capstone</li>
              <li>25% course & dokumentasi</li>
              <li>20% English</li>
              <li>10% networking/volunteering</li>
              <li>10% review lamaran</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
