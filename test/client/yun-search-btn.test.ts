// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, createApp, defineComponent, nextTick, reactive, shallowRef } from 'vue'
import YunFuseSearch from '../../packages/valaxy-theme-yun/client/components/YunFuseSearch.vue'
import YunSearchBtn from '../../packages/valaxy-theme-yun/components/YunSearchBtn.vue'
import YunSearchTrigger from '../../packages/valaxy-theme-yun/components/YunSearchTrigger.vue'

const algoliaStub = vi.hoisted(() => ({
  loaded: false,
  load: vi.fn(),
  dispatchEvent: vi.fn(),
}))

const fuseEntries = vi.hoisted(() => [
  { title: 'Current Home Page', link: '/', excerpt: 'Same route item' },
  { title: 'Other Article', link: '/posts/other', excerpt: 'Cross route item' },
])

const fetchFuseListData = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

const siteConfig = shallowRef({
  search: {
    enable: true,
    provider: 'fuse' as 'algolia' | 'fuse' | 'local',
  },
})

const route = reactive({ fullPath: '/' })

vi.mock('valaxy', () => ({
  isEmptyAddon: () => false,
  useSiteConfig: () => siteConfig,
  useFuseSearch: (query: { value: string }) => ({
    results: computed(() => query.value
      ? fuseEntries
          .filter(item => item.title.toLowerCase().includes(query.value.toLowerCase()))
          .map(item => ({ item }))
      : []),
    fetchFuseListData,
  }),
}))

vi.mock('valaxy-addon-algolia', () => ({
  useAddonAlgolia: () => algoliaStub,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: shallowRef('en'),
  }),
}))

vi.mock('vue-router', () => ({
  useRoute: () => route,
}))

vi.mock('../../packages/valaxy-theme-yun/composables', () => ({
  useHotKey: vi.fn(),
}))

let unmount: (() => void) | undefined

function mountTrigger(provider: 'algolia' | 'fuse' | 'local', fuseSpy?: (props: Record<string, unknown>) => void) {
  siteConfig.value = { search: { enable: true, provider } }
  const container = document.createElement('div')
  document.body.append(container)
  const app = createApp(YunSearchTrigger)
  app.component('YunSearchBtn', YunSearchBtn)
  app.component('AlgoliaSearchBox', defineComponent({ template: '<div />' }))
  app.component('YunFuseSearch', defineComponent({
    props: {
      open: Boolean,
      returnFocusTo: { type: Object, default: null },
    },
    emits: ['close'],
    setup(props) {
      fuseSpy?.(props)
      return {}
    },
    template: '<div />',
  }))
  app.component('YunLocalSearch', defineComponent({
    props: { open: Boolean },
    emits: ['close'],
    template: '<div />',
  }))
  app.mount(container)
  unmount = () => app.unmount()
  return container
}

function mountFuseDialog(initialReturnFocusTo: HTMLElement | null) {
  const teleports = document.createElement('div')
  teleports.id = 'valaxy-teleports'
  document.body.append(teleports)

  const open = shallowRef(true)
  const returnFocusTo = shallowRef<HTMLElement | null>(initialReturnFocusTo)
  const container = document.createElement('div')
  document.body.append(container)

  const Host = defineComponent({
    setup() {
      return { open, returnFocusTo }
    },
    template: '<YunFuseSearch :open="open" :return-focus-to="returnFocusTo" @close="open = false" />',
  })

  const app = createApp(Host)
  app.component('YunFuseSearch', YunFuseSearch)
  app.component('AppLink', defineComponent({
    props: { to: { type: String, required: true } },
    setup(props) {
      function navigate() {
        if (props.to !== route.fullPath)
          route.fullPath = props.to
      }
      return { navigate }
    },
    template: '<a :href="to" @click.prevent="navigate"><slot /></a>',
  }))
  app.mount(container)
  unmount = () => app.unmount()
  return { open, returnFocusTo, teleports }
}

beforeEach(() => {
  vi.clearAllMocks()
  route.fullPath = '/'
})

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.innerHTML = ''
})

