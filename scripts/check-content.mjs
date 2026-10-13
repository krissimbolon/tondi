#!/usr/bin/env node
// Lists "[ISI: …]" placeholders left in public content. Use `--strict` to fail (e.g. before a real launch).
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dir = new URL('../src/content/', import.meta.url).pathname
const strict = process.argv.includes('--strict')
const hits = []
for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
  readFileSync(join(dir, file), 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (line.includes('[ISI')) hits.push(`src/content/${file}:${i + 1}  ${line.trim()}`)
    })
}
if (hits.length === 0) {
  console.log('✔ Tidak ada placeholder [ISI] — konten siap publik.')
} else {
  console.log(`⚠ ${hits.length} placeholder [ISI] masih ada:\n` + hits.map((h) => '  ' + h).join('\n'))
  if (strict) process.exit(1)
}
