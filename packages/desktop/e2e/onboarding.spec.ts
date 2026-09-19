import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { _electron as electron, expect, test } from '@playwright/test'

// Playwright requires an explicit fixture object even when only testInfo is used.
// eslint-disable-next-line no-empty-pattern
test('creates, installs, edits, previews, builds and closes without a system Node', async ({}, testInfo) => {
  const parent = await mkdtemp(join(tmpdir(), 'valaxy-desktop-e2e-'))
  await mkdir(join(parent, 'profile'))
  const app = await electron.launch({
    executablePath: process.env.VALAXY_DESKTOP_EXECUTABLE,
    args: process.env.VALAXY_DESKTOP_EXECUTABLE ? [] : [resolve('.')],
    env: { ...process.env, PATH: process.platform === 'win32' ? `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}` : '/usr/bin:/bin', VALAXY_DESKTOP_USER_DATA: join(parent, 'profile') },
  })
  const page = await app.firstWindow()
  const root = join(parent, 'my-blog')
  try {
    await app.evaluate(({ app, dialog }, parent) => {
      app.setPath('userData', `${parent}/profile`)
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [parent] })
      dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false })
      dialog.showMessageBoxSync = () => 1
    }, parent)
    await page.getByRole('button', { name: '创建我的博客' }).click()
    await page.getByLabel('作者', { exact: true }).fill('桌面测试')
    await page.getByRole('button', { name: '选择位置并创建' }).click()
    await expect(page.locator('.runtime-status.running, .error-banner')).toBeVisible({ timeout: 180_000 })
    const state = await page.evaluate(() => window.valaxyDesktop.getState())
    expect(state.preview, `${state.error || ''}\n${state.logs}`).toBe('running')
    expect(state.project?.dependenciesReady).toBe(true)
    expect(await page.evaluate(() => typeof (window as any).require)).toBe('undefined')
    const editor = page.frameLocator('iframe[title="Valaxy 文章与配置"]')
    await expect(editor.getByRole('link', { name: /^(文章|Posts)$/ })).toBeVisible({ timeout: 30_000 })
    await editor.getByRole('link', { name: /^(文章|Posts)$/ }).click()
    await editor.getByText('我的第一篇文章', { exact: true }).first().click()
    await editor.getByRole('button', { name: 'Markdown 正文', exact: true }).click()
    await editor.getByRole('textbox', { name: 'Markdown 正文' }).fill('\n桌面闭环验证：正文已保存。\n')
    await editor.getByRole('button', { name: '保存正文', exact: true }).click()
    await expect.poll(() => readFile(join(root, 'pages/posts/hello.md'), 'utf8')).toContain('桌面闭环验证：正文已保存。')
    await page.getByRole('button', { name: '站点预览', exact: true }).click()
    await expect(page.frameLocator('iframe[title="Valaxy 站点预览"]').getByText('我的第一篇文章').first()).toBeVisible({ timeout: 30_000 })
    await page.getByRole('button', { name: '构建静态站点', exact: true }).click()
    await expect.poll(() => page.evaluate(() => window.valaxyDesktop.getState()), { timeout: 120_000 }).toMatchObject({ build: 'success' })
    expect(await readFile(join(root, 'dist/posts/hello.html'), 'utf8')).toContain('桌面闭环验证')
    await page.screenshot({ path: testInfo.outputPath('workspace.png') })
    await page.getByRole('button', { name: '停止预览', exact: true }).click()
    await expect.poll(() => page.evaluate(() => window.valaxyDesktop.getState())).toMatchObject({ preview: 'stopped' })
    await expect(fetch(state.previewUrl!)).rejects.toThrow()
    await writeFile(join(root, 'valaxy.config.ts'), `export default { theme: 'yun', vite: { plugins: [{ name: 'intentional-failure', apply: 'build', buildStart() { throw new Error('intentional build failure') } }] } }`)
    await page.getByRole('button', { name: '重新构建', exact: true }).click()
    await expect.poll(() => page.evaluate(() => window.valaxyDesktop.getState()), { timeout: 120_000 }).toMatchObject({ build: 'error' })
    expect((await page.evaluate(() => window.valaxyDesktop.getState())).outputDir).toBeUndefined()
  }
  finally {
    const state = await page.evaluate(() => window.valaxyDesktop.getState()).catch(() => undefined)
    if (state)
      await testInfo.attach('runtime.log', { body: JSON.stringify({ ...state, devtoolsUrl: undefined }, null, 2), contentType: 'text/plain' })
    await app.close()
    await rm(parent, { recursive: true, force: true })
  }
})
