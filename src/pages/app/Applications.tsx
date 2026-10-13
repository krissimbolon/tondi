import { useState } from 'react'
import { Badge, StatusBadge } from '../../components/Badges'
import { downloadText } from '../../components/download'
import { SelectField } from '../../components/SelectField'
import { Seo } from '../../components/Seo'
import { toCsv } from '../../domain/backup'
import { daysBetween, formatDate, todayIso } from '../../domain/dates'
import { goNoGoVerdict } from '../../domain/metrics'
import {
  APPLICATION_STATUSES,
  ELIGIBILITY,
  type Application,
  type ApplicationStatus,
  type GoNoGo,
} from '../../domain/schema'
import { useTracker } from '../../store/tracker'

const GO_NO_GO: { key: keyof GoNoGo; label: string }[] = [
  { key: 'eligible', label: 'A. Eligible: kewarganegaraan, gelar, pengalaman, usia, izin' },
  { key: 'available', label: 'B. Waktu/kontrak memungkinkan (kuliah, ikatan dinas, full-time)' },
  { key: 'criteriaMatched', label: 'C. Setiap essential criteria dicocokkan dengan bukti' },
  { key: 'packageReady', label: 'D. Application package sesuai iklan sudah siap' },
  { key: 'mandatoryMet', label: 'E. Semua syarat wajib terpenuhi (atau iklan eksplisit fleksibel)' },
]

const EMPTY_GO: GoNoGo = {
  eligible: false,
  available: false,
  criteriaMatched: false,
  packageReady: false,
  mandatoryMet: false,
}

function NewApplicationForm({ onDone }: { onDone: () => void }) {
  const add = useTracker((s) => s.addApplication)
  const [org, setOrg] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [deadline, setDeadline] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!org.trim() || !title.trim()) return
    add({
      foundDate: todayIso(),
      org: org.trim(),
      title: title.trim(),
      url: url.trim(),
      eligibility: '?',
      deadline: deadline || null,
      status: 'Dipantau',
      match: null,
      fatalGap: '',
      nextAction: 'Snapshot JD + cek eligibility',
      cvVersion: '',
      goNoGo: EMPTY_GO,
    })
    onDone()
  }

  return (
    <form className="card" onSubmit={submit} aria-labelledby="new-app">
      <h2 id="new-app">Tambah peluang</h2>
      <p className="subtle">Hanya peluang terverifikasi dari sumber primer (situs resmi organisasi).</p>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="na-org">Organisasi *</label>
          <input id="na-org" required value={org} onChange={(e) => setOrg(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="na-title">Judul lowongan *</label>
          <input id="na-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="na-url">Link primer</label>
          <input
            id="na-url"
            type="url"
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="na-deadline">Deadline</label>
          <input
            id="na-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <button type="submit" className="btn btn-primary">
          Simpan
        </button>
        <button type="button" className="btn btn-ghost" onClick={onDone}>
          Batal
        </button>
      </div>
    </form>
  )
}

function ApplicationCard({ a }: { a: Application }) {
  const update = useTracker((s) => s.updateApplication)
  const remove = useTracker((s) => s.removeApplication)
  const verdict = goNoGoVerdict(a)
  const daysLeft = a.deadline ? daysBetween(todayIso(), a.deadline) : null
  const id = a.id

  return (
    <section className="card" aria-labelledby={`app-${id}`}>
      <div className="card-title">
        <div style={{ minWidth: 0 }}>
          <h3 id={`app-${id}`} style={{ marginBottom: 2 }}>
            {a.title}
          </h3>
          <div className="subtle">
            {a.org} · ditemukan {formatDate(a.foundDate)}
            {a.url ? (
              <>
                {' · '}
                <a href={a.url} target="_blank" rel="noopener noreferrer">
                  iklan asli
                </a>
              </>
            ) : null}
          </div>
        </div>
        <div className="row">
          {daysLeft !== null ? (
            <Badge
              tone={daysLeft < 0 ? 'neutral' : daysLeft <= 3 ? 'danger' : daysLeft <= 7 ? 'warn' : 'info'}
            >
              {daysLeft < 0 ? 'deadline lewat' : `${daysLeft} hari lagi`}
            </Badge>
          ) : null}
          <StatusBadge status={a.status} />
        </div>
      </div>

      <div className="grid grid-2">
        <div>
          <div className="form-grid">
            <SelectField<ApplicationStatus>
              label="Status"
              value={a.status}
              options={APPLICATION_STATUSES}
              onChange={(status) => update(id, { status })}
            />
            <SelectField
              label="Eligibility"
              value={a.eligibility}
              options={ELIGIBILITY}
              onChange={(eligibility) => update(id, { eligibility })}
            />
            <div className="field">
              <label htmlFor={`d-${id}`}>Deadline</label>
              <input
                id={`d-${id}`}
                type="date"
                value={a.deadline ?? ''}
                onChange={(e) => update(id, { deadline: e.target.value || null })}
              />
            </div>
            <div className="field span-all">
              <label htmlFor={`g-${id}`}>Gap fatal</label>
              <input
                id={`g-${id}`}
                value={a.fatalGap}
                onChange={(e) => update(id, { fatalGap: e.target.value })}
              />
            </div>
            <div className="field span-all">
              <label htmlFor={`n-${id}`}>Tindak lanjut</label>
              <input
                id={`n-${id}`}
                value={a.nextAction}
                onChange={(e) => update(id, { nextAction: e.target.value })}
              />
            </div>
            <div className="field span-all">
              <label htmlFor={`cv-${id}`}>Bukti / versi CV</label>
              <input
                id={`cv-${id}`}
                value={a.cvVersion}
                placeholder="mis. CV_EN_v3_EFEO.pdf"
                onChange={(e) => update(id, { cvVersion: e.target.value })}
              />
            </div>
          </div>
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="row" style={{ marginBottom: 8 }}>
            <strong>Go / No-Go</strong> <StatusBadge status={verdict} />
          </legend>
          <div className="stack" style={{ gap: 8 }}>
            {GO_NO_GO.map((g) => (
              <label key={g.key} className="check">
                <input
                  type="checkbox"
                  checked={a.goNoGo[g.key]}
                  onChange={(e) => update(id, { goNoGo: { ...a.goNoGo, [g.key]: e.target.checked } })}
                />
                <span>{g.label}</span>
              </label>
            ))}
          </div>
          {verdict === 'NO-GO' ? (
            <div className="callout callout-danger" style={{ marginTop: 12 }}>
              Tidak eligible. Ketiadaan dokumen atau gelar tidak boleh ditutupi oleh portofolio.
            </div>
          ) : null}
          <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (window.confirm(`Hapus "${a.title}" (${a.org})?`)) remove(id)
              }}
            >
              Hapus
            </button>
          </div>
        </fieldset>
      </div>
    </section>
  )
}

