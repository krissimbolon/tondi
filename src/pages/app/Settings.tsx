import { useRef, useState } from 'react'
import { downloadText, getLastExport, setLastExport } from '../../components/download'
import { Seo } from '../../components/Seo'
import { backupFileName, createBackup, parseBackup, toCsv } from '../../domain/backup'
import { formatDate, todayIso } from '../../domain/dates'
import type { Competency } from '../../domain/schema'
import { useTracker } from '../../store/tracker'

type Msg = { tone: 'ok' | 'danger'; text: string; details?: string[] } | null

const COMPETENCY_CSV: { key: keyof Competency; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Kompetensi' },
  { key: 'domain', label: 'Domain' },
  { key: 'priority', label: 'Prioritas' },
  { key: 'baseline', label: 'Skor awal 1-5' },
  { key: 'current', label: 'Skor saat ini' },
  { key: 'target', label: 'Target 1-5' },
  { key: 'status', label: 'Status' },
  { key: 'testMethod', label: 'Metode uji' },
  { key: 'lastTested', label: 'Terakhir diuji' },
]

export default function Settings() {
  const data = useTracker((s) => s.data)
  const updateSettings = useTracker((s) => s.updateSettings)
  const replaceAll = useTracker((s) => s.replaceAll)
  const reset = useTracker((s) => s.reset)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<Msg>(null)
  const [lastExport, setLastExportState] = useState(getLastExport())

  const exportJson = () => {
    const now = new Date()
    downloadText(backupFileName(now), JSON.stringify(createBackup(data, now), null, 2))
    setLastExport(now.toISOString())
    setLastExportState(now.toISOString())
    setMsg({ tone: 'ok', text: 'Backup diunduh. Simpan di Google Drive/OneDrive agar aman.' })
  }

  const importJson = async (file: File) => {
    const result = parseBackup(await file.text())
    if (!result.ok) {
      setMsg({ tone: 'danger', text: 'Import gagal — data lama tidak diubah.', details: result.errors })
      return
    }
    if (!window.confirm('Ganti seluruh draft Tondi dengan isi file backup? Data akan tersinkronisasi ke server.')) return
    replaceAll(result.data)
    setMsg({ tone: 'ok', text: `Import berhasil (${file.name}).` })
  }

  return (
    <div className="stack">
      <Seo title="Data & pengaturan" noindex />
      <div className="page-head">
        <div>
          <h1>Data & pengaturan</h1>
          <p>
            Data draft disimpan di database Tondi ketika status sinkronisasi menunjukkan tersimpan. Unduh backup JSON secara berkala sebagai cadangan independen.
          </p>
        </div>
      </div>

      {msg ? (
        <div className={`callout callout-${msg.tone}`} aria-live="polite">
          {msg.text}
          {msg.details ? (
            <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
              {msg.details.map((d) => (
                <li key={d} className="mono">
                  {d}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <section className="card" aria-labelledby="profile-settings">
        <h2 id="profile-settings">Program</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="owner">Nama panggilan</label>
            <input
              id="owner"
              value={data.settings.ownerName}
              onChange={(e) => updateSettings({ ownerName: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="start">Tanggal mulai minggu 1</label>
            <input
              id="start"
              type="date"
              value={data.settings.startDate}
              onChange={(e) => e.target.value && updateSettings({ startDate: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section className="card" aria-labelledby="backup">
        <h2 id="backup">Backup & pindah perangkat</h2>
        <p className="subtle">
          Backup terakhir: {lastExport ? formatDate(lastExport.slice(0, 10)) : 'belum pernah'}. Disarankan
          tiap akhir weekly review.
        </p>
        <div className="row">
          <button type="button" className="btn btn-primary" onClick={exportJson}>
            Export backup (JSON)
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            Import backup…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void importJson(f)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            className="btn"
            onClick={() =>
              downloadText(
                `kompetensi-${todayIso()}.csv`,
                toCsv(data.competencies, COMPETENCY_CSV),
                'text/csv',
              )
            }
          >
            Export matriks lama (CSV)
          </button>
        </div>
      </section>

      <section className="card" aria-labelledby="danger">
        <h2 id="danger">Reset</h2>
        <p className="subtle">Mengembalikan semua data ke isi awal workbook. Export backup dulu.</p>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            if (window.prompt('Ketik RESET untuk menghapus semua progres di browser ini.') === 'RESET') {
              reset()
              setMsg({ tone: 'ok', text: 'Data dikembalikan ke kondisi awal.' })
            }
          }}
        >
          Reset semua data
        </button>
      </section>
    </div>
  )
}
