import type { ResolvedValaxyOptions } from 'valaxy/node'
import type { UserValaxyConfig } from 'valaxy/types'
import { resolve } from 'node:path'
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
})
