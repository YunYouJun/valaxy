import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import { renderToString } from 'vue/server-renderer'
import { createGetRoutes, createLayoutWrapper, createSetupLayouts, lazyLayout } from '../packages/valaxy/client/utils/layouts'
import { generateLayoutsCode, normalizeLayoutName, resolveLayoutsOptions, scanLayouts } from '../packages/valaxy/node/plugins/layouts'

const tmpRoots: string[] = []

afterEach(async () => {
  await Promise.all(tmpRoots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

async function fixture(files: string[]) {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-layouts-'))
  tmpRoots.push(root)
  for (const file of files) {
    await mkdir(join(root, file, '..'), { recursive: true })
    await writeFile(join(root, file), '<template><slot /></template>')
  }
  return root.replace(/\\/g, '/')
}

describe('normalizeLayoutName', () => {
  it.each([
    ['default.vue', 'default'],
    ['MyPost.vue', 'my-post'],
    ['my_post.vue', 'my-post'],
    ['HTMLPage.vue', 'html-page'],
    ['v2Layout.vue', 'v2-layout'],
    ['user.profile.vue', 'user-profile'],
    ['404.vue', '404'],
    ['index.vue', 'index'],
    ['post/index.vue', 'post'],
    ['post/PostList.vue', 'post-list'],
    ['post/post.vue', 'post'],
    ['a/b/c.vue', 'a-b-c'],
    ['foo\\Bar.vue', 'foo-bar'],
  ])('%s -> %s', (file, name) => {
    expect(normalizeLayoutName(file)).toBe(name)
  })
})

describe('scanLayouts', () => {
  it('lets later roots override earlier ones (core → theme → addon → user)', async () => {
    // Directory names deliberately oppose the configured priority order.
    const base = await fixture([
      'z-core/layouts/default.vue',
      'z-core/layouts/post.vue',
      'z-core/layouts/404.vue',
      'y-theme/layouts/post.vue',
      'y-theme/layouts/home.vue',
      'x-addon/layouts/home.vue',
      'x-addon/layouts/moments.vue',
      'a-user/layouts/post/index.vue',
      'a-user/layouts/__tests__/ignored.vue',
    ])
    const roots = ['z-core', 'y-theme', 'x-addon', 'a-user'].map(dir => `${base}/${dir}`)
    const options = resolveLayoutsOptions({ roots, userRoot: roots[3], mode: 'dev' })
    expect(options.dirs).toEqual(roots.map(root => `${root}/layouts`))

    const layouts = await scanLayouts(options)
    expect(Object.fromEntries(layouts)).toEqual({
      default: `${base}/z-core/layouts/default.vue`,
      404: `${base}/z-core/layouts/404.vue`,
      home: `${base}/x-addon/layouts/home.vue`,
      moments: `${base}/x-addon/layouts/moments.vue`,
      post: `${base}/a-user/layouts/post/index.vue`,
    })
  })

  it('resolves user options against the site root', async () => {
    const base = await fixture(['site/custom/MyPost.vue', 'site/custom/Draft.vue', 'site/nested/a/layouts/x.vue'])
    const site = `${base}/site`
    const options = resolveLayoutsOptions({ roots: [site], userRoot: site, mode: 'build' }, { layoutsDirs: 'custom', exclude: ['**/Draft.vue'] })
    expect([...(await scanLayouts(options)).keys()]).toEqual(['my-post'])
    expect(options.importMode('my-post')).toBe('sync')
    expect(resolveLayoutsOptions({ roots: [site], userRoot: site, mode: 'dev' }).importMode('post')).toBe('async')
    expect(resolveLayoutsOptions({ roots: [site], userRoot: site, mode: 'dev' }, { layoutsDirs: 'nested/**/layouts' }).dirs)
      .toEqual([`${site}/nested/a/layouts`])
  })
})

describe('generateLayoutsCode', () => {
  it('imports only winning layouts, sync or lazy per importMode', () => {
    const code = generateLayoutsCode(
      new Map([['default', '/site/layouts/default.vue'], ['post', '/site/layouts/post.vue']]),
      { defaultLayout: 'default', fallbackLayout: 'post', importMode: name => name === 'default' ? 'sync' : 'async', inheritDefaultLayout: true },
      '/valaxy/client/utils/layouts.ts',
    )
    expect(code).toContain('import __layout_0 from "/@fs/site/layouts/default.vue"')
    expect(code).toContain('"post": lazyLayout(() => import("/@fs/site/layouts/post.vue"))')
    expect(code).toContain('createLayoutWrapper(layouts, "default", "post")')
    expect(code).toContain('from "/@fs/valaxy/client/utils/layouts.ts"')
  })
})

describe('layouts runtime', () => {
  const layout = (name: string) => defineComponent({ setup: (_, { slots }) => () => h('main', { 'data-layout': name }, slots.default?.()) })
  const page = (text: string) => defineComponent({ render: () => h('p', text) })

  async function render(path: string, layouts: Record<string, any>, fallback?: string) {
    const setupLayouts = createSetupLayouts(createLayoutWrapper(layouts, 'default', fallback), { inheritDefaultLayout: true })
    const routes = setupLayouts([
      { path: '/', component: page('home') },
      { path: '/post', component: page('post'), meta: { layout: 'post' } as any },
      { path: '/bare', component: page('bare'), meta: { layout: false } as any },
      { path: '/missing', component: page('missing'), meta: { layout: 'missing' } as any },
    ])
    const router = createRouter({ history: createMemoryHistory(), routes })
    const app = createSSRApp({ render: () => h('section', [h(RouterView)]) })
    app.use(router)
    await router.push(path)
    await router.isReady()
    return { html: await renderToString(app), router }
  }

  it('wraps pages in the default, named, lazy and fallback layouts', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const layouts = { default: layout('default'), post: lazyLayout(async () => ({ default: layout('post') })) }

    expect((await render('/', layouts)).html).toContain('<main data-layout="default"><p>home</p></main>')
    expect((await render('/post', layouts)).html).toContain('<main data-layout="post"><p>post</p></main>')
    expect((await render('/bare', layouts)).html).toContain('<section><p>bare</p></section>')
    expect((await render('/missing', layouts, 'post')).html).toContain('<main data-layout="post"><p>missing</p></main>')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Layout "missing" not found'))

    const { router } = await render('/', layouts)
    expect(createGetRoutes(router)().every(route => !route.meta.isLayout)).toBe(true)
    warn.mockRestore()
  })
})
