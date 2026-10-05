import type { ChildProcess } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { appendFile, mkdir, mkdtemp, readdir, readFile, realpath, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { chromium, expect as playwrightExpect } from '@playwright/test'
import spawn from 'cross-spawn'
import { formatOnboardingStartup } from './utils/onboarding-output'

const expect = playwrightExpect.configure({ timeout: 30_000 })

// An opt-in acceptance test of the published package boundary, outside the workspace.
// Retain the project, tarballs and logs so failures can be investigated and replayed.
const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const root = await realpath(await mkdtemp(join(tmpdir(), 'valaxy-onboarding-')))
const artifacts = resolve(process.env.VALAXY_ONBOARDING_ARTIFACTS || join(repo, 'test-results/onboarding'))
await mkdir(artifacts, { recursive: true })
const project = join(root, 'valaxy-blog')
const packages = [
  'packages/create-valaxy',
  'packages/valaxy',
  'packages/@valaxyjs/utils',
  'packages/devtools',
  'packages/valaxy-theme-yun',
  'packages/valaxy-addon-girls',
]
const commands: { cwd: string, args: string[], log: string }[] = []
const children = new Set<ChildProcess>()
const stopping = new WeakMap<ChildProcess, Promise<void>>()
let interrupted: NodeJS.Signals | undefined
console.log(`Onboarding project: ${project}\nArtifacts: ${artifacts}`)

function start(args: string[], cwd: string, name: string) {
  if (interrupted)
    throw new Error(`Onboarding interrupted by ${interrupted}`)
  const log = join(artifacts, `${name}.log`)
  const output = createWriteStream(log)
  commands.push({ cwd, args: ['pnpm', ...args], log })
  const child = spawn('pnpm', args, { cwd, detached: process.platform !== 'win32', stdio: ['pipe', 'pipe', 'pipe'] })
  children.add(child)
  child.stdout!.pipe(output)
  child.stderr!.pipe(output)
  // Development servers keep stdin open; ending it asks Vite to stop.
  const done = new Promise<number | null>((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', (code) => {
      // Keep a group tracked when pnpm exits before its descendants, so final
      // cleanup also waits for a stop already started by the command deadline.
      if (!processRunning(child))
        children.delete(child)
      output.end()
      resolve(code)
    })
  })
  return { child, done, log }
}

function processRunning(child: ChildProcess) {
  if (!child.pid)
    return false
  if (process.platform === 'win32')
    return child.exitCode === null && child.signalCode === null
  try {
    process.kill(-child.pid, 0)
    return true
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ESRCH')
      return false
    throw error
  }
}

function stop(child: ChildProcess) {
  const pending = stopping.get(child)
  if (pending)
    return pending
  const done = (async () => {
    if (process.platform === 'win32') {
      if (processRunning(child)) {
        // pnpm.cmd runs under cmd.exe. Stop its tree before killing the parent,
        // otherwise the development server can be orphaned.
        await new Promise<void>((resolve, reject) => {
          const task = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
          task.once('error', reject)
          task.once('exit', (code) => {
            if (code === 0 || !processRunning(child))
              resolve()
            else
              reject(new Error(`Failed to stop onboarding process tree ${child.pid} (${code})`))
          })
        })
      }
      children.delete(child)
      return
    }
    const signal = (value: NodeJS.Signals) => {
      if (!processRunning(child))
        return
      try {
        process.kill(-child.pid!, value)
      }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ESRCH')
          throw error
      }
    }
    signal('SIGTERM')
    const deadline = Date.now() + 5000
    // pnpm can exit before its descendants. Wait for the entire process group.
    while (processRunning(child) && Date.now() < deadline)
      await delay(50)
    signal('SIGKILL')
    children.delete(child)
  })()
  stopping.set(child, done)
  return done
}

async function run(args: string[], cwd: string, name: string) {
  console.log(`Running: pnpm ${args.join(' ')}`)
  const task = start(args, cwd, name)
  const timeout = setTimeout(() => {
    void stop(task.child)
  }, 600_000)
  try {
    expect(await task.done, `Command failed; see ${task.log}`).toBe(0)
  }
  finally {
    clearTimeout(timeout)
  }
}

async function freePort() {
  const server = createServer()
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string')
    throw new Error('Could not allocate a local port')
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  return address.port
}

async function waitForServer(url: string, child: ChildProcess) {
  await expect.poll(async () => {
    if (child.exitCode !== null)
      throw new Error(`Server exited with ${child.exitCode}`)
    return fetch(url).then(response => response.status).catch(() => 0)
  }, { timeout: 60_000 }).toBe(200)
}

