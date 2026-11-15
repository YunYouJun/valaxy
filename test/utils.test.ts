import type { ResolvedValaxyOptions } from '../packages/valaxy/node'
import type { UserValaxyConfig } from '../packages/valaxy/types'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import fs from 'fs-extra'
import { describe, expect, it } from 'vitest'
import { getIndexHtml } from '../packages/valaxy/node'

const clientRoot = resolve(__dirname, '../packages/valaxy/client')
const themeRoot = resolve(__dirname, 'fixtures/theme')
const userRoot = resolve(__dirname, 'fixtures/user')

describe('utils', () => {
  it('merge index.html', async () => {
    const config: UserValaxyConfig = {
      siteConfig: { mode: 'light' },
    }

    const templatePath = resolve(clientRoot, 'template.html')
    const indexPath = resolve(clientRoot, 'index.html')

    const rawHtml = fs.readFileSync(indexPath, 'utf-8')

    if (fs.existsSync(templatePath))
      await fs.copyFile(templatePath, indexPath)
    const indexHtml = await getIndexHtml({ clientRoot, themeRoot, userRoot, config } as ResolvedValaxyOptions, rawHtml)

    const head = indexHtml.match(/<head>([\s\S]*?)<\/head>/i)?.[1]
    const body = indexHtml.match(/<body>([\s\S]*?)<\/body>/i)?.[1]

    // theme
    expect(head).toContain('<script src="/theme/head.js"></script>')
    expect(body).toContain('<script src="/theme/body.js"></script>')

    // user
    expect(head).toContain('<script src="/head.js"></script>')
    expect(body).toContain('<script src="/body.js"></script>')
  })

  it('mode light', async () => {
    const config: UserValaxyConfig = {
      siteConfig: { mode: 'auto' },
    }
    const rawHtml = fs.readFileSync(resolve(clientRoot, 'index.html'), 'utf-8')
    const indexHtml = await getIndexHtml({ clientRoot, themeRoot, userRoot, config } as ResolvedValaxyOptions, rawHtml)

    const head = indexHtml.match(/<head>([\s\S]*?)<\/head>/i)?.[1]
    expect(head).toContain('prefers-color-scheme: dark')
  })

  it('safely serializes favicon, lang, and $-patterns in injected head/body HTML', async () => {
    const tempUserRoot = mkdtempSync(join(tmpdir(), 'valaxy-index-html-'))
    try {
      writeFileSync(
        join(tempUserRoot, 'index.html'),
        '<head><meta name="price" content="$& $$ $\'"></head><body><div>body $&</div></body>',
      )
      const rawHtml = fs.readFileSync(resolve(clientRoot, 'index.html'), 'utf-8')
      const config = {
        siteConfig: {
          mode: 'light',
          favicon: 'javascript:alert(1)',
          lang: `en'</script><script>alert(1)</script>`,
        },
      } as unknown as UserValaxyConfig

      const indexHtml = await getIndexHtml({ clientRoot, themeRoot, userRoot: tempUserRoot, config } as ResolvedValaxyOptions, rawHtml)
      expect(indexHtml).not.toContain('javascript:alert(1)')
      expect(indexHtml).not.toContain('<script>alert(1)</script>')
      expect(indexHtml).toContain('<meta name="price" content="$& $$ $\'">')
      expect(indexHtml).toContain('<div>body $&</div>')
      expect(indexHtml).toContain('en\\u0027\\u003c\\u002fscript\\u003e')
    }
    finally {
      rmSync(tempUserRoot, { recursive: true, force: true })
    }
  })

  it('preserves valid data:image favicons while escaping HTML attribute quotes', async () => {
    const rawHtml = fs.readFileSync(resolve(clientRoot, 'index.html'), 'utf-8')
    const config = {
      siteConfig: {
        mode: 'light',
        favicon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
      },
    } as unknown as UserValaxyConfig

    const indexHtml = await getIndexHtml({ clientRoot, themeRoot, userRoot, config } as ResolvedValaxyOptions, rawHtml)
    expect(indexHtml).toContain('<link rel="icon" href="data:image/svg+xml,&lt;svg xmlns=&quot;http://www.w3.org/2000/svg&quot;/&gt;">')
  })
})
