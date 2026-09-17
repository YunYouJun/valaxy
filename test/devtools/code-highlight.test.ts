import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useCodeHighlight } from '../../packages/devtools/src/client/composables/code-highlight'
import { connectionStatus, getClient } from '../../packages/devtools/src/client/rpc'

vi.mock('../../packages/devtools/src/client/rpc', async () => {
  const { ref } = await import('vue')
  return { connectionStatus: ref('connected'), getClient: vi.fn() }
})

const highlight = vi.fn<(name: string, input: { code: string, lang: string }) => Promise<{ html: string }>>()
const getService = vi.fn<() => { rpc: { call: typeof highlight } } | undefined>()
let scope: ReturnType<typeof effectScope>

beforeEach(() => {
  scope = effectScope()
  connectionStatus.value = 'connected'
  highlight.mockReset()
  getService.mockReset().mockReturnValue({ rpc: { call: highlight } })
  vi.mocked(getClient).mockReset().mockResolvedValue({ services: { get: getService } } as unknown as Awaited<ReturnType<typeof getClient>>)
})

afterEach(() => scope.stop())

async function flush() {
  await nextTick()
  await Promise.resolve()
  await Promise.resolve()
}

describe('devframe code highlighting', () => {
  it('uses the shared service and ignores late results for an older page', async () => {
    let finishOld!: (value: { html: string }) => void
    highlight.mockReturnValueOnce(new Promise((resolve) => {
      finishOld = resolve
    }))
      .mockResolvedValueOnce({ html: '<pre>new</pre>' })
    const code = ref('old')
    const html = scope.run(() => useCodeHighlight(code, 'json'))!
    await flush()
    expect(html.value).toBe('')
    code.value = 'new'
    await flush()
    expect(getService).toHaveBeenCalledWith('@devframes/service-shiki')
    expect(highlight).toHaveBeenLastCalledWith('highlight', { code: 'new', lang: 'json' })
    expect(html.value).toBe('<pre>new</pre>')
    finishOld({ html: '<pre>old</pre>' })
    await flush()
    expect(html.value).toBe('<pre>new</pre>')
  })

  it('clears stale highlighting and falls back when a new request fails', async () => {
    highlight.mockResolvedValueOnce({ html: '<pre>old</pre>' }).mockRejectedValueOnce(new Error('Disconnected'))
    const code = ref('old')
    const html = scope.run(() => useCodeHighlight(code, 'json'))!
    await flush()
    expect(html.value).toBe('<pre>old</pre>')
    code.value = 'new'
    await flush()
    expect(html.value).toBe('')
  })

  it('retries after reconnection and tolerates hosts without the service', async () => {
    getService.mockReturnValueOnce(undefined)
    const html = scope.run(() => useCodeHighlight('{}', 'json'))!
    await flush()
    expect(html.value).toBe('')
    expect(highlight).not.toHaveBeenCalled()
    connectionStatus.value = 'connecting'
    await flush()
    highlight.mockResolvedValueOnce({ html: '<pre>{}</pre>' })
    connectionStatus.value = 'connected'
    await flush()
    expect(html.value).toBe('<pre>{}</pre>')
  })

  it('discards pending results after the panel is unmounted', async () => {
    let finish!: (value: { html: string }) => void
    highlight.mockReturnValueOnce(new Promise((resolve) => {
      finish = resolve
    }))
    const html = scope.run(() => useCodeHighlight('{}', 'json'))!
    await flush()
    scope.stop()
    finish({ html: '<pre>{}</pre>' })
    await flush()
    expect(html.value).toBe('')
  })
})
