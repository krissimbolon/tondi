import { useState } from 'react'
import { StatusBadge } from '../../components/Badges'
import { SelectField } from '../../components/SelectField'
import { Seo } from '../../components/Seo'
import { WORK_STATUSES, type Capstone } from '../../domain/schema'
import { useTracker } from '../../store/tracker'

function isHttpUrl(value: string) {
  try {
    const u = new URL(value)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

function EvidenceLinks({ p }: { p: Capstone }) {
  const update = useTracker((s) => s.updateCapstone)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const valid = label.trim() !== '' && isHttpUrl(url)

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    update(p.id, { evidenceLinks: [...p.evidenceLinks, { label: label.trim(), url: url.trim() }] })
    setLabel('')
    setUrl('')
  }

  return (
    <div>
      <h3>Link bukti</h3>
      {p.evidenceLinks.length === 0 ? (
        <p className="subtle">Belum ada bukti.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {p.evidenceLinks.map((l, i) => (
            <li key={`${l.url}-${i}`}>
              <a href={l.url} target="_blank" rel="noopener noreferrer">
                {l.label}
              </a>{' '}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                aria-label={`Hapus ${l.label}`}
                onClick={() => update(p.id, { evidenceLinks: p.evidenceLinks.filter((_, j) => j !== i) })}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <form className="row" onSubmit={add}>
        <label className="sr-only" htmlFor={`l-${p.id}`}>
          Nama bukti
        </label>
        <input
          id={`l-${p.id}`}
          placeholder="Nama, mis. Charter v1"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ flex: '1 1 140px', width: 'auto' }}
        />
        <label className="sr-only" htmlFor={`u-${p.id}`}>
          URL bukti
        </label>
        <input
          id={`u-${p.id}`}
          type="url"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: '2 1 200px', width: 'auto' }}
        />
        <button type="submit" className="btn btn-sm" disabled={!valid}>
          Tambah
        </button>
      </form>
    </div>
  )
}

export default function Capstones() {
  const capstones = useTracker((s) => s.data.capstones)
  const update = useTracker((s) => s.updateCapstone)

  return (
    <div className="stack">
      <Seo title="Capstone" noindex />
      <div className="page-head">
        <div>
          <h1>Capstone P1–P4</h1>
          <p>
            Capstone lama tetap menjadi agenda belajar privat. Untuk portofolio, catat hasil yang selesai di menu Hasil & bukti, lalu terbitkan snapshot melalui CV Studio.
          </p>
        </div>
      </div>
      {capstones.map((p) => (
        <section key={p.id} className="card" aria-labelledby={`cap-${p.id}`}>
          <div className="card-title">
            <h2 id={`cap-${p.id}`}>
              <span className="mono subtle">{p.id}</span> {p.name}
            </h2>
            <StatusBadge status={p.status} />
          </div>
          <p className="subtle">
            {p.track} · {p.period}
          </p>
          <div className="provenance" style={{ marginBottom: 12 }}>
            <strong>Provenance:</strong> {p.provenance}
          </div>
          <div className="grid grid-2">
            <div>
              <p>
                <strong>Artefak keluaran:</strong> {p.outputs}
              </p>
              <p>
                <strong>Acceptance gate:</strong> {p.gate}
              </p>
              <div style={{ maxWidth: 220 }}>
                <SelectField
                  label="Status"
                  value={p.status}
                  options={WORK_STATUSES}
                  onChange={(status) => update(p.id, { status })}
                />
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label htmlFor={`n-${p.id}`}>Catatan</label>
                <textarea
                  id={`n-${p.id}`}
                  value={p.notes}
                  placeholder="Reviewer, feedback, revisi berikutnya…"
                  onChange={(e) => update(p.id, { notes: e.target.value })}
                />
              </div>
            </div>
            <EvidenceLinks p={p} />
          </div>
        </section>
      ))}
    </div>
  )
}
