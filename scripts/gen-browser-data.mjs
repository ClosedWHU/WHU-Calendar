import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const dataDir = join(projectRoot, 'data')
const outFile = join(projectRoot, 'src', '_browser-data.ts')

const files = readdirSync(dataDir).filter(f => f.endsWith('.json')).sort()
// nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal — f comes from readdirSync, not user input
const items = files.map(f => JSON.parse(readFileSync(join(dataDir, f), 'utf-8')))
  .sort((a, b) => b.name.localeCompare(a.name))

writeFileSync(outFile, `export default ${JSON.stringify(items, null, 0)} as const\n`)
console.log(`Generated src/_browser-data.ts (${items.length} years)`)
