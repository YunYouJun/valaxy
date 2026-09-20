import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { chromium, expect } from '@playwright/test'
import fs from 'fs-extra'
import { createServer } from 'vite'
import { addons } from '../packages/@valaxyjs/utils/src/constants/addons'
import { ValaxyDevtools } from '../packages/devtools/src/node'

// Exercise the actual authenticated client, RPC transport, registry and pnpm in
// an isolated project. Existing blogs and the monorepo lockfile are never edited.
const root = await mkdtemp(join(tmpdir(), 'valaxy-addon-browser-'))
const artifacts = resolve(process.env.VALAXY_DEVTOOLS_ARTIFACTS || 'test-results/devtools-addons')
await fs.ensureDir(artifacts)
await fs.writeJSON(join(root, 'package.json'), { name: 'addon-browser-fixture', private: true, packageManager: 'pnpm@12.5.1' })
await writeFile(join(root, 'valaxy.config.ts'), 'export default { theme: \'yun\', addons: [] }\n')
await fs.ensureDir(join(root, 'pages/posts'))
// Keep the displayed default deterministic without launching an application.
process.env.LAUNCH_EDITOR = 'code'
const plugin = ValaxyDevtools({ userRoot: root })
const server = await createServer({ root, configFile: false, devtools: false, logLevel: 'error', plugins: [plugin], server: { host: '127.0.0.1', port: 0 } })
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.emulateMedia({ colorScheme: 'light' })
const browserErrors: string[] = []
page.on('pageerror', error => browserErrors.push(error.message))
page.on('console', message => message.type() === 'error' && browserErrors.push(message.text()))

