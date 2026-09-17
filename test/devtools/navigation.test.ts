import type { DevToolsFrameTab } from '@vitejs/devtools-kit/client'
import { FRAME_NAV_CHANNEL, FRAME_NAV_VERSION } from '@vitejs/devtools-kit/client'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { getPostDraft, resetPostDraft } from '../../packages/devtools/src/client/stores/drafts'
import { connectFrameNavigation } from '../../packages/devtools/src/client/utils/frame-navigation'
import { DEVTOOLS_FRAME_ID } from '../../packages/devtools/src/shared/constants'

async function setupNavigation() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: ['/', '/posts', '/categories', '/tags'].map(path => ({ path, component: {} })),
  })
  await router.push('/')
  const tabs: DevToolsFrameTab[] = [
    { id: 'dashboard', title: 'Dashboard', navTarget: { path: '/' } },
    { id: 'posts', title: 'Posts', navTarget: { path: '/posts' } },
    { id: 'categories', title: 'Categories', navTarget: { path: '/categories' } },
    { id: 'tags', title: 'Tags', navTarget: { path: '/tags' } },
  ]
  const listeners = new Set<(event: MessageEvent) => void>()
  const parent = { postMessage: vi.fn() }
  const origin = 'http://localhost:4862'
  const errors = vi.fn()
  const bridge = connectFrameNavigation(router, {
    tabs: () => tabs,
    onError: errors,
    window: {
      parent,
      location: { origin },
      addEventListener: (_type, listener) => listeners.add(listener),
      removeEventListener: (_type, listener) => listeners.delete(listener),
    },
  })
  const receive = (payload: Record<string, unknown>, overrides: { origin?: string, source?: unknown } = {}) => {
    const event = new MessageEvent('message', {
      origin: overrides.origin ?? origin,
      data: { channel: FRAME_NAV_CHANNEL, v: FRAME_NAV_VERSION, frameId: DEVTOOLS_FRAME_ID, from: 'host', ...payload },
    })
    Object.defineProperty(event, 'source', { value: overrides.source ?? parent })
    for (const listener of listeners)
      listener(event)
  }
  await router.isReady()
  return { router, tabs, bridge, receive, parent, origin, listeners, errors }
}

describe('hub frame navigation', () => {
  it('announces pages, updates localized labels, and synchronizes host and app navigation', async () => {
    const { router, tabs, bridge, receive, parent, origin } = await setupNavigation()
    expect(parent.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'ready', tabs, current: 'dashboard' }), origin)
    receive({ type: 'navigate', tabId: 'categories', navTarget: { path: '/categories' } })
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/categories'))
    expect(parent.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'navigated', tabId: 'categories' }), origin)
    await router.push({ path: '/posts', query: { path: '/posts/hello' } })
    expect(parent.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'navigated', tabId: 'posts' }), origin)
    receive({ type: 'navigate', tabId: 'posts', navTarget: { path: '/posts' } })
    expect(router.currentRoute.value.query.path).toBe('/posts/hello')
    tabs[1].title = '文章'
    bridge.update()
    expect(parent.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'manifest', current: 'posts', tabs }), origin)
    router.back()
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/categories'))
    expect(parent.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ tabId: 'categories' }), origin)
    bridge.dispose()
  })

  it('ignores other origins, sibling frames, incompatible envelopes and undeclared targets', async () => {
    const { router, bridge, receive, parent, errors } = await setupNavigation()
    const payload = { type: 'navigate', tabId: 'tags', navTarget: { path: '/tags' } }
    receive(payload, { origin: 'https://example.com' })
    receive(payload, { source: {} })
    receive({ ...payload, frameId: 'other' })
    receive({ ...payload, v: 2 })
    receive({ ...payload, from: 'frame' })
    receive({ ...payload, channel: 'other' })
    receive({ ...payload, tabId: 'unknown' })
    await Promise.resolve()
    expect(router.currentRoute.value.path).toBe('/')
    receive({ ...payload, navTarget: { path: 'https://example.com' } })
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/tags'))
    expect(errors).not.toHaveBeenCalled()
    expect(parent.postMessage.mock.calls.every(([, origin]) => origin === 'http://localhost:4862')).toBe(true)
    bridge.dispose()
  })

  it('restores the host selection after a guard cancels and disposes all listeners', async () => {
    const { router, bridge, receive, parent, origin, listeners } = await setupNavigation()
    router.beforeEach(to => to.path !== '/tags')
    receive({ type: 'navigate', tabId: 'tags' })
    await vi.waitFor(() => expect(parent.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'navigated', tabId: 'dashboard' }), origin))
    bridge.dispose()
    expect(listeners.size).toBe(0)
    parent.postMessage.mockClear()
    bridge.update()
    await router.push('/posts')
    expect(parent.postMessage).not.toHaveBeenCalled()
  })
})

describe('frontmatter drafts across navigation', () => {
  it('retains a file draft across editor remounts and distinguishes external changes', () => {
    const path = '/draft-retention.md'
    const draft = getPostDraft(path, { title: 'Original' })
    draft.frontmatter.title = 'Unsaved'
    expect(getPostDraft(path, { title: 'External change' })).toBe(draft)
    expect(draft.frontmatter.title).toBe('Unsaved')
    expect(draft.baseline).toBe(JSON.stringify({ title: 'Original' }))
    resetPostDraft(draft, { title: 'External change' })
    expect(draft.frontmatter.title).toBe('External change')
    expect(draft.baseline).toBe(JSON.stringify({ title: 'External change' }))
  })

  it('isolates different files and adopts fresh data when no local draft was edited', () => {
    const source = { title: 'Original', tags: ['one'] }
    const draft = getPostDraft('/first-draft.md', source)
    draft.frontmatter.tags!.push('two')
    expect(source.tags).toEqual(['one'])
    const other = getPostDraft('/second-draft.md', source)
    expect(other.frontmatter.tags).toEqual(['one'])
    expect(getPostDraft('/second-draft.md', { title: 'Updated' }).frontmatter.title).toBe('Updated')
    expect(getPostDraft('/first-draft.md', source).frontmatter.tags).toEqual(['one', 'two'])
  })
})
