// @vitest-environment jsdom
import type { Post } from '../../packages/valaxy/types/posts'
import { afterEach, expect, it, vi } from 'vitest'
import { createApp, createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import PressPostList from '../../packages/valaxy-theme-press/components/PressPostList.vue'

const english = { path: '/posts/release', title: 'Release', date: '2026-10-04' }
const chinese = { path: '/zh/posts/release', title: '发布介绍', date: '2026-10-04' }
const pages = ref<Post[]>([
  english,
  chinese,
  { path: '/zh/posts/only-chinese', title: '中文独有文章', date: '2026-10-03' },
  { path: '/cn/posts/custom', title: '自定义语言路径', date: '2026-10-04' },
  { path: '/zh/posts/', title: '博客' },
])
const currentLocale = ref({ link: '/zh/' })
const i18nRouting = ref(true)
vi.mock('valaxy', async () => {
  const { filterAndSortPosts } = await import('../../packages/valaxy/client/composables/post/filter')
  return {
    filterAndSortPosts,
    useSiteStore: () => ({ postList: [english] }),
    usePageList: () => pages,
    useSiteConfig: () => ref({ orderBy: 'date' }),
  }
})
vi.mock('../../packages/valaxy-theme-press/composables/locale', () => ({
  useLocaleConfig: () => ({ currentLocale, i18nRouting }),
}))
const ArticleCard = defineComponent({
  props: ['post'],
  setup: props => () => h('a', { href: props.post.path }, props.post.title),
})

async function renderPosts(posts?: Post[]) {
  const app = createSSRApp(PressPostList, { posts })
  app.component('PressArticleCard', ArticleCard)
  const container = document.createElement('div')
  container.innerHTML = await renderToString(app)
  return [...container.querySelectorAll('a')].map(a => ({ href: a.getAttribute('href'), title: a.textContent }))
}

afterEach(() => {
  currentLocale.value = { link: '/zh/' }
  i18nRouting.value = true
})

it('renders translated and locale-only articles in the Chinese SSR list', async () => {
  expect(await renderPosts()).toEqual([
    { href: chinese.path, title: chinese.title },
    { href: '/zh/posts/only-chinese', title: '中文独有文章' },
  ])
})

it('renders root posts for the root locale and when path-based i18n is disabled', async () => {
  currentLocale.value = { link: '/' }
  expect(await renderPosts()).toEqual([{ href: english.path, title: english.title }])
  currentLocale.value = { link: '/zh/' }
  i18nRouting.value = false
  expect(await renderPosts()).toEqual([{ href: english.path, title: english.title }])
})

it('updates article links when navigating between locale prefixes', async () => {
  const container = document.createElement('div')
  const app = createApp(PressPostList)
  app.component('PressArticleCard', ArticleCard)
  app.mount(container)
  try {
    expect(container.querySelector('a')?.getAttribute('href')).toBe(chinese.path)
    currentLocale.value = { link: '/' }
    await nextTick()
    await vi.waitFor(() => {
      expect([...container.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual([english.path])
    })
    currentLocale.value = { link: '/cn/' }
    await nextTick()
    await vi.waitFor(() => {
      expect(container.textContent).toBe('自定义语言路径')
      expect(container.querySelector('a')?.getAttribute('href')).toBe('/cn/posts/custom')
    })
  }
  finally {
    app.unmount()
  }
})

it('respects explicitly supplied posts, including an empty list', async () => {
  expect(await renderPosts([english])).toEqual([{ href: english.path, title: english.title }])
  expect(await renderPosts([])).toEqual([])
})
