import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { chromium, expect } from '@playwright/test'
import { preview } from 'vite'

const exec = promisify(execFile)
const repository = resolve(import.meta.dirname, '..')
const root = await mkdtemp(join(tmpdir(), 'valaxy-fuse-package-'))
const readJson = async file => JSON.parse(await readFile(file, 'utf8'))

async function pnpm(cwd, ...args) {
  try {
    await exec('pnpm', args, { cwd, maxBuffer: 4 * 1024 * 1024 })
  }
  catch (error) {
    throw new Error(`pnpm ${args.join(' ')} failed:\n${error.stdout || ''}\n${error.stderr || error.message}`, { cause: error })
  }
}

try {
  const tarballs = join(root, 'tarballs')
  await mkdir(tarballs)
  const overrides = {}
  for (const directory of ['@valaxyjs/utils', 'devtools', 'valaxy', 'valaxy-theme-yun', 'valaxy-addon-girls']) {
    const cwd = join(repository, 'packages', directory)
    const { name, version } = await readJson(join(cwd, 'package.json'))
    await pnpm(cwd, 'pack', '--pack-destination', tarballs)
    overrides[name] = `file:${join(tarballs, `${name.replace(/^@/, '').replace('/', '-')}-${version}.tgz`)}`
  }
  const dependencies = { ...overrides }
  for (const name of ['vue', 'vue-router'])
    dependencies[name] = (await readJson(join(repository, 'node_modules', name, 'package.json'))).version
  const { packageManager } = await readJson(join(repository, 'package.json'))
  await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'fuse-package-fixture', private: true, type: 'module', packageManager, dependencies }))
  await writeFile(join(root, 'pnpm-workspace.yaml'), `
publicHoistPattern: ['*']
allowBuilds:
  '@parcel/watcher': false
  esbuild: true
  protobufjs: false
  vue-demi: true
overrides:
${Object.entries(overrides).map(([name, file]) => `  ${JSON.stringify(name)}: ${JSON.stringify(file)}`).join('\n')}
`)
  await mkdir(join(root, 'pages/posts'), { recursive: true })
  await writeFile(join(root, 'pages/posts/first-search.md'), '---\ntitle: First search fixture\ndate: 2026-01-01\n---\nA real entry in the generated index.\n')
  // Record module membership at build time: a filename-only assertion would
  // miss Fuse when it is bundled into a chunk shared with the homepage.
  await writeFile(join(root, 'valaxy.config.ts'), String.raw`export default {
  theme: 'yun',
  siteConfig: { title: 'Fuse package fixture', url: 'https://example.com/', search: { enable: true, provider: 'fuse' } },
  themeConfig: { fireworks: { enable: false } },
  vite: {
    plugins: [{
      name: 'test:fuse-chunks',
      generateBundle(_, bundle) {
        if (this.environment.name !== 'client') return
        const files = Object.values(bundle)
          .filter(chunk => chunk.type === 'chunk' && Object.keys(chunk.modules).some(id => /[/\\]fuse\.js[/\\]/.test(id)))
          .map(chunk => chunk.fileName)
        this.emitFile({ type: 'asset', fileName: 'fuse-chunks.json', source: JSON.stringify(files) })
      },
    }],
  },
}`)
  await pnpm(root, 'install', '--prefer-offline')
  await pnpm(root, 'exec', 'valaxy', 'build', '--ssg')

  const fuseChunks = await readJson(join(root, 'dist/fuse-chunks.json'))
  assert(fuseChunks.length, 'the build must emit a chunk containing Fuse')
  const searchAssets = new Set([...fuseChunks.map(file => `/${file}`), '/valaxy-fuse-list.json'])
  const server = await preview({ root, configFile: false, preview: { host: '127.0.0.1', port: 0 } })
  let browser
  try {
    browser = await chromium.launch()
    const origin = new URL(server.resolvedUrls.local[0]).origin
    const page = await browser.newPage({ serviceWorkers: 'block' })
    await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort())
    const requests = []
    page.on('request', (request) => {
      const { origin: requestOrigin, pathname } = new URL(request.url())
      if (requestOrigin === origin && searchAssets.has(pathname))
        requests.push(pathname)
    })
    await page.goto(origin)
    await expect.poll(() => page.locator('#app').evaluate(el => !!el.__vue_app__)).toBe(true)
    await page.waitForLoadState('networkidle')
    const preloads = await page.locator('link[rel="preload"], link[rel="modulepreload"]').evaluateAll(links => links.map(link => new URL(link.href).pathname))
    assert.deepEqual(preloads.filter(file => searchAssets.has(file)), [], 'search assets were preloaded on the homepage')
    assert.deepEqual(requests, [], 'search assets were downloaded before opening the dialog')

    await page.locator('.yun-search-btn:visible').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('searchbox').fill('First search fixture')
    await expect(dialog.locator('a[href="/posts/first-search"]').first()).toBeVisible()
    assert(requests.some(file => fuseChunks.includes(file.slice(1))), 'Fuse was not requested on first open')
    assert(requests.includes('/valaxy-fuse-list.json'), 'the generated index was not requested on first open')
  }
  finally {
    await browser?.close()
    await new Promise((accept, reject) => server.httpServer.close(error => error ? reject(error) : accept()))
  }
  console.log('Packed Yun site: no Fuse or index on cold home; first search returns a real result.')
}
finally {
  await rm(root, { recursive: true, force: true })
}
