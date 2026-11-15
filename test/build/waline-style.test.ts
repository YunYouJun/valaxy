import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { execBuild } from '../../packages/valaxy/node/cli/build'

const addonEntry = resolve(import.meta.dirname, '../../packages/valaxy-addon-waline/index.ts')

async function outputFile(filePath: string, content: string) {
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, content)
}

describe('waline CSS build splitting', () => {
  it('emits Waline CSS separately without merging it into the global CSS bundle', async () => {
    const root = await mkdtemp(join(tmpdir(), 'valaxy-waline-build-'))
    try {
      await outputFile(join(root, 'package.json'), '{"type":"module"}')
      await outputFile(join(root, 'pages/posts/hello.md'), '---\ntitle: Hello\ndate: 2024-01-01\n---\nPost body\n')
      await outputFile(
        join(root, 'valaxy.config.ts'),
        `import { addonWaline } from ${JSON.stringify(addonEntry)}\nexport default { theme: 'yun', addons: [addonWaline({ serverURL: 'https://example.invalid', comment: true })] }\n`,
      )

      await execBuild({ root, ssg: true, output: 'dist', log: 'error' })

      const assetsDir = join(root, 'dist/assets')
      const assets = await readdir(assetsDir)
      const walineCss = assets.find(file => /^waline\..+\.css$/.test(file))
      const globalCss = assets.find(file => /^style\..+\.css$/.test(file))
      expect(walineCss).toBeDefined()
      expect(globalCss).toBeDefined()

      const globalCssContent = await readFile(join(assetsDir, globalCss!), 'utf8')
      expect(globalCssContent).not.toContain('.wl-panel')
      expect(globalCssContent).not.toContain('--waline-font-size')

      const walineCssContent = await readFile(join(assetsDir, walineCss!), 'utf8')
      expect(walineCssContent).toContain('.wl-panel')

      const indexHtml = await readFile(join(root, 'dist/index.html'), 'utf8')
      expect(indexHtml).not.toContain(walineCss!)

      const walineChunk = assets.find(file => file.includes('YunWaline') && file.endsWith('.js'))
      expect(walineChunk).toBeDefined()
      const walineChunkContent = await readFile(join(assetsDir, walineChunk!), 'utf8')
      expect(walineChunkContent).toContain(walineCss!)
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  }, 60_000)
})
