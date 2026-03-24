import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { defaultThemeConfig } from '../packages/valaxy-theme-yun'
import themePkg from '../packages/valaxy-theme-yun/package.json'
import { resolveOptions } from '../packages/valaxy/node'
import { replaceArrMerge } from '../packages/valaxy/node/config/merge'
import { mergeValaxyConfig } from '../packages/valaxy/node/config/valaxy'
import { fixtureFolder } from './shared'

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

describe('merge config helpers', () => {
  it('replaceArrMerge handles empty arrays', () => {
    expect(replaceArrMerge({ arr: [] }, { arr: [1, 2, 3] }).arr).toEqual([])
    expect(replaceArrMerge({ arr: [1, 2] }, { arr: [] }).arr).toEqual([1, 2])
  })

  it('replaceArrMerge handles nested objects with arrays', () => {
    const result = replaceArrMerge(
      { config: { items: ['new'] } },
      { config: { items: ['old'], other: 'value' } },
    )
    expect(result.config.items).toEqual(['new'])
    expect(result.config.other).toBe('value')
  })

  it('mergeValaxyConfig merges vite config with Vite strategy', () => {
    const merged = mergeValaxyConfig(
      {
        vite: {
          plugins: ['user-plugin'],
          resolve: {
            alias: [{ find: '@', replacement: '/user' }],
          },
        },
      },
      {
        vite: {
          plugins: ['theme-plugin'],
          resolve: {
            alias: [{ find: '#', replacement: '/theme' }],
          },
        },
      },
    )

    expect(merged.vite).toEqual({
      plugins: ['theme-plugin', 'user-plugin'],
      resolve: {
        alias: [
          { find: '@', replacement: '/user' },
          { find: '#', replacement: '/theme' },
        ],
      },
    })
  })

  it('mergeValaxyConfig composes function hooks without recursion', () => {
    const calls: string[] = []
    const merged = mergeValaxyConfig(
      {
        hook(this: { name: string }, value: string) {
          calls.push(`user:${this.name}:${value}`)
        },
      },
      {
        hook(this: { name: string }, value: string) {
          calls.push(`theme:${this.name}:${value}`)
        },
      },
    )

    merged.hook.call({ name: 'ctx' }, 'payload')

    expect(calls).toEqual([
      'theme:ctx:payload',
      'user:ctx:payload',
    ])
  })
})
