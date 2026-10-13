import { CloudGate } from '../cloud/TondiCloud'
import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router'
import { usePublicView } from '../domain/public-view'
import { ThemeToggle } from './ThemeToggle'

const YEAR = new Date().getFullYear()

function Header({ children }: { children: React.ReactNode }) {
  const {publicProfile: profile}=usePublicView()
  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            {'T'}
          </span>
          <span>Tondi</span>
        </Link>
        <nav className="nav" aria-label="Main">
          {children}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}

export function PublicLayout() {
  const {publicProfile: profile}=usePublicView()
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header>
        <NavLink to="/" end>
          About
        </NavLink>
        <NavLink to="/portfolio">Portfolio</NavLink>
        <NavLink to="/cv">CV</NavLink>
      </Header>
      <main id="main">
        <div className="container">
          {typeof window!=='undefined' && new URLSearchParams(window.location.search).get('preview')==='1' ? <div className="callout callout-warn no-print" style={{marginTop:16}}><strong>Pratinjau lokal:</strong> hanya membaca data di browser ini, bukan versi publik. Jangan bagikan URL pratinjau kepada recruiter.</div> : null}
          <Outlet />
        </div>
      </main>
      <footer className="site-footer">
        <div className="container">
          <span>
            © {YEAR} Tondi · Portofolio profesional berbasis bukti.
          </span>
          <Link to="/app" className="subtle">
            Tondi Studio
          </Link>
        </div>
      </footer>
      <ScrollRestoration />
    </>
  )
}

const APP_NAV: { to: string; label: string; end?: boolean; group?: string }[] = [
  { to: '/app', label: 'Dashboard', end: true, group: 'Ringkasan' },
  { to: '/app/roadmap', label: 'Roadmap 24 minggu' },
  { to: '/app/review', label: 'Weekly review' },
  { to: '/app/peluang', label: 'Kesempatan', group: 'Peluang & bukti' },
  { to: '/app/impor', label: 'Import JSON' },
  { to: '/app/konten', label: 'Content Studio' },
  { to: '/app/bukti', label: 'Hasil & bukti' },
  { to: '/app/cv-studio', label: 'CV Studio' },
  { to: '/app/capstone', label: 'Capstone P1–P4' },
  { to: '/app/resources', label: 'Resources' },
  { to: '/app/lamaran', label: 'Lamaran', group: 'Pasar kerja' },
  { to: '/app/benchmark', label: 'Benchmark' },
  { to: '/app/pengaturan', label: 'Data & pengaturan', group: 'Sistem' },
]

export function AppLayout() {
  return (
    <CloudGate>
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <Header>
        <NavLink to="/">← Portofolio publik</NavLink>
      </Header>
      <main id="main" lang="id">
        <div className="container app-shell">
          <nav className="app-sidebar" aria-label="Tracker">
            {APP_NAV.map((item) => (
              <div key={item.to} style={{ display: 'contents' }}>
                {item.group ? <div className="sidebar-label">{item.group}</div> : null}
                <NavLink to={item.to} end={item.end}>
                  {item.label}
                </NavLink>
              </div>
            ))}
          </nav>
          <div>
            <Outlet />
          </div>
        </div>
      </main>
      <ScrollRestoration />
    </CloudGate>
  )
}