const CSV_COLUMNS: { key: keyof Application; label: string }[] = [
  { key: 'foundDate', label: 'Tanggal ditemukan' },
  { key: 'org', label: 'Organisasi' },
  { key: 'title', label: 'Judul lowongan' },
  { key: 'url', label: 'Link primer' },
  { key: 'eligibility', label: 'Eligibility' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'status', label: 'Status' },
  { key: 'fatalGap', label: 'Gap fatal' },
  { key: 'nextAction', label: 'Tindak lanjut' },
  { key: 'cvVersion', label: 'Bukti/versi CV' },
]

export default function Applications() {
  const apps = useTracker((s) => s.data.applications)
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState<'Aktif' | 'Semua'>('Aktif')
  const active = new Set<ApplicationStatus>(['Dipantau', 'Disiapkan', 'Dikirim', 'Tes/Interview'])
  const rows = [...apps]
    .filter((a) => filter === 'Semua' || active.has(a.status))
    .sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'))

  return (
    <div className="stack">
      <Seo title="Lamaran" noindex />
      <div className="page-head">
        <div>
          <h1>Pipeline lamaran</h1>
          <p>
            Lamar hanya bila A–E terpenuhi. Setiap peluang: snapshot JD, eligibility, CV terarah, cover
            letter, STAR.
          </p>
        </div>
        <div className="row">
          <button
            type="button"
            className="btn"
            disabled={apps.length === 0}
            onClick={() => downloadText(`lamaran-${todayIso()}.csv`, toCsv(apps, CSV_COLUMNS), 'text/csv')}
          >
            Export CSV
          </button>
          {!adding ? (
            <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
              + Tambah peluang
            </button>
          ) : null}
        </div>
      </div>

      {adding ? <NewApplicationForm onDone={() => setAdding(false)} /> : null}

      <fieldset className="row" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="sr-only">Filter lamaran</legend>
        {(['Aktif', 'Semua'] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`btn btn-sm${filter === f ? ' btn-primary' : ''}`}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
        <span className="subtle">{rows.length} peluang</span>
      </fieldset>

      {rows.length === 0 ? (
        <div className="card empty">
          <p>Belum ada peluang{filter === 'Aktif' ? ' aktif' : ''}.</p>
          <p className="subtle">
            Pantau UNDP, IOM, UN Careers, UNOPS, GIZ, ReliefWeb, DevJobsIndo (lihat Resources R30–R39).
          </p>
        </div>
      ) : (
        rows.map((a) => <ApplicationCard key={a.id} a={a} />)
      )}
    </div>
  )
}
