// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import ChooseCompare from '../docs/components/ChooseCompare.vue'

const mounts: Array<{ unmount: () => void, host: HTMLElement }> = []

async function mountCompare(lang: 'en' | 'zh') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
  })
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(ChooseCompare, { lang })
  app.use(router)
  app.mount(host)
  await router.isReady()
  await nextTick()
  const mounted = {
    host,
    unmount() {
      app.unmount()
      host.remove()
    },
  }
  mounts.push(mounted)
  return mounted
}

function tabs(host: HTMLElement) {
  return [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
}

function tabNamed(host: HTMLElement, name: string) {
  const match = tabs(host).find(item => item.textContent?.includes(name))
  if (!match)
    throw new Error(`missing tab ${name}`)
  return match
}

function press(target: HTMLElement, key: string) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}

afterEach(() => {
  while (mounts.length > 0)
    mounts.pop()?.unmount()
})

describe('choose comparison', () => {
  it('starts on Valaxy with the other rows and frameworks collapsed', async () => {
    const { host } = await mountCompare('en')
    const selected = tabs(host).filter(item => item.getAttribute('aria-selected') === 'true')
    expect(selected).toHaveLength(1)
    expect(selected[0]?.textContent).toContain('Valaxy')
    expect(selected[0]?.textContent).toContain('Recommended')
    expect(tabNamed(host, 'All').getAttribute('aria-selected')).toBe('false')
    expect(tabNamed(host, 'All').tabIndex).toBe(-1)
    expect(selected[0]?.tabIndex).toBe(0)

    const closed = [...host.querySelectorAll('details')]
    expect(closed.map(item => item.querySelector('summary')?.textContent)).toEqual([
      'Stack, build, themes, and the rest',
      'Compare the other frameworks',
    ])
    expect(closed.every(item => !item.open)).toBe(true)
    expect(host.textContent).toContain('A Vue blog, or a Hexo move when a new theme is acceptable')
    expect(host.textContent).toContain('Hot reload. SSG, then SPA navigation')
    expect(host.textContent).toContain('Only when one Hexo theme or plugin is the product')
    expect(host.querySelector('[role="radio"]')).toBeNull()
    expect(host.querySelectorAll('.choose-compare-line')).toHaveLength(4)
  })

  it('moves framework and row selection with the arrow keys', async () => {
    const { host } = await mountCompare('en')
    const valaxy = tabNamed(host, 'Valaxy')
    valaxy.focus()
    press(valaxy, 'ArrowRight')
    await nextTick()
    expect(tabNamed(host, 'Hexo').getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement?.textContent).toContain('Hexo')
    expect(host.textContent).toContain('Only when one Hexo theme or plugin is the product')

    tabNamed(host, 'All').click()
    await nextTick()
    const facetDisclosure = host.querySelector('details')
    if (!facetDisclosure)
      throw new Error('missing row disclosure')
    expect(facetDisclosure.open).toBe(false)
    expect(facetDisclosure.querySelector('summary')?.textContent).toBe('Compare by: Best for')
    facetDisclosure.open = true
    await nextTick()

    const fit = host.querySelector<HTMLButtonElement>('[role="radio"][aria-checked="true"]')
    if (!fit)
      throw new Error('missing selected row')
    expect(fit.textContent).toContain('Best for')
    expect(fit.tabIndex).toBe(0)
    expect(host.querySelectorAll('[role="radio"][aria-checked="false"]')).toHaveLength(6)
    fit.focus()
    press(fit, 'ArrowRight')
    await nextTick()
    const stack = host.querySelector<HTMLButtonElement>('[role="radio"][aria-checked="true"]')
    expect(stack?.textContent).toContain('Stack')
    expect(host.textContent).toContain('Vue 3, Vite, typed config')
    expect(document.activeElement).toBe(stack)

    const lines = [...host.querySelectorAll<HTMLButtonElement>('.choose-compare-line')]
    expect(lines.map(item => item.tabIndex)).toEqual([0, -1, -1, -1, -1])
    expect(lines[0]?.textContent).toContain('Valaxy')
    lines[0]?.focus()
    press(lines[0]!, 'ArrowDown')
    await nextTick()
    expect(document.activeElement?.textContent).toContain('Hexo')
    expect(tabNamed(host, 'All').getAttribute('aria-selected')).toBe('true')
    ;(document.activeElement as HTMLButtonElement).click()
    await nextTick()
    expect(tabNamed(host, 'Hexo').getAttribute('aria-selected')).toBe('true')
  })

  it('uses the Chinese labels for the same collapsed default', async () => {
    const { host } = await mountCompare('zh')
    expect(tabNamed(host, 'Valaxy').getAttribute('aria-selected')).toBe('true')
    expect(host.querySelector('summary')?.textContent).toBe('技术栈、构建、主题和其他项')
    expect(host.textContent).toContain('对比其他框架')
    expect(host.textContent).toContain('推荐')
    expect(host.textContent).toContain('仅当某个 Hexo 主题或插件就是产品')

    tabNamed(host, '全部').click()
    await nextTick()
    expect(host.querySelector('summary')?.textContent).toBe('比较项：适合')
  })
})
