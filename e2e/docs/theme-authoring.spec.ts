import { expect, test } from '@playwright/test'

// Both language cases use the system clipboard, shared across browser contexts.
test.describe.configure({ mode: 'default' })

for (const language of [
  { path: '/zh/themes/write', brief: '复制设计简报', full: '完整提示词', workspace: '工作区', existing: '修改现有主题', design: '设计基础', name: '主题名称', visual: '视觉方向', features: '所需页面与功能' },
  { path: '/themes/write', brief: 'Copy design brief', full: 'Standalone prompt', workspace: 'Workspace', existing: 'Customize an existing theme', design: 'Design foundation', name: 'Theme name', visual: 'Visual direction', features: 'Required pages and features' },
]) {
  test(`theme authoring formats and accessible controls at ${language.path}`, async ({ page, context }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto(language.path)
    const builder = page.locator('.theme-prompt')
    const copy = builder.locator('.output-copy')
    await expect(copy).toHaveAccessibleName(language.brief)
    await expect(copy).toBeDisabled()
    const preset = builder.getByRole('button', { name: /AK UI \/ Arknights/ })
    await preset.click()
    await expect(preset).toHaveAttribute('aria-pressed', 'true')
    await expect(copy).toBeEnabled()
    await copy.click()
    const brief = await page.evaluate(() => navigator.clipboard.readText())
    expect(brief).toContain('valaxy-theme-arknights')
    expect(brief).toContain('valaxy-theme Skill')
    expect(brief).not.toContain('defineTheme()')

    // Reka Select supports keyboard selection and returns focus on Escape.
    const workspace = builder.getByRole('combobox', { name: language.workspace, exact: true })
    await workspace.focus()
    await page.keyboard.press('Space')
    await expect(page.getByRole('listbox')).toBeVisible()
    await expect(page.getByRole('option').first()).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('option', { name: language.existing, exact: true })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(workspace).toContainText(language.existing)
    const design = builder.getByRole('combobox', { name: language.design, exact: true })
    await design.click()
    await page.keyboard.press('Escape')
    await expect(design).toBeFocused()

    // User edits survive both output formats, and clipboard matches visible output.
    await builder.getByLabel(language.visual, { exact: true }).fill('Blue ink / 蓝色墨水')
    await builder.getByLabel(language.features, { exact: true }).fill('Accessible search / 无障碍搜索')
    await expect(preset).toHaveAttribute('aria-pressed', 'false')
    await builder.getByRole('tab', { name: language.full, exact: true }).click()
    const preview = builder.locator('pre')
    await expect(preview).toContainText('@yunyoujun/ak-ui/style.css')
    await expect(preview).toContainText('valaxy build --ssg')
    await expect(preview).not.toContainText('pnpm dlx degit')
    await copy.click()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await preview.textContent())
    await page.keyboard.press('Tab')
    await builder.getByRole('tab', { name: language.full, exact: true }).focus()
    await page.keyboard.press('ArrowLeft')
    await expect(preview).toContainText('valaxy-theme Skill')
    await expect(preview).toContainText('Blue ink / 蓝色墨水')
    await expect(preview).toContainText('Accessible search / 无障碍搜索')
    await expect(preview).not.toContainText('defineTheme()')

    const name = builder.getByLabel(language.name, { exact: true })
    await name.fill('../unsafe')
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await expect(name).toHaveAccessibleDescription(/小写|lowercase/)
    await expect(copy).toBeDisabled()
    await name.fill('my-archive')
    await expect(copy).toBeEnabled()
    await expect(preview).toContainText('valaxy-theme-my-archive')
    await page.setViewportSize({ width: 390, height: 844 })
    await workspace.click()
    await expect(page.getByRole('listbox')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.keyboard.press('Escape')
    expect(errors).toEqual([])
  })
}