try {
  await server.listen()
  const origin = server.resolvedUrls!.local[0]
  const url = plugin.api!.getStandaloneOpenUrl(origin)
  if (!url)
    throw new Error('Standalone DevTools did not provide an authenticated URL.')
  await page.goto(url)
  await page.getByRole('link', { name: '插件', exact: true }).click()
  await expect(page.getByRole('heading', { name: '插件中心' })).toBeVisible()
  await expect(page.locator('[data-addon]')).toHaveCount(addons.length)
  await expect(page).toHaveTitle('Valaxy DevTools')
  await expect(page.locator('vite-error-overlay')).toHaveCount(0)
  for (const addon of addons) {
    const icon = page.locator(`[data-addon="${addon.name}"] [aria-hidden="true"]`).first()
    expect(await icon.getAttribute('class')).toContain(addon.icon)
    await expect(icon).toHaveCSS('mask-image', /url\(/)
    expect((await icon.boundingBox())?.width).toBeGreaterThan(0)
  }
  await page.screenshot({ path: join(artifacts, 'marketplace.png'), fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: /^已安装/ }).click()
  await expect(page.getByText('当前项目尚未安装插件。')).toBeVisible()
  await page.getByRole('button', { name: '插件橱窗', exact: true }).click()
  await page.getByRole('searchbox').fill('abbrlink')
  await expect(page.locator('[data-addon]')).toHaveCount(1)
  await page.locator('[data-addon="valaxy-addon-abbrlink"]').getByRole('button', { name: '详情' }).click()
  const dialog = page.getByRole('dialog')
  for (const label of ['npm', 'GitHub', '使用文档']) {
    const link = dialog.getByRole('link', { name: label, exact: true })
    await expect(link).toBeVisible()
    await expect(link.locator('[aria-hidden="true"]').first()).toHaveCSS('mask-image', /url\(/)
    await expect(link).toHaveAttribute('target', '_blank')
  }
  const editorChoice = dialog.getByRole('combobox', { name: '选择编辑器' })
  const editorButton = dialog.getByRole('button', { name: '在编辑器中打开配置', exact: true })
  await expect(editorChoice).toHaveValue('')
  await expect(editorButton.locator('[aria-hidden="true"]')).toHaveClass(/i-vscode-icons:file-type-vscode/)
  await expect(editorButton.locator('[aria-hidden="true"]')).toHaveCSS('background-image', /url\(/)
  await editorChoice.selectOption('cursor')
  await expect(editorButton).toHaveAttribute('title', 'Cursor')
  await expect(editorButton.locator('[aria-hidden="true"]')).toHaveCSS('mask-image', /url\(/)
  await dialog.getByRole('button', { name: '安装插件', exact: true }).click()
  await expect(dialog.getByText('检查变更', { exact: true })).toBeVisible({ timeout: 20_000 })
  await expect(dialog.locator('.shiki')).toHaveCount(1)
  await expect(dialog.locator('.shiki')).toContainText('pnpm add')
  await page.screenshot({ path: join(artifacts, 'install-preview.png'), fullPage: true, animations: 'disabled' })
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
  const configured = [
    'import { addonAbbrlink } from \'valaxy-addon-abbrlink\'',
    '',
    'export default {',
    '  theme: \'yun\',',
    '  addons: [',
    '    addonAbbrlink(),',
    '  ],',
    '  custom: \'keep me — this existing option and its original formatting are preserved when the addon is removed.\',',
    '}',
    '',
  ].join('\n')
  await writeFile(join(root, 'valaxy.config.ts'), configured)
  await page.locator('[data-addon="valaxy-addon-abbrlink"]').getByRole('button', { name: '详情' }).click()
  await expect(editorChoice).toHaveValue('cursor')
  await expect(editorButton).toHaveAttribute('title', 'Cursor')
  await editorChoice.selectOption('')
  await expect(editorButton).toHaveAttribute('title', 'Visual Studio Code')
  await dialog.getByRole('button', { name: '移除插件', exact: true }).click()
  await expect(dialog.getByText('配置变更', { exact: true })).toBeVisible()
  expect(await readFile(join(root, 'valaxy.config.ts'), 'utf8')).toBe(configured)
  await dialog.getByText('配置变更', { exact: true }).click()
  await expect(dialog.locator('details .shiki')).toHaveCount(2)
  expect((await dialog.locator('details .shiki').first().textContent())?.trim()).toBe(configured.trim())
  const wrap = dialog.getByRole('checkbox', { name: '自动换行' })
  const before = dialog.locator('details .shiki').first()
  await expect(wrap).toBeChecked()
  await expect(before).toHaveCSS('white-space', 'pre-wrap')
  await wrap.uncheck()
  await expect(before).toHaveCSS('white-space', 'pre')
  expect(await before.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)
  await wrap.check()
  await expect(before).toHaveCSS('white-space', 'pre-wrap')
  expect(await before.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
  await page.screenshot({ path: join(artifacts, 'remove-preview.png'), fullPage: true, animations: 'disabled' })
  const token = dialog.locator('details .shiki span[style*="--shiki-dark:"]').first()
  const lightColor = await token.evaluate(element => getComputedStyle(element).color)
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect.poll(() => token.evaluate(element => getComputedStyle(element).color)).not.toBe(lightColor)
  await page.screenshot({ path: join(artifacts, 'remove-preview-dark.png'), fullPage: true, animations: 'disabled' })
  await page.emulateMedia({ colorScheme: 'light' })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
  await page.screenshot({ path: join(artifacts, 'remove-preview-mobile.png'), fullPage: true, animations: 'disabled' })
  await page.setViewportSize({ width: 1280, height: 900 })
  await dialog.getByRole('button', { name: '确认移除', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: '操作完成' })).toBeVisible({ timeout: 180_000 })
  await expect(page.getByText('当前项目尚未安装插件。')).toBeVisible()
  expect((await fs.readJSON(join(root, 'package.json'))).dependencies?.['valaxy-addon-abbrlink']).toBeUndefined()
  const remaining = await readFile(join(root, 'valaxy.config.ts'), 'utf8')
  expect(remaining).not.toContain('addonAbbrlink')
  expect(remaining).toContain('keep me')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: '插件橱窗', exact: true }).click()
  await expect(page.locator('[data-addon]')).toHaveCount(addons.length)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: join(artifacts, 'marketplace-mobile.png'), fullPage: true, animations: 'disabled' })
  expect(browserErrors).toEqual([])
  console.log('DevTools addon browser checks passed: catalog/link/editor icons, persisted editor selection, installation, source-preserving Shiki previews, wrapping, light/dark themes, removal and mobile layout.')
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
