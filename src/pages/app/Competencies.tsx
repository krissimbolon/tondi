import { useMemo, useState } from 'react'
import { Badge } from '../../components/Badges'
import { ScoreSelect } from '../../components/ScoreSelect'
import { SelectField } from '../../components/SelectField'
import { Seo } from '../../components/Seo'
import { todayIso } from '../../domain/dates'
import { competencyGap, readiness } from '../../domain/metrics'
import { COMPETENCY_STATUSES, PRIORITIES, type Competency } from '../../domain/schema'
import { useTracker } from '../../store/tracker'

const RUBRIC = [
  [1, 'Belum bisa'],
  [2, 'Bisa dengan tutorial'],
  [3, 'Mandiri untuk tugas sederhana'],
  [4, 'Mandiri, terdokumentasi, lolos review'],
  [5, 'Bisa membimbing & menyelesaikan variasi kompleks'],
] as const

const ALL = 'Semua'

export default function Competencies() {
  const competencies = useTracker((s) => s.data.competencies)
  const update = useTracker((s) => s.updateCompetency)
  const [priority, setPriority] = useState<string>(ALL)
  const [domain, setDomain] = useState<string>(ALL)

  const domains = useMemo(() => [ALL, ...new Set(competencies.map((c) => c.domain))], [competencies])
  const rows = competencies.filter(
    (c) => (priority === ALL || c.priority === priority) && (domain === ALL || c.domain === domain),
  )
  const ready = readiness(competencies)

  const setScore = (c: Competency, key: 'baseline' | 'current', value: number | null) =>
    update(c.id, {
      [key]: value,
      lastTested: value === null ? c.lastTested : todayIso(),
      status: value !== null && c.status === 'Belum diuji' ? 'Diuji' : c.status,
    })

  return (
    <div className="stack">
      <Seo title="Kompetensi" noindex />
      <div className="page-head">
        <div>
          <h1>Kompetensi & acceptance gates</h1>
          <p>
            20 kompetensi dari playbook. Skor hanya diisi setelah diuji — catat metode ujinya. Target praktis
            skill kritis = 4. Kesiapan saat ini:{' '}
            <strong>{ready.percent === null ? 'belum ada skill teruji' : `${ready.percent}%`}</strong> (
            {ready.tested}/{ready.total} teruji).
          </p>
        </div>
      </div>

      <details className="card">
        <summary>
          <strong>Rubrik penilaian 1–5</strong> <span className="subtle">(klik untuk melihat)</span>
        </summary>
        <ol style={{ margin: '12px 0 0', paddingLeft: 18 }}>
          {RUBRIC.map(([n, t]) => (
            <li key={n} value={n}>
              {t}
            </li>
          ))}
        </ol>
        <p className="subtle" style={{ margin: '8px 0 0' }}>
          Jangan isi angka berdasarkan rasa percaya diri saja. “Divalidasi” = lolos review pihak lain dengan
          bukti.
        </p>
      </details>

      <div className="row">
        <div style={{ minWidth: 160 }}>
          <SelectField
            label="Prioritas"
            value={priority}
            options={[ALL, ...PRIORITIES]}
            onChange={setPriority}
          />
        </div>
        <div style={{ minWidth: 160 }}>
          <SelectField label="Domain" value={domain} options={domains} onChange={setDomain} />
        </div>
        <span className="spacer" />
        <span className="subtle">{rows.length} kompetensi</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Kompetensi</th>
              <th>Baseline</th>
              <th>Saat ini</th>
              <th className="num">Target</th>
              <th className="num">Gap</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const gap = competencyGap(c)
              const needsMethod = (c.baseline !== null || c.current !== null) && !c.testMethod.trim()
              return (
                <tr key={c.id}>
                  <td className="mono">{c.id}</td>
                  <td style={{ minWidth: 260 }}>
                    <strong>{c.name}</strong> <Badge>{c.priority}</Badge>
                    <div className="subtle">
                      {c.domain} · Gate: {c.evidence} · {c.resourceIds.join(', ')}
                    </div>
                    <label htmlFor={`m-${c.id}`} className="sr-only">
                      Metode uji {c.id}
                    </label>
                    <input
                      id={`m-${c.id}`}
                      value={c.testMethod}
                      placeholder="Metode uji, mis. tes Excel 30 menit dinilai dosen"
                      aria-invalid={needsMethod || undefined}
                      onChange={(e) => update(c.id, { testMethod: e.target.value })}
                      style={{ marginTop: 6, ...(needsMethod ? { borderColor: 'var(--warn)' } : {}) }}
                    />
                    {needsMethod ? <div className="subtle">Isi metode uji untuk skor ini.</div> : null}
                  </td>
                  <td>
                    <ScoreSelect
                      label={`Baseline ${c.id}`}
                      value={c.baseline}
                      min={1}
                      max={5}
                      onChange={(v) => setScore(c, 'baseline', v)}
                    />
                  </td>
                  <td>
                    <ScoreSelect
                      label={`Skor saat ini ${c.id}`}
                      value={c.current}
                      min={1}
                      max={5}
                      onChange={(v) => setScore(c, 'current', v)}
                    />
                  </td>
                  <td className="num">{c.target}</td>
                  <td className="num">
                    {gap === null ? (
                      <span className="subtle">—</span>
                    ) : gap === 0 ? (
                      <Badge tone="ok">0</Badge>
                    ) : (
                      <Badge tone={gap >= 2 ? 'danger' : 'warn'}>{String(gap)}</Badge>
                    )}
                  </td>
                  <td>
                    <SelectField
                      hideLabel
                      label={`Status ${c.id}`}
                      value={c.status}
                      options={COMPETENCY_STATUSES}
                      onChange={(status) => update(c.id, { status })}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