describe('yun search button and trigger aria-expanded', () => {
  it('omits aria-expanded on YunSearchBtn when expandable is false', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const app = createApp(YunSearchBtn, { open: false, expandable: false })
    app.mount(container)
    unmount = () => app.unmount()
    await nextTick()

    const button = container.querySelector<HTMLButtonElement>('.yun-search-btn')!
    expect(button.hasAttribute('aria-expanded')).toBe(false)
  })

  it('omits aria-expanded for Algolia search before and after clicking', async () => {
    const container = mountTrigger('algolia')
    await nextTick()
    await vi.dynamicImportSettled()
    await nextTick()

    const button = container.querySelector<HTMLButtonElement>('.yun-search-btn')!
    expect(button.hasAttribute('aria-expanded')).toBe(false)

    button.click()
    await nextTick()

    expect(algoliaStub.load).toHaveBeenCalledOnce()
    expect(algoliaStub.dispatchEvent).toHaveBeenCalledOnce()
    expect(button.hasAttribute('aria-expanded')).toBe(false)
    expect(button.classList.contains('is-open')).toBe(false)
  })

  it.each(['fuse', 'local'] as const)('toggles aria-expanded for %s search', async (provider) => {
    const container = mountTrigger(provider)
    await nextTick()

    const button = container.querySelector<HTMLButtonElement>('.yun-search-btn')!
    expect(button.getAttribute('aria-expanded')).toBe('false')

    button.click()
    await nextTick()
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(button.classList.contains('is-open')).toBe(true)

    button.click()
    await nextTick()
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.classList.contains('is-open')).toBe(false)
  })

  it('captures the opener synchronously when search is invoked before lazy mount', async () => {
    let capturedProps: Record<string, unknown> | undefined
    const container = mountTrigger('fuse', (props) => {
      capturedProps = props
    })
    await nextTick()

    const button = container.querySelector<HTMLButtonElement>('.yun-search-btn')!
    const otherButton = document.createElement('button')
    document.body.append(otherButton)

    button.focus()
    button.click()
    otherButton.focus()
    await nextTick()

    expect(capturedProps?.returnFocusTo).toBe(button)
  })
})

describe('yun fuse search focus restoration and lazy handoff', () => {
  it('restores focus when clicking a result for the current page, and skips when navigating away', async () => {
    const triggerBtn = document.createElement('button')
    triggerBtn.className = 'yun-search-btn'
    document.body.append(triggerBtn)
    triggerBtn.focus()

    const { open, teleports } = mountFuseDialog(triggerBtn)
    await nextTick()
    await nextTick()

    const input = teleports.querySelector<HTMLInputElement>('input[type="search"]')!
    input.value = 'Current Home'
    input.dispatchEvent(new Event('input'))
    await nextTick()

    const samePageLink = teleports.querySelector<HTMLAnchorElement>('.yun-search-result')!
    samePageLink.focus()
    samePageLink.click()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 20))

    expect(open.value).toBe(false)
    expect(document.activeElement).toBe(triggerBtn)

    // Reopen and select a result that navigates to a different route.
    open.value = true
    await nextTick()
    await nextTick()

    const otherInput = teleports.querySelector<HTMLInputElement>('input[type="search"]')!
    otherInput.value = 'Other Article'
    otherInput.dispatchEvent(new Event('input'))
    await nextTick()

    const otherLink = teleports.querySelector<HTMLAnchorElement>('.yun-search-result')!
    otherLink.focus()
    otherLink.click()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 20))

    expect(open.value).toBe(false)
    expect(route.fullPath).toBe('/posts/other')
    expect(document.activeElement).not.toBe(triggerBtn)
  })

  it('skips entry morph animation when the trigger icon is already mid-transition', async () => {
    const mockBtn = document.createElement('button')
    mockBtn.className = 'yun-search-btn'
    const mockIcon = document.createElement('span')
    mockIcon.className = 'yun-search-icon is-open'
    const mockLens = document.createElement('span')
    mockLens.className = 'yun-search-icon-lens'
    mockLens.style.opacity = '0.5'
    const mockCross = document.createElement('span')
    mockCross.className = 'yun-search-icon-cross'
    mockCross.style.opacity = '0.5'
    for (const part of [mockLens, mockCross]) {
      Object.defineProperty(part, 'getAnimations', {
        value: () => [{ playState: 'running', currentTime: 80 }],
      })
    }
    mockIcon.append(mockLens, mockCross)
    mockBtn.append(mockIcon)
    document.body.append(mockBtn)

    const { teleports } = mountFuseDialog(mockBtn)
    await nextTick()
    await nextTick()

    const dismissIcon = teleports.querySelector('.yun-search-dismiss .yun-search-icon.is-open')!
    expect(dismissIcon).not.toBeNull()
    expect(dismissIcon.classList.contains('is-appear')).toBe(false)
  })
})
