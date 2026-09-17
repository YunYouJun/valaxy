import type { ValaxyPageDebug } from '../../packages/devtools/src/page'
import type { ClientPageData } from '../../packages/devtools/src/shared/rpc'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createValaxyPageBridge } from '../../packages/devtools/src/page'

const transport = vi.hoisted(() => ({
  channels: [] as { getPage: () => ClientPageData, emit: ReturnType<typeof vi.fn>, close: ReturnType<typeof vi.fn> }[],
}))
vi.mock('devframe/in-page-channel', () => ({
  createPageScriptChannel(options: { functions: { getPage: { handler: () => ClientPageData } } }) {
    const channel = { getPage: options.functions.getPage.handler, emit: vi.fn(), close: vi.fn() }
    transport.channels.push(channel)
    return channel
  },
}))

async function createTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: {} },
      { path: '/posts/:slug', component: {}, meta: { headers: [], filePath: '/blog/pages/posts/hello.md', frontmatter: { title: 'Hello', tags: ['vue'] } } },
    ],
  })
  await router.push('/')
  return router
}

describe('live page diagnostics', () => {
  it('preserves the original page bridge API when no diagnostics provider is supplied', async () => {
    const router = await createTestRouter()
    const bridge = createValaxyPageBridge(router)
    expect(transport.channels.at(-1)!.getPage()).toEqual({ routePath: '/', filePath: '', frontmatter: {} })
    bridge.close()
  })

  it('captures fresh, detached browser diagnostics on queries, route changes and explicit sync', async () => {
    const router = await createTestRouter()
    let width = 1440
    const themeConfig = { color: 'violet' }
    const getDebug = (): ValaxyPageDebug => ({
      route: {
        path: router.currentRoute.value.path,
        fullPath: router.currentRoute.value.fullPath,
        layout: 'post',
        query: router.currentRoute.value.query,
        params: router.currentRoute.value.params,
      },
      viewport: { width, height: 900, breakpoints: [{ label: 'md', active: width >= 768 }] },
      config: { theme: 'yun', site: { lang: 'zh-CN' }, themeConfig },
    })
    const bridge = createValaxyPageBridge(router, { getDebug })
    const channel = transport.channels.at(-1)!
    await router.push('/posts/hello?preview=true')
    const snapshot = channel.getPage()
    expect(snapshot.routePath).toBe('/posts/hello')
    expect(snapshot.frontmatter.title).toBe('Hello')
    expect(snapshot.debug?.route).toMatchObject({ query: { preview: 'true' }, params: { slug: 'hello' } })
    expect(channel.emit).toHaveBeenLastCalledWith('pageUpdated', snapshot)
    width = 390
    themeConfig.color = 'blue'
    bridge.sync()
    expect(channel.emit).toHaveBeenLastCalledWith('pageUpdated', expect.objectContaining({
      debug: expect.objectContaining({
        viewport: { width: 390, height: 900, breakpoints: [{ label: 'md', active: false }] },
        config: expect.objectContaining({ themeConfig: { color: 'blue' } }),
      }),
    }))
    expect(snapshot.debug?.config.themeConfig.color).toBe('violet')
    bridge.close()
  })

  it('stops publishing route changes after the page bridge is disposed', async () => {
    const router = await createTestRouter()
    const bridge = createValaxyPageBridge(router)
    const channel = transport.channels.at(-1)!
    bridge.close()
    await router.push('/posts/hello')
    expect(channel.emit).not.toHaveBeenCalled()
    expect(channel.close).toHaveBeenCalledOnce()
  })
})
