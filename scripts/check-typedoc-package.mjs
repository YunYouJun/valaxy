import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { chromium, expect } from '@playwright/test'
import { preview } from 'vite'

// Install actual tarballs outside the workspace so unpublished exports, workers
// and accidental monorepo links cannot hide packaging errors.
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const root = await mkdtemp(join(tmpdir(), 'valaxy-typedoc-package-'))
const artifacts = resolve(process.env.VALAXY_TYPEDOC_ARTIFACTS || 'test-results/typedoc-package')
await mkdir(artifacts, { recursive: true })
const tarballs = join(root, 'tarballs')
await mkdir(tarballs)

async function run(args, cwd, logName) {
  let output = ''
  const code = await new Promise((accept, reject) => {
    const child = spawn('pnpm', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] })
    child.stdout.on('data', data => output += data.toString())
    child.stderr.on('data', data => output += data.toString())
    child.once('error', reject)
    child.once('close', accept)
  })
  await writeFile(join(artifacts, `${logName}.log`), output)
  assert.equal(code, 0, `${logName} failed; see ${join(artifacts, `${logName}.log`)}`)
  return output
}

try {
  for (const directory of ['@valaxyjs/utils', 'devtools', 'valaxy', 'valaxy-theme-press', 'valaxy-addon-typedoc'])
    await run(['pack', '--pack-destination', tarballs], resolve(repository, 'packages', directory), `pack-${directory.replaceAll('/', '-')}`)
  const overrides = {}
  for (const file of await readdir(tarballs)) {
    const name = file.startsWith('valaxyjs-utils-')
      ? '@valaxyjs/utils'
      : file.startsWith('valaxyjs-devtools-')
        ? '@valaxyjs/devtools'
        : file.startsWith('valaxy-theme-press-')
          ? 'valaxy-theme-press'
          : file.startsWith('valaxy-addon-typedoc-') ? 'valaxy-addon-typedoc' : 'valaxy'
    overrides[name] = `file:${join(tarballs, file)}`
  }
  const dependencies = { ...overrides }
  for (const name of ['vue', 'vue-router'])
    dependencies[name] = JSON.parse(await readFile(resolve(repository, 'node_modules', name, 'package.json'), 'utf8')).version
  const packageManager = JSON.parse(await readFile(resolve(repository, 'package.json'), 'utf8')).packageManager
  await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'typedoc-package-fixture', private: true, type: 'module', packageManager, dependencies }))
  // Local tarballs have the development version until the coordinated release.
  await writeFile(join(root, 'pnpm-workspace.yaml'), `autoInstallPeers: false
strictPeerDependencies: false
publicHoistPattern:
  - '*'
allowBuilds:
  '@parcel/watcher': false
  esbuild: true
  protobufjs: false
  vue-demi: true
overrides:
${Object.entries(overrides).map(([name, file]) => `  ${JSON.stringify(name)}: ${JSON.stringify(file)}`).join('\n')}
`)
  await mkdir(join(root, 'src'))
  await mkdir(join(root, 'pages'))
  await mkdir(join(root, 'public'))
  await writeFile(join(root, 'public/favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M2 2h12v12H2z"/></svg>')
  await writeFile(join(root, 'src/index.ts'), '/** Read a packaged value. */\nexport function read<T>(value: T): T { return value }\n')
  await writeFile(join(root, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ESNext', types: [], strict: true }, include: ['src'] }))
  await writeFile(join(root, 'typedoc.json'), JSON.stringify({ entryPoints: ['./src/index.ts'], tsconfig: './tsconfig.json' }))
  await writeFile(join(root, 'pages/index.md'), '# Package verification\n\n[Read API](/api/functions/read)\n')
  await mkdir(join(root, 'pages/guide'))
  await writeFile(join(root, 'pages/guide/configuration.md'), '# Configuration\n\nConfigure the packaged application.\n')
  await writeFile(join(root, 'valaxy.config.ts'), `import { defineValaxyConfig } from 'valaxy'
import { addonTypeDoc } from 'valaxy-addon-typedoc'
export default defineValaxyConfig({
  theme: 'press',
  vite: { base: '/docs/' },
  addons: [addonTypeDoc({ options: './typedoc.json', watch: ['src/**/*.ts'] })],
  siteConfig: { title: 'Package verification', url: 'https://example.com/docs/', search: { enable: true, provider: 'local' } },
})
`)
  await run(['install', '--prefer-offline'], root, 'install')
  const cold = await run(['exec', 'valaxy', 'build', '--ssg'], root, 'cold-build')
  assert.match(cold, /\[typedoc\] Generated \d+ pages/)
  const html = await readFile(join(root, 'dist/api/functions/read.html'), 'utf8')
  assert.match(html, /Read a packaged value/)
  assert.match(html, /id="parameters"/)
  assert.match(html, /https:\/\/example.com\/docs\/api\/functions\/read/)
  const assets = join(root, 'dist/assets')
  const indexes = (await readdir(assets)).filter(file => file.startsWith('@localSearchIndex') && file.endsWith('.js'))
  const index = (await Promise.all(indexes.map(file => readFile(join(assets, file), 'utf8')))).join('\n')
  assert.match(index, /api\/functions\/read/)
  const warm = await run(['exec', 'valaxy', 'build', '--ssg'], root, 'warm-build')
  assert.doesNotMatch(warm, /\[typedoc\] Generated/)
  assert.match(await readFile(join(root, 'dist/api/functions/read.html'), 'utf8'), /Read a packaged value/)
  const server = await preview({ root, configFile: false, base: '/docs/', preview: { host: '127.0.0.1', port: 0 } })
  const browser = await chromium.launch()
  const page = await browser.newPage()
  try {
    await page.goto(server.resolvedUrls.local[0])
    await expect.poll(() => page.locator('#app').evaluate(el => !!el.__vue_app__)).toBe(true)
    for (const [query, route, heading] of [
      ['configuration', '/guide/configuration', 'Configuration'],
      ['read', '/api/functions/read', 'Function: read'],
    ]) {
      await page.locator('.press-search-btn:visible').click()
      await page.locator('.press-search-input').fill(query)
      await page.locator('.press-result-item').filter({ has: page.locator('.press-result-page').filter({ hasText: route }) }).first().click()
      await expect(page.locator('main h1')).toContainText(heading)
      assert.equal(new URL(page.url()).pathname, `/docs${route}`)
    }
  }
  catch (error) {
    await page.screenshot({ path: join(artifacts, 'local-search-failure.png') })
    throw error
  }
  finally {
    await browser.close()
    await new Promise((accept, reject) => server.httpServer.close(error => error ? reject(error) : accept()))
  }
  console.log('Packed core, Press and TypeDoc addon: isolated install, cold/warm SSG, real local-search navigation under /docs/, and canonical/anchor checks passed.')
}
finally {
  await rm(root, { recursive: true, force: true })
}
