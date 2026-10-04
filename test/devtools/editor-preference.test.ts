// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { openFileInEditor } from '../../packages/devtools/src/client/composables/editor'
import { getClient } from '../../packages/devtools/src/client/rpc'
import { clientOptions, defaultSettings, settings } from '../../packages/devtools/src/client/stores/app'

vi.mock('../../packages/devtools/src/client/rpc', () => ({ getClient: vi.fn() }))

const call = vi.fn()

beforeEach(() => {
  call.mockReset().mockResolvedValue(undefined)
  vi.mocked(getClient).mockResolvedValue({ call } as unknown as Awaited<ReturnType<typeof getClient>>)
  clientOptions.value = { userRoot: '/blog', editor: 'code', editors: ['code', 'cursor'] }
  settings.value = { ...defaultSettings }
})

describe('editor preference dispatch', () => {
  it('uses the Valaxy RPC with the displayed default editor and file position', async () => {
    await openFileInEditor({ path: '/blog/post.md', line: 3, column: 2 })
    expect(call).toHaveBeenCalledExactlyOnceWith('valaxy:service:open:open-in-editor', {
      path: '/blog/post.md',
      line: 3,
      column: 2,
      editor: 'code',
    })
  })

  it('uses a supported browser preference and falls back from obsolete commands', async () => {
    settings.value.editor = 'cursor'
    await openFileInEditor({ path: '/blog' })
    expect(call).toHaveBeenLastCalledWith('valaxy:service:open:open-in-editor', { path: '/blog', editor: 'cursor' })
    settings.value.editor = 'zed'
    await openFileInEditor({ path: '/blog' })
    expect(call).toHaveBeenLastCalledWith('valaxy:service:open:open-in-editor', { path: '/blog', editor: 'code' })
  })

  it('propagates server errors to the calling UI', async () => {
    const error = new Error('Outside allowed roots')
    call.mockRejectedValue(error)
    await expect(openFileInEditor({ path: '/outside' })).rejects.toBe(error)
  })
})
