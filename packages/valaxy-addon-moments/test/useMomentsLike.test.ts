// @vitest-environment jsdom

import type { MaybeRefOrGetter } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, shallowRef } from 'vue'
import { useMomentsLike } from '../client/useMomentsLike'

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

function mountMomentsLike(momentIds: MaybeRefOrGetter<readonly string[]>) {
  let likes!: ReturnType<typeof useMomentsLike>
  const app = createApp({
    setup() {
      likes = useMomentsLike({
        enabled: true,
        endpoint: '/api/moments-like',
        momentIds,
      })
      return () => null
    },
  })
  app.mount(document.createElement('div'))
  return { app, likes }
}

afterEach(() => {
  vi.unstubAllGlobals()
  window.localStorage.clear()
})

describe('useMomentsLike', () => {
  it('merges a delayed GET without overwriting a moment updated by POST', async () => {
    const getResponse = deferred<Response>()
    const fetcher = vi.fn<typeof fetch>((_input, init) => {
      if (init?.method === 'POST')
        return Promise.resolve(new Response(JSON.stringify({ count: 13 })))
      return getResponse.promise
    })
    vi.stubGlobal('fetch', fetcher)

    const { app, likes } = mountMomentsLike(['/moments/a', '/moments/b'])
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    await likes.toggle('/moments/a')
    expect(likes.counts.value['/moments/a']).toBe(13)

    getResponse.resolve(new Response(JSON.stringify({
      '/moments/a': 12,
      '/moments/b': 7,
    })))

    await vi.waitFor(() => expect(likes.counts.value['/moments/b']).toBe(7))
    expect(likes.counts.value['/moments/a']).toBe(13)
    app.unmount()
  })

  it('aborts a pending GET when its component scope is destroyed', async () => {
    let requestSignal: AbortSignal | undefined
    const fetcher = vi.fn<typeof fetch>((_input, init) => new Promise<Response>((_resolve, reject) => {
      requestSignal = init?.signal ?? undefined
      requestSignal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
    }))
    vi.stubGlobal('fetch', fetcher)

    const { app } = mountMomentsLike(['/moments/a'])
    await vi.waitFor(() => expect(requestSignal).toBeDefined())
    app.unmount()

    expect(requestSignal?.aborted).toBe(true)
  })

  it('aborts and discards a stale GET when the moment IDs change', async () => {
    const momentIds = shallowRef<readonly string[]>(['/moments/a'])
    const firstResponse = deferred<Response>()
    const staleJsonRead = deferred<boolean>()
    const requestSignals: AbortSignal[] = []
    const fetcher = vi.fn<typeof fetch>((_input, init) => {
      requestSignals.push(init?.signal as AbortSignal)
      if (requestSignals.length === 1)
        return firstResponse.promise
      return Promise.resolve(new Response(JSON.stringify({ '/moments/b': 4 })))
    })
    vi.stubGlobal('fetch', fetcher)

    const { app, likes } = mountMomentsLike(momentIds)
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    momentIds.value = ['/moments/b']
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
    expect(requestSignals[0].aborted).toBe(true)
    await vi.waitFor(() => expect(likes.counts.value['/moments/b']).toBe(4))

    firstResponse.resolve({
      json: async () => {
        staleJsonRead.resolve(true)
        return { '/moments/a': 9 }
      },
      ok: true,
      status: 200,
    } as Response)
    await staleJsonRead.promise
    await Promise.resolve()
    expect(likes.counts.value['/moments/a']).toBeUndefined()
    app.unmount()
  })
})
