import type { ValaxyNode } from '../../packages/valaxy/node/types'
import { ValaxyMcp } from '@valaxyjs/devtools/mcp'
import { createServer as createViteServer } from 'vite'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultValaxyConfig } from '../../packages/valaxy/node/config/valaxy'
import { createServer } from '../../packages/valaxy/node/server'

vi.mock('../../packages/valaxy/node/plugins/preset', () => ({ ViteValaxyPlugins: async () => [] }))
vi.mock('@valaxyjs/devtools/mcp', () => ({ ValaxyMcp: vi.fn(() => ({ name: 'valaxy:mcp' })) }))
vi.mock('@valaxyjs/devtools', () => ({ default: () => ({ name: 'valaxy:devtools' }) }))
vi.mock('vite-plugin-vue-devtools', () => ({ default: () => ({ name: 'vue:devtools' }) }))
vi.mock('vite', async (importOriginal) => {
  const vite = await importOriginal<typeof import('vite')>()
  return { ...vite, createServer: vi.fn(async () => ({})) }
})

beforeEach(() => vi.clearAllMocks())

describe('valaxy MCP configuration', () => {
  async function configure(mcp = defaultValaxyConfig.mcp, devtools = true) {
    const node = { options: { userRoot: '/blog', addons: [], config: { mcp, devtools } } } as unknown as ValaxyNode
    await createServer(node)
    return vi.mocked(createViteServer).mock.calls[0][0]!
  }

  it('keeps MCP off by default even when the DevTools panel is enabled', async () => {
    const config = await configure()
    expect(ValaxyMcp).not.toHaveBeenCalled()
    expect(config.devtools).toEqual({ apply: 'serve', mcp: false })
  })

  it('enables the isolated endpoint independently of the panel', async () => {
    const config = await configure(true, false)
    expect(ValaxyMcp).toHaveBeenCalledWith(expect.objectContaining({ userRoot: '/blog', content: { inspectPage: expect.any(Function), checkPage: expect.any(Function), dispose: expect.any(Function) } }))
    expect(config.plugins).toContainEqual({ name: 'valaxy:mcp' })
    expect(config.devtools).toBe(false)
  })

  it('passes explicit draft visibility without enabling the Vite host MCP', async () => {
    const config = await configure({ includeDrafts: true })
    expect(ValaxyMcp).toHaveBeenCalledWith(expect.objectContaining({ userRoot: '/blog', includeDrafts: true }))
    expect(config.devtools).toEqual({ apply: 'serve', mcp: false })
  })

  it('removes the endpoint when explicitly disabled', async () => {
    const config = await configure(false, false)
    expect(ValaxyMcp).not.toHaveBeenCalled()
    expect(config.plugins).toEqual([])
  })
})
