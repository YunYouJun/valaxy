import { resolve } from 'path'
import type { DefaultThemeConfig, SiteConfig } from 'valaxy/types'
import type { ResolvedValaxyOptions, ValaxyConfig } from 'valaxy/node'
import { getIndexHtml } from '../packages/valaxy/node'

const clientRoot = resolve(__dirname, '../packages/valaxy/client')
const themeRoot = resolve(__dirname, 'fixtures/theme')
const userRoot = resolve(__dirname, 'fixtures/user')

describe('utils', () => {
  it('merge index.html', async () => {
    const config = {
      mode: 'light',
    } as ValaxyConfig<DefaultThemeConfig>
    const indexHtml = await getIndexHtml({ clientRoot, themeRoot, userRoot, config } as ResolvedValaxyOptions)

    const head = indexHtml.match(/<head>([\s\S]*?)<\/head>/im)?.[1]
    const body = indexHtml.match(/<body>([\s\S]*?)<\/body>/im)?.[1]

    // theme
    expect(head).toContain('<script src="/theme/head.js"></script>')
    expect(body).toContain('<script src="/theme/body.js"></script>')

    // user
    expect(head).toContain('<script src="/head.js"></script>')
    expect(body).toContain('<script src="/body.js"></script>')
  })

  it('mode light', async () => {
    const config = {
      mode: 'auto',
    } as ValaxyConfig<SiteConfig>
    const indexHtml = await getIndexHtml({ clientRoot, themeRoot, userRoot, config } as ResolvedValaxyOptions)

    const head = indexHtml.match(/<head>([\s\S]*?)<\/head>/im)?.[1]
    expect(head).toContain('prefers-color-scheme: dark')
  })
})
