import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { defaultThemeConfig } from '../packages/valaxy-theme-yun'
import themePkg from '../packages/valaxy-theme-yun/package.json'
import { resolveOptions } from '../packages/valaxy/node'
import { replaceArrMerge } from '../packages/valaxy/node/config/merge'
import { fixtureFolder } from './shared'

// todo merge config test
describe('resolved Valaxy Options', async () => {
  const options = await resolveOptions({ userRoot: fixtureFolder.userRoot })
  const { config } = options
  const { siteConfig, themeConfig } = config

  it('configFile', async () => {
    expect(options.configFile).toBe(resolve(fixtureFolder.userRoot, 'valaxy.config.ts'))
    expect(options.siteConfigFile).toBe(resolve(fixtureFolder.userRoot, 'site.config.ts'))
    expect(options.themeConfigFile).toBe(resolve(fixtureFolder.userRoot, 'theme.config.ts'))

    expect(options.theme).toBe('yun')
  })

  it('merge site config', async () => {
    expect(siteConfig.author).toEqual({
      name: 'Site.Config',
      email: '',
      link: 'https://valaxy.site',
      avatar: 'https://valaxy.site/valaxy-logo.png',
      status: {
        emoji: '🌌',
        message: 'The moonlight is beautiful.',
      },
    })
  })

  it('merge theme config', async () => {
    expect(themeConfig.pkg).toEqual(themePkg)
    // theme.config.ts override valaxyConfig.themeConfig
    expect(themeConfig).toEqual(
      replaceArrMerge({
        arr: [1, 2, 3],
        pages: [
          {
            name: '喜欢的女孩子',
            url: '/girls/',
            icon: 'i-ri-women-line',
            color: 'hotpink',
          },
        ],
      }, defaultThemeConfig, { pkg: themePkg }),
    )
  })
})
