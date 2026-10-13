export function downloadText(filename: string, text: string, mime = 'application/json') {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const LAST_EXPORT_KEY = 'tondi:last-export'

export function getLastExport(): string | null {
  try {
    return localStorage.getItem(LAST_EXPORT_KEY)
  } catch {
    return null
  }
}

export function setLastExport(iso: string) {
  try {
    localStorage.setItem(LAST_EXPORT_KEY, iso)
  } catch {
    /* ignore */
  }
}
