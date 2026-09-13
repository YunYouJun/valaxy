import type { ValaxyNode } from '../packages/valaxy/node/types'
import { describe, expect, it, vi } from 'vitest'
import { resolveOptions } from '../packages/valaxy/node'
import { createRouterPlugin } from '../packages/valaxy/node/plugins/vueRouter'
import { fixtureFolder } from './shared'

// Capture the file router lifecycle hook without starting a Vite server.
vi.mock('vue-router/vite', () => ({ default: (options: unknown) => options }))

describe('route metadata refresh', () => {
  it('preserves custom layouts and metadata across repeated route extension', async () => {
    const options = await resolveOptions({ userRoot: fixtureFolder.userRoot })
    const app = { options, hooks: { callHook: vi.fn() } } as unknown as ValaxyNode
    const plugin = await createRouterPlugin(app) as unknown as { extendRoute: (value: typeof route) => Promise<void> }
    const route = {
      fullPath: '/release/',
      children: [],
      components: new Map([['default', '/pages/release/index.vue']]),
      meta: { layout: 'release', releasePage: true, frontmatter: { stale: true } } as Record<string, unknown>,
      addToMeta(meta: Record<string, unknown>) {
        Object.assign(this.meta, meta)
      },
    }

    await plugin.extendRoute(route)
    await plugin.extendRoute(route)

    expect(route.meta.layout).toBe('release')
    expect(route.meta.releasePage).toBe(true)
    expect(route.meta.frontmatter).toEqual(options.config.siteConfig.frontmatter)
    expect(route.meta.frontmatter).not.toHaveProperty('stale')
  })
})
