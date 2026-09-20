import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { apiRedirects, formatApiRedirects } from './lib/api-redirects.mjs'

// The main site's verify:api validates every target and legacy fragment before
// cutover. The old domain only needs this dependency-free redirect deployment.
const legacy = JSON.parse(await readFile(new URL('../api/migration/legacy-pages.json', import.meta.url), 'utf8'))
const output = new URL('../api/migration/dist/', import.meta.url)
await mkdir(output, { recursive: true })
const redirects = apiRedirects(legacy)
await writeFile(new URL('_redirects', output), formatApiRedirects(redirects))
await writeFile(new URL('index.html', output), '<!doctype html><title>Valaxy API moved</title><a href="https://valaxy.site/api/">Valaxy API documentation</a>\n')
console.log(`Prepared ${redirects.size} HTTP 301 rules for api.valaxy.site.`)
