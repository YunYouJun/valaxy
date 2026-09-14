import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, reactive, ref } from 'vue'

const route = reactive({ path: '/posts/first/' })
const siteConfig = ref({ llms: { enable: true, files: true } })
const clientEnvironment = vi.hoisted(() => ({ isClient: true }))
const copyToClipboard = vi.hoisted(() => vi.fn())

vi.mock('@vueuse/core', () => ({
  get isClient() { return clientEnvironment.isClient },
  useClipboard: () => ({ copy: copyToClipboard }),
}))
vi.mock('vue-router', () => ({ useRoute: () => route }))
vi.mock('../../packages/valaxy/client/config', () => ({ useSiteConfig: () => siteConfig }))

const { useCopyMarkdown } = await import('../../packages/valaxy/client/composables/features/copy-markdown')

const fetchMock = vi.fn<typeof fetch>()
let scope: ReturnType<typeof effectScope>

function setupCopyMarkdown() {
  return scope.run(() => useCopyMarkdown())!
}

async function flushAvailabilityProbe() {
  await Promise.resolve()
  await Promise.resolve()
  await nextTick()
}

function pendingRequest() {
  const request = Promise.withResolvers<Response>()
  fetchMock.mockReturnValueOnce(request.promise)
  return request
}

beforeEach(() => {
  scope = effectScope()
  route.path = '/posts/first/'
  siteConfig.value = { llms: { enable: true, files: true } }
  clientEnvironment.isClient = true
  copyToClipboard.mockReset()
  fetchMock.mockReset()
  fetchMock.mockResolvedValue(new Response(null, { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  scope.stop()
  vi.unstubAllGlobals()
})

describe('useCopyMarkdown availability', () => {
  it.each([
    { enable: false, files: true },
    { enable: true, files: false },
    { enable: false, files: false },
  ])('skips requests when output is disabled: %j', async (llms) => {
    siteConfig.value.llms = llms
    const { available } = setupCopyMarkdown()
    route.path = '/posts/second'
    await nextTick()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(available.value).toBe(false)
  })

  it('does not probe during SSR', () => {
    clientEnvironment.isClient = false
    expect(setupCopyMarkdown().available.value).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([200, 404])('uses the HEAD response status %i', async (status) => {
    fetchMock.mockResolvedValue(new Response(null, { status }))
    const { available } = setupCopyMarkdown()
    expect(available.value).toBe(false)
    await flushAvailabilityProbe()
    expect(fetchMock).toHaveBeenCalledWith('/posts/first.md', {
      method: 'HEAD',
      signal: expect.any(AbortSignal),
    })
    expect(available.value).toBe(status === 200)
  })

  it('keeps Markdown unavailable on network failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network failure'))
    const { available, error } = setupCopyMarkdown()
    await flushAvailabilityProbe()
    expect(available.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it.each(['resolve', 'reject'] as const)('ignores a stale request that later %ss', async (settlement) => {
    const first = pendingRequest()
    const { available } = setupCopyMarkdown()
    const signal = fetchMock.mock.calls[0][1]!.signal!
    route.path = '/posts/second'
    await flushAvailabilityProbe()
    expect(signal.aborted).toBe(true)
    expect(available.value).toBe(true)

    if (settlement === 'resolve')
      first.resolve(new Response(null, { status: 404 }))
    else
      first.reject(new Error('Aborted'))
    await flushAvailabilityProbe()
    expect(available.value).toBe(true)
  })

  it('aborts a pending probe when output is disabled', async () => {
    const request = pendingRequest()
    const { available } = setupCopyMarkdown()
    const signal = fetchMock.mock.calls[0][1]!.signal!
    siteConfig.value.llms.enable = false
    await nextTick()
    expect(signal.aborted).toBe(true)
    request.resolve(new Response(null, { status: 200 }))
    await flushAvailabilityProbe()
    expect(available.value).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('aborts a pending probe when its scope is disposed', async () => {
    const request = pendingRequest()
    const { available } = setupCopyMarkdown()
    const signal = fetchMock.mock.calls[0][1]!.signal!
    scope.stop()
    expect(signal.aborted).toBe(true)
    request.resolve(new Response(null, { status: 200 }))
    await flushAvailabilityProbe()
    expect(available.value).toBe(false)
  })
})

describe('useCopyMarkdown copy', () => {
  it('fetches and copies the current Markdown file', async () => {
    const { copy, copied, error, loading } = setupCopyMarkdown()
    await flushAvailabilityProbe()
    fetchMock.mockClear()
    fetchMock.mockResolvedValueOnce(new Response('# First post', { status: 200 }))

    await copy()

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledWith('/posts/first.md')
    expect(copyToClipboard).toHaveBeenCalledWith('# First post')
    expect(copied.value).toBe(true)
    expect(error.value).toBeNull()
    expect(loading.value).toBe(false)
  })

  it('reports a failed Markdown response without copying it', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { copy, error, loading } = setupCopyMarkdown()
    await flushAvailabilityProbe()
    fetchMock.mockClear()
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }))

    await copy()

    expect(copyToClipboard).not.toHaveBeenCalled()
    expect(error.value).toBe('Failed to fetch /posts/first.md: 404')
    expect(loading.value).toBe(false)
    expect(consoleError).toHaveBeenCalledOnce()
  })

  it('ignores repeated copy requests while one is loading', async () => {
    const { copy, loading } = setupCopyMarkdown()
    await flushAvailabilityProbe()
    fetchMock.mockClear()
    const request = pendingRequest()

    const firstCopy = copy()
    const repeatedCopy = copy()

    expect(loading.value).toBe(true)
    expect(fetchMock).toHaveBeenCalledOnce()
    await repeatedCopy
    request.resolve(new Response('# First post', { status: 200 }))
    await firstCopy
    expect(copyToClipboard).toHaveBeenCalledOnce()
    expect(loading.value).toBe(false)
  })
})