const errors: string[] = []
const networkFailures: string[] = []
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined
let passed = false
let cleanupPromise: Promise<void> | undefined
function cleanup() {
  return cleanupPromise ??= (async () => {
    const results = await Promise.allSettled([browser?.close()])
    results.push(...await Promise.allSettled([...children].map(stop)))
    await writeFile(join(artifacts, 'record.json'), `${JSON.stringify({ passed: passed && !interrupted, interrupted, root, project, node: process.version, commands, errors, networkFailures }, null, 2)}\n`)
    // Let log streams flush before the runner exits.
    await delay(50)
    const failures = results.filter(result => result.status === 'rejected')
    if (failures.length)
      throw new AggregateError(failures.map(result => result.reason), 'Failed to stop onboarding commands')
  })()
}
async function interrupt(signal: 'SIGINT' | 'SIGTERM') {
  interrupted = signal
  try {
    await cleanup()
    process.exit(signal === 'SIGINT' ? 130 : 143)
  }
  catch (error) {
    console.error(error)
    process.exit(1)
  }
}
function onSigint() {
  void interrupt('SIGINT')
}
function onSigterm() {
  void interrupt('SIGTERM')
}
process.on('SIGINT', onSigint)
process.on('SIGTERM', onSigterm)
try {
  if (!process.argv.includes('--skip-build'))
    await run(['run', 'build'], repo, 'build-packages')
  await run(['run', 'build:create-valaxy'], repo, 'build-scaffolder')
  const tarballs: Record<string, string> = {}
  for (const directory of packages) {
    const pkg = JSON.parse(await readFile(join(repo, directory, 'package.json'), 'utf8'))
    await run(['pack', '--pack-destination', join(root, 'packages')], join(repo, directory), `pack-${pkg.name.replace(/[@/]/g, '-')}`)
    tarballs[pkg.name] = join(root, 'packages', `${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}.tgz`)
  }
  // --yes selects the same Blog / Yun / manual-install path as the guide.
  await run([`--package=${tarballs['create-valaxy']}`, 'dlx', 'create-valaxy', 'valaxy-blog', '--yes'], root, 'scaffold')
  expect(await readdir(project)).not.toContain('dist')
  expect(await readdir(project)).not.toContain('.valaxy')
  expect(await readdir(project)).not.toContain('.env.example')
  for (const file of ['atom.xml', 'feed.xml', 'feed.json', 'valaxy-fuse-list.json'])
    expect(await readdir(join(project, 'public'))).not.toContain(file)

  // Only redirect our own packages to local tarballs. Do not inherit repository
  // hoisting, catalogs, patches, node_modules or dependency versions.
  await appendFile(join(project, 'pnpm-workspace.yaml'), `\noverrides:\n${Object.entries(tarballs)
    .filter(([name]) => name !== 'create-valaxy')
    .map(([name, tarball]) => `  ${JSON.stringify(name)}: ${JSON.stringify(`file:${tarball}`)}`)
    .join('\n')}\n`)
  await run(['install'], project, 'install')
  await run(['--version'], project, 'pnpm-version')
  for (const name of ['valaxy', 'valaxy-theme-yun'])
    expect(await realpath(join(project, 'node_modules', name))).toContain(root)

  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined })
  // Deliberately differ from the site's Asia/Shanghai timezone to catch date
  // tooltip and previous/next-post hydration mismatches.
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, timezoneId: 'America/Los_Angeles' })
  // The optional random quote service is outside the local onboarding contract.
  // Keep its UI populated without making readiness depend on that service.
  await page.route('https://v1.hitokoto.cn/**', route => route.fulfill({
    json: { hitokoto: '记录生活与技术。', from: 'Valaxy onboarding' },
  }))
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' || /hydration/i.test(message.text()))
      errors.push(message.text())
  })
  page.on('requestfailed', request => networkFailures.push(`${request.url()}: ${request.failure()?.errorText}`))
  const devPort = await freePort()
  const dev = start(['dev', '--port', String(devPort)], project, 'dev')
  const devUrl = `http://localhost:${devPort}`
  await waitForServer(devUrl, dev.child)
  await page.goto(devUrl, { waitUntil: 'networkidle' })
  await expect(page).toHaveTitle('Valaxy Theme Yun')
  await expect(page.getByRole('link', { name: 'Hello, Valaxy!', exact: true }).first()).toBeVisible()
  await page.screenshot({ path: join(artifacts, 'dev-initial.png'), fullPage: true })
  if (process.argv.includes('--check-unpaired')) {
    // A fast onboarding run can finish before the native dock's 60s trust
    // deadline. Keep the unauthenticated page open to cover that lifecycle.
    await delay(65_000)
    expect(errors, 'Unauthenticated development page reported errors').toEqual([])
  }

  // Use the exact Markdown and config examples from the Chinese quick start.
  const guide = await readFile(join(repo, 'docs/pages/zh/guide/getting-started.md'), 'utf8')
  const post = guide.match(/```md\n([\s\S]*?)\n```/)?.[1]
  const site = guide.match(/```ts\n([\s\S]*?)\n```/)?.[1]
  if (!post || !site)
    throw new Error('The quick start must include a Markdown post and site config example')
  await writeFile(join(project, 'pages/posts/first-post.md'), `${post}\n`)
  // Assert a new post appears without a manual reload or server restart.
  const firstPost = page.getByRole('link', { name: '我的第一篇文章', exact: true }).first()
  await expect(firstPost).toBeVisible({ timeout: 30_000 })
  await writeFile(join(project, 'site.config.ts'), `${site}\n`)
  await expect(page).toHaveTitle('我的博客', { timeout: 30_000 })
  await page.waitForLoadState('networkidle')
  await firstPost.click()
  await expect(page).toHaveURL(/\/posts\/first-post$/)
  await expect(page.locator('article')).toContainText('这是我的第一篇文章。')
  await expect(page.locator('body')).toContainText('本文作者：小明')
  await expect(page.locator('vite-error-overlay')).toHaveCount(0)
  await page.screenshot({ path: join(artifacts, 'dev-post.png'), fullPage: true })

  await run(['exec', 'valaxy', 'new', 'cli-post'], project, 'new-post')
  expect(await readFile(join(project, 'pages/posts/cli-post.md'), 'utf8')).toContain('title: cli-post')
  await page.goto(`${devUrl}/posts/cli-post`, { waitUntil: 'networkidle' })
  await expect(page).toHaveTitle('cli-post - 我的博客')
  await stop(dev.child)
  await run(['build'], project, 'production-build')

  for (const [file, text] of [
    ['index.html', '我的博客'],
    ['posts/first-post.html', '这是我的第一篇文章。'],
    ['posts/hello-valaxy.html', 'Hello, Valaxy!'],
    ['posts/cli-post.html', 'cli-post'],
    ['sitemap.xml', 'https://example.com/posts/first-post'],
    ['atom.xml', 'https://example.com/posts/first-post'],
  ]) {
    expect(await readFile(join(project, 'dist', file), 'utf8')).toContain(text)
  }
  const previewPort = await freePort()
  const preview = start(['serve', '--host', '127.0.0.1', '--port', String(previewPort)], project, 'preview')
  const previewUrl = `http://127.0.0.1:${previewPort}`
  await waitForServer(previewUrl, preview.child)
  // Inspect actual prerendered content with JavaScript disabled as well.
  const staticPage = await browser.newPage({ javaScriptEnabled: false })
  await staticPage.goto(`${previewUrl}/posts/first-post`)
  await expect(staticPage.locator('article')).toContainText('这是我的第一篇文章。')
  await staticPage.close()
  await page.goto(previewUrl, { waitUntil: 'networkidle' })
  await expect(page).toHaveTitle('我的博客')
  await expect(page.locator('.yun-square-container .info')).toBeVisible()
  await expect(page.locator('.prologue-introduction')).toHaveCSS('opacity', '1')
  await expect(page.locator('.yun-square-container .info')).toContainText('我的博客')
  await page.screenshot({ path: join(artifacts, 'production-home.png'), fullPage: true })
  await page.getByRole('link', { name: '我的第一篇文章', exact: true }).first().click()
  await expect(page.locator('article')).toContainText('这是我的第一篇文章。')
  await page.reload({ waitUntil: 'networkidle' })
  await expect(page).toHaveTitle('我的第一篇文章 - 我的博客')
  await page.screenshot({ path: join(artifacts, 'production-post.png'), fullPage: true })
  await page.goto(`${previewUrl}/posts/hello-valaxy`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('button', { name: 'Light up the stars', exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Light up the stars', exact: true }).first().click()
  await expect(page.getByRole('button', { name: 'Stars are shining', exact: true }).first()).toHaveAttribute('aria-pressed', 'true')
  expect(errors).toEqual([])
  // Publish a normalized transcript only after the entire acceptance run passes.
  const startupOutput = formatOnboardingStartup(await readFile(dev.log, 'utf8'), project, devPort)
  await mkdir(join(repo, 'docs/generated'), { recursive: true })
  await writeFile(join(repo, 'docs/generated/startup-output.txt'), startupOutput)
  passed = true
  console.log('PASS: clean scaffold, install, dev, Markdown/config hot updates, new command, SSG, feeds, navigation, refresh and interactive hydration.')
}
catch (error) {
  const page = browser?.contexts()[0]?.pages()[0]
  await page?.screenshot({ path: join(artifacts, 'failure.png'), fullPage: true }).catch(() => {})
  throw error
}
finally {
  await cleanup()
  process.off('SIGINT', onSigint)
  process.off('SIGTERM', onSigterm)
}
