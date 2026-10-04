// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { createSSRApp, defineAsyncComponent, defineComponent, h, nextTick, onMounted, reactive } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { useUtterances } from '../../demo/yun/composables/use-utterances'
import { runContentUpdated } from '../../packages/valaxy/client/utils/content'

const state = reactive({ isDark: false })
const route = reactive({ path: '/post' })

vi.mock('valaxy', async () => {
  const { onContentUpdated } = await import('../../packages/valaxy/client/utils/content')
  return { onContentUpdated, useAppStore: () => state }
})
vi.mock('vue-router', () => ({ useRoute: () => route }))

it('waits for the article to hydrate before mounting Utterances, then updates and cleans up', async () => {
  const UserApp = defineComponent({
    setup() {
      useUtterances({ repo: 'YunYouJun/valaxy', issueTerm: 'pathname', label: 'utterances' })
      return () => h('div')
    },
  })
  const article = () => h('main', [h('article', 'Post'), h('div', { class: 'comment' })])
  const Article = defineComponent({
    setup() {
      onMounted(runContentUpdated)
      return article
    },
  })
  let resolveArticle!: (component: typeof Article) => void
  const LazyArticle = defineAsyncComponent(() => new Promise<typeof Article>((resolve) => {
    resolveArticle = resolve
  }))
  // SSG already contains the route, but its client chunk can arrive after UserApp mounts.
  const html = await renderToString(createSSRApp({ render: () => [h('div'), article()] }))
  document.body.innerHTML = `<div id="app">${html}</div>`
  const container = document.querySelector('.comment')!
  const warnings = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  const app = createSSRApp({ render: () => [h(UserApp), h(LazyArticle)] })
  try {
    app.mount('#app')
    await nextTick()
    expect(container.querySelector('script')).toBeNull()

    resolveArticle(Article)
    await vi.waitFor(() => expect(container.querySelector('script')?.getAttribute('theme')).toBe('github-light'))
    expect(warnings).not.toHaveBeenCalled()
    expect(errors).not.toHaveBeenCalled()

    const firstScript = container.querySelector('script')!
    runContentUpdated()
    await nextTick()
    expect(container.querySelector('script')).toBe(firstScript)

    state.isDark = true
    await vi.waitFor(() => expect(container.querySelector('script')?.getAttribute('theme')).toBe('github-dark'))
    expect(container.querySelectorAll('script')).toHaveLength(1)

    route.path = '/next'
    await nextTick()
    // A route change alone must not mount into the preceding article's container.
    expect(container.querySelector('script')).toBeNull()
    runContentUpdated()
    await nextTick()
    expect(container.querySelectorAll('script')).toHaveLength(1)

    runContentUpdated()
    app.unmount()
    await nextTick()
    expect(container.querySelector('script')).toBeNull()
  }
  finally {
    if (document.querySelector('#app')?.hasChildNodes())
      app.unmount()
    document.body.innerHTML = ''
    state.isDark = false
    route.path = '/post'
    vi.restoreAllMocks()
  }
})
