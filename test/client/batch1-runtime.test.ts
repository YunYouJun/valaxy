// @vitest-environment jsdom
import type { Router } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import ValaxyGirlDetail from '../../packages/valaxy-addon-girls/components/girls/ValaxyGirlDetail.vue'
import VAPhoto from '../../packages/valaxy-addon-lightgallery/components/VAPhoto.vue'
import YunLinkItem from '../../packages/valaxy-theme-yun/components/YunLinkItem.vue'
import AppLink from '../../packages/valaxy/client/components/AppLink.vue'
import { useCopyCode } from '../../packages/valaxy/client/composables/features/copy-code'
import { onClickHref } from '../../packages/valaxy/client/utils/router'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (_key: string, _params: unknown, fallback: string) => fallback }),
}))

vi.mock('valaxy', async () => {
  const { escapeHtml, sanitizeUrl } = await import('../../packages/valaxy/shared')
  const { withBase } = await import('../../packages/valaxy/client/utils/path')
  return { escapeHtml, sanitizeUrl, withBase }
})

describe('batch 1 client runtime safety & cleanup', () => {
  let activeCleanups: (() => void)[] = []

  beforeEach(() => {
    vi.restoreAllMocks()
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    activeCleanups = []
  })

  afterEach(() => {
    vi.useRealTimers()
    window.history.replaceState(null, '', '/')
    for (const cleanup of activeCleanups)
      cleanup()
    activeCleanups = []
  })

  it('onClickHref ref-counts window listeners per router and cleans up only when the last consumer unmounts', async () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const router = { push: vi.fn() } as unknown as Router

    const cleanup1 = onClickHref(router)
    const cleanup2 = onClickHref(router)
    activeCleanups.push(cleanup1, cleanup2)

    expect(cleanup2).not.toBe(cleanup1)
    expect(addSpy.mock.calls.filter(([type]) => type === 'click')).toHaveLength(1)

    // Calling cleanup1 (even multiple times) must keep the listener active for cleanup2
    cleanup1()
    cleanup1()
    expect(removeSpy.mock.calls.filter(([type]) => type === 'click')).toHaveLength(0)

    cleanup2()
    expect(removeSpy.mock.calls.filter(([type]) => type === 'click')).toHaveLength(1)

    // Subsequent registration attaches a fresh listener cleanly
    const cleanup3 = onClickHref(router)
    activeCleanups.push(cleanup3)
    expect(addSpy.mock.calls.filter(([type]) => type === 'click')).toHaveLength(2)
  })

  it('useCopyCode ref-counts window listeners and falls back to execCommand when clipboard rejects', async () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const writeText = vi.fn().mockRejectedValue(new Error('Permission denied'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    const execCommand = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', {
      value: execCommand,
      configurable: true,
    })

    const CodeMount = {
      setup() {
        useCopyCode()
        return () => h('div', 'mounted')
      },
    }

    const c1 = document.createElement('div')
    const c2 = document.createElement('div')
    document.body.append(c1, c2)

    const app1 = createApp(CodeMount)
    const app2 = createApp(CodeMount)
    app1.mount(c1)
    app2.mount(c2)

    expect(addSpy.mock.calls.filter(([type]) => type === 'click')).toHaveLength(1)

    // Build DOM matching VitePress/Valaxy code group markup: div[class*="language-"] > button.copy + span.lang + pre
    const wrapper = document.createElement('div')
    wrapper.className = 'language-ts'
    const btn = document.createElement('button')
    btn.className = 'copy'
    const lang = document.createElement('span')
    lang.className = 'lang'
    const pre = document.createElement('pre')
    const line = document.createElement('span')
    line.className = 'line'
    line.textContent = 'const x = 1'
    pre.appendChild(line)
    wrapper.append(btn, lang, pre)
    document.body.appendChild(wrapper)

    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(writeText).toHaveBeenCalledTimes(1)
    expect(execCommand).toHaveBeenCalledWith('copy')

    app1.unmount()
    expect(removeSpy.mock.calls.filter(([type]) => type === 'click')).toHaveLength(0)

    app2.unmount()
    expect(removeSpy.mock.calls.filter(([type]) => type === 'click')).toHaveLength(1)
  })

  it('sanitizes javascript: URLs and escapes photo metadata HTML', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
    })
    await router.push('/')
    await router.isReady()

    const container = document.createElement('div')
    document.body.appendChild(container)
    const app = createApp({
      render() {
        return h('div', [
          h(AppLink, { href: 'javascript:alert(1)' }, () => 'Bad'),
          h(AppLink, { href: 'java\nscript:alert(2)', target: '_blank' }, () => 'BadBlank'),
          h(YunLinkItem, {
            link: {
              url: 'javascript:alert(3)',
              avatar: '/avatar.png',
              name: 'Friend',
              blog: 'Blog',
              desc: 'Desc',
              color: '#000',
            },
          }),
          h(ValaxyGirlDetail, {
            girl: {
              name: 'Character',
              avatar: '/avatar.png',
              url: 'vbscript:msgbox(1)',
            },
          }),
          h(VAPhoto, {
            photo: {
              src: '/photo.jpg',
              caption: '<img src=x onerror=alert(1)>',
              desc: 'A & "B"',
            },
          }),
        ])
      },
    })
    app.use(router)
    app.mount(container)

    const anchors = container.querySelectorAll('a')
    expect(anchors[0].getAttribute('href')).toBe('/#')
    expect(anchors[1].getAttribute('href')).toBe('#')
    expect(anchors[2].getAttribute('href')).toBe('#')
    expect(anchors[3].getAttribute('href')).toBe('#')

    const figure = container.querySelector('figure.va-photo-list-item')!
    expect(figure.getAttribute('data-sub-html')).toBe(
      '<h4>&lt;img src=x onerror=alert(1)&gt;</h4><p>A &amp; &quot;B&quot;</p>',
    )

    app.unmount()
  })

  it('copies header-anchor link synchronously, scrolls to its heading, and clears .is-copied after timeout', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    let resolvePush!: () => void
    const push = vi.fn().mockImplementation(() => new Promise<void>((resolve) => {
      resolvePush = resolve
    }))
    const router = { push } as unknown as Router
    activeCleanups.push(onClickHref(router))

    const heading = document.createElement('h2')
    heading.id = 'section-one'
    heading.getBoundingClientRect = () => ({ top: 320 } as DOMRect)
    const anchor = document.createElement('a')
    anchor.className = 'header-anchor'
    anchor.href = '#section-one'
    anchor.getBoundingClientRect = () => ({ top: 999 } as DOMRect)
    heading.append('Section One ', anchor)
    document.body.appendChild(heading)

    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    // Clipboard write must start synchronously before router.push settles
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText).toHaveBeenCalledWith(anchor.href)
    expect(push).toHaveBeenCalledWith({ hash: '#section-one' })

    resolvePush()
    await vi.advanceTimersByTimeAsync(0)

    expect(anchor.classList.contains('is-copied')).toBe(true)
    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 256,
      behavior: 'smooth',
    })

    await vi.advanceTimersByTimeAsync(1600)
    expect(anchor.classList.contains('is-copied')).toBe(false)
  })

  it('re-copies active header-anchor without pushing duplicate history and ignores regular hash links', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    const push = vi.fn().mockResolvedValue(undefined)
    const router = { push } as unknown as Router
    activeCleanups.push(onClickHref(router))

    window.history.replaceState(null, '', '#section-active')

    const heading = document.createElement('h2')
    heading.id = 'section-active'
    const anchor = document.createElement('a')
    anchor.className = 'header-anchor'
    anchor.href = '#section-active'
    heading.append('Active Section ', anchor)

    const regularLink = document.createElement('a')
    regularLink.href = '#other-section'
    regularLink.textContent = 'Jump'
    document.body.append(heading, regularLink)

    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(0)

    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText).toHaveBeenCalledWith(anchor.href)
    expect(push).not.toHaveBeenCalled()
    expect(anchor.classList.contains('is-copied')).toBe(true)

    regularLink.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(0)

    expect(writeText).toHaveBeenCalledTimes(1)
    expect(regularLink.classList.contains('is-copied')).toBe(false)
  })

  it('falls back to execCommand when clipboard.writeText rejects for header-anchor clicks', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockRejectedValue(new Error('Permission denied'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    const execCommand = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', {
      value: execCommand,
      configurable: true,
    })
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    const push = vi.fn().mockResolvedValue(undefined)
    const router = { push } as unknown as Router
    activeCleanups.push(onClickHref(router))

    const heading = document.createElement('h2')
    heading.id = 'fallback-section'
    const anchor = document.createElement('a')
    anchor.className = 'header-anchor'
    anchor.href = '#fallback-section'
    heading.append('Fallback ', anchor)
    document.body.appendChild(heading)

    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(0)

    expect(writeText).toHaveBeenCalledTimes(1)
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(anchor.classList.contains('is-copied')).toBe(true)

    await vi.advanceTimersByTimeAsync(1600)
    expect(anchor.classList.contains('is-copied')).toBe(false)
  })
})
