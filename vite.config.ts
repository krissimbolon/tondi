import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vitest/config'

/**
 * Production-only Content Security Policy.
 * Static hosts (GitHub Pages) cannot send HTTP headers, so we inject a <meta> CSP at build time.
 * Not applied in dev because Vite's HMR relies on inline scripts.
 */
function productionCsp(): Plugin {
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
  return {
    name: 'production-csp',
    apply: 'build',
    transformIndexHtml: (html) =>
      html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`),
  }
}

/** GitHub Pages has no SPA fallback: serving index.html as 404.html makes deep links work. */
function spaFallback(): Plugin {
  return {
    name: 'spa-fallback-404',
    apply: 'build',
    closeBundle() {
      const dist = resolve(import.meta.dirname, 'dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
    },
  }
}

export default defineConfig({
  // For GitHub Pages project sites set VITE_BASE=/<repo-name>/ (the CI workflow does this automatically).
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), productionCsp(), spaFallback()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
