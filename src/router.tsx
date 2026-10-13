import { createBrowserRouter, createHashRouter, type RouteObject } from 'react-router'
import { AppLayout, PublicLayout } from './components/Layouts'
import ErrorPage from './pages/ErrorPage'
import Home from './pages/public/Home'
import { Loading } from './components/Loading'

/** Route-level code splitting: each page is its own chunk, the public home page stays in the main bundle. */
const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await load()).default,
})

export const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <Loading />,
    children: [
      { index: true, element: <Home /> },
      { path: 'portfolio', lazy: page(() => import('./pages/public/Portfolio')) },
      { path: 'portfolio/:slug', lazy: page(() => import('./pages/public/CapstoneDetail')) },
      { path: 'cv', lazy: page(() => import('./pages/public/Cv')) },
      { path: '*', lazy: page(() => import('./pages/public/NotFound')) },
    ],
  },
  {
    path: 'app',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <Loading />,
    children: [
      { index: true, lazy: page(() => import('./pages/app/Dashboard')) },
      { path: 'roadmap', lazy: page(() => import('./pages/app/Roadmap')) },
      { path: 'review', lazy: page(() => import('./pages/app/WeeklyReview')) },
      { path: 'kompetensi', lazy: page(() => import('./pages/app/Evidence')) },
      { path: 'bukti', lazy: page(() => import('./pages/app/Evidence')) },
      { path: 'peluang', lazy: page(() => import('./pages/app/Opportunities')) },
      { path: 'impor', lazy: page(() => import('./pages/app/ImportCenter')) },
      { path: 'konten', lazy: page(() => import('./pages/app/ContentStudio')) },
      { path: 'cv-studio', lazy: page(() => import('./pages/app/CvStudio')) },
      { path: 'capstone', lazy: page(() => import('./pages/app/Capstones')) },
      { path: 'resources', lazy: page(() => import('./pages/app/Resources')) },
      { path: 'lamaran', lazy: page(() => import('./pages/app/Applications')) },
      { path: 'benchmark', lazy: page(() => import('./pages/app/Benchmark')) },
      { path: 'pengaturan', lazy: page(() => import('./pages/app/Settings')) },
    ],
  },
]

/**
 * History routing by default (clean URLs; GitHub Pages deep links work via the generated 404.html).
 * Set VITE_HASH_ROUTER=true for hosts where neither rewrites nor 404 fallback are available.
 */
export function createAppRouter() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'
  return import.meta.env.VITE_HASH_ROUTER === 'true'
    ? createHashRouter(routes)
    : createBrowserRouter(routes, { basename })
}
