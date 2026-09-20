import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { chromium, expect } from '@playwright/test'
import fs from 'fs-extra'
import { createServer } from 'vite'
import { ValaxyDevtools } from '../packages/devtools/src/node'

// Exercise the actual authenticated client, RPC transport, registry and pnpm in
// an isolated project. Existing blogs and the monorepo lockfile are never edited.
const root = await mkdtemp(join(tmpdir(), 'valaxy-addon-browser-'))
const artifacts = resolve('test-results/devtools-addons')
await fs.ensureDir(artifacts)
await fs.writeJSON(join(root, 'package.json'), { name: 'addon-browser-fixture', private: true, packageManager: 'pnpm@12.5.1' })
await writeFile(join(root, 'valaxy.config.ts'), 'export default { theme: \'yun\', addons: [] }\n')
await fs.ensureDir(join(root, 'pages/posts'))
const plugin = ValaxyDevtools({ userRoot: root })
const server = await createServer({ root, configFile: false, devtools: false, logLevel: 'error', plugins: [plugin], server: { host: '127.0.0.1', port: 0 } })
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const browserErrors: string[] = []
page.on('pageerror', error => browserErrors.push(error.message))

try {
  await server.listen()
  const origin = server.resolvedUrls!.local[0]
  const url = plugin.api!.getStandaloneOpenUrl(origin)
  if (!url)
    throw new Error('Standalone DevTools did not provide an authenticated URL.')
  await page.goto(url)
  await page.getByRole('link', { name: '插件', exact: true }).click()
  await expect(page.getByRole('heading', { name: '插件中心' })).toBeVisible()
  await expect(page.locator('[data-addon]')).toHaveCount(18)
  await page.screenshot({ path: join(artifacts, 'marketplace.png'), fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: /^已安装/ }).click()
  await expect(page.getByText('当前项目尚未安装插件。')).toBeVisible()
  await page.getByRole('button', { name: '插件橱窗', exact: true }).click()
  await page.getByRole('searchbox').fill('abbrlink')
  await expect(page.locator('[data-addon]')).toHaveCount(1)
  await page.locator('[data-addon="valaxy-addon-abbrlink"]').getByRole('button', { name: '详情' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: '安装插件', exact: true }).click()
  await expect(dialog.getByText('检查变更', { exact: true })).toBeVisible({ timeout: 20_000 })
  expect((await fs.readJSON(join(root, 'package.json'))).dependencies).toBeUndefined()
  await dialog.getByRole('button', { name: '确认安装', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: '操作完成' })).toBeVisible({ timeout: 180_000 })
  const pkg = await fs.readJSON(join(root, 'package.json'))
  expect(pkg.dependencies['valaxy-addon-abbrlink']).toMatch(/^\d+\.\d+\.\d+/)
  expect(await fs.pathExists(join(root, 'pnpm-lock.yaml'))).toBe(true)
  await page.getByRole('button', { name: /^已安装/ }).click()
  await expect(page.locator('[data-addon]')).toHaveCount(1)
  await page.reload()
  await expect(page.getByRole('heading', { name: '插件中心' })).toBeVisible()
  await page.getByRole('button', { name: /^已安装/ }).click()
  const configured = 'import { addonAbbrlink } from \'valaxy-addon-abbrlink\'\nexport default { theme: \'yun\', addons: [addonAbbrlink()], custom: \'keep me\' }\n'
  await writeFile(join(root, 'valaxy.config.ts'), configured)
  await page.locator('[data-addon="valaxy-addon-abbrlink"]').getByRole('button', { name: '详情' }).click()
  await dialog.getByRole('button', { name: '移除插件', exact: true }).click()
  await expect(dialog.getByText('配置变更', { exact: true })).toBeVisible()
  expect(await readFile(join(root, 'valaxy.config.ts'), 'utf8')).toBe(configured)
  await dialog.getByText('配置变更', { exact: true }).click()
  await page.screenshot({ path: join(artifacts, 'remove-preview.png'), fullPage: true, animations: 'disabled' })
  await dialog.getByRole('button', { name: '确认移除', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: '操作完成' })).toBeVisible({ timeout: 180_000 })
  await expect(page.getByText('当前项目尚未安装插件。')).toBeVisible()
  expect((await fs.readJSON(join(root, 'package.json'))).dependencies?.['valaxy-addon-abbrlink']).toBeUndefined()
  const remaining = await readFile(join(root, 'valaxy.config.ts'), 'utf8')
  expect(remaining).not.toContain('addonAbbrlink')
  expect(remaining).toContain('keep me')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: '插件橱窗', exact: true }).click()
  await expect(page.locator('[data-addon]')).toHaveCount(18)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: join(artifacts, 'marketplace-mobile.png'), fullPage: true, animations: 'disabled' })
  expect(browserErrors).toEqual([])
  console.log('DevTools addon browser checks passed: discovery, installation, reload, configuration preview, removal and mobile layout.')
}
catch (error) {
  await page.screenshot({ path: join(artifacts, 'failure.png'), fullPage: true, animations: 'disabled' }).catch(() => {})
  throw error
}
finally {
  await browser.close()
  await server.close()
  await rm(root, { recursive: true, force: true })
}
