import { Badge, StatusBadge } from '../../components/Badges'
import { SelectField } from '../../components/SelectField'
import { Seo } from '../../components/Seo'
import { formatDate, todayIso } from '../../domain/dates'
import { programmeWeek } from '../../domain/metrics'
import { WORK_STATUSES, type RoadmapWeek } from '../../domain/schema'
import { useTracker } from '../../store/tracker'

const SPRINTS = [
  { id: 'A', name: 'Foundation', from: 1, to: 6 },
  { id: 'B', name: 'MEAL & Data', from: 7, to: 12 },
  { id: 'C', name: 'Event & Partnerships', from: 13, to: 18 },
  { id: 'D', name: 'Research & Market Entry', from: 19, to: 24 },
]

function WeekCard({ w, isCurrent }: { w: RoadmapWeek; isCurrent: boolean }) {
  const updateWeek = useTracker((s) => s.updateWeek)
  const doneWithoutEvidence = w.status === 'Selesai' && !w.evidenceLink.trim()
  return (
    <div className={`week${isCurrent ? ' is-current' : ''}`}>
      <div className="week-num">
        <small>Minggu</small>
        {w.week}
      </div>
      <details open={isCurrent}>
        <summary>
          <div className="row">
            <strong style={{ flex: 1, minWidth: 0 }}>{w.focus}</strong>
            {isCurrent ? <Badge tone="accent">Minggu ini</Badge> : null}
            <StatusBadge status={w.status} />
          </div>
          <div className="subtle">
            {formatDate(w.start)} · Evidence: {w.evidence}
          </div>
        </summary>
        <div className="stack" style={{ marginTop: 12 }}>
          <p style={{ margin: 0 }}>
            <strong>Tugas wajib:</strong> {w.tasks}
            <br />
            <span className="subtle">Resources: {w.resourceIds.join(', ')}</span>
          </p>
          <div className="form-grid">
            <SelectField
              label="Status"
              value={w.status}
              options={WORK_STATUSES}
              onChange={(status) => updateWeek(w.week, { status })}
            />
            <div className="field">
              <label htmlFor={`ev-${w.week}`}>Link bukti</label>
              <input
                id={`ev-${w.week}`}
                type="url"
                placeholder="https://drive… / github…"
                value={w.evidenceLink}
                onChange={(e) => updateWeek(w.week, { evidenceLink: e.target.value })}
              />
            </div>
            <div className="field span-all">
              <label htmlFor={`qa-${w.week}`}>Catatan QA</label>
              <textarea
                id={`qa-${w.week}`}
                value={w.qaNote}
                placeholder="File bisa dibuka? Ada sumber? Angka bisa dihitung ulang? Sudah direview eksternal?"
                onChange={(e) => updateWeek(w.week, { qaNote: e.target.value })}
              />
            </div>
          </div>
          {doneWithoutEvidence ? (
            <div className="callout callout-warn">
              <strong>Perhatian:</strong> status Selesai tanpa link bukti. Sesuai playbook, tanpa bukti yang
              bisa diperiksa statusnya tetap Review.
            </div>
          ) : null}
          {w.doneDate ? <span className="subtle">Selesai pada {formatDate(w.doneDate)}</span> : null}
        </div>
      </details>
    </div>
  )
}

export default function Roadmap() {
  const roadmap = useTracker((s) => s.data.roadmap)
  const startDate = useTracker((s) => s.data.settings.startDate)
  const current = programmeWeek(startDate, todayIso())

  return (
    <div>
      <Seo title="Roadmap" noindex />
      <div className="page-head">
        <div>
          <h1>Roadmap 24 minggu</h1>
          <p>
            Satu minggu = satu bukti kerja. Tandai <strong>Review</strong> sampai bukti lolos evidence review;
            baru kemudian <strong>Selesai</strong>.
          </p>
        </div>
      </div>
      <div className="stack">
        {SPRINTS.map((s) => {
          const weeks = roadmap.filter((w) => w.week >= s.from && w.week <= s.to)
          const done = weeks.filter((w) => w.status === 'Selesai').length
          return (
            <section key={s.id} aria-labelledby={`sprint-${s.id}`}>
              <div className="section-head" style={{ marginBottom: 10 }}>
                <h2 id={`sprint-${s.id}`}>
                  Sprint {s.id}: {s.name}{' '}
                  <span className="subtle">
                    · Minggu {s.from}–{s.to}
                  </span>
                </h2>
                <span className="subtle">
                  {done}/{weeks.length} selesai
                </span>
              </div>
              <div className="week-list">
                {weeks.map((w) => (
                  <WeekCard key={w.week} w={w} isCurrent={w.week === current} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
