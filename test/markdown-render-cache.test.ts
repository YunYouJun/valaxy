import type { ResolvedValaxyOptions } from '../packages/valaxy/node'
import type { MarkdownRenderer } from '../packages/valaxy/node/plugins/markdown/renderer'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { StateManager } from '../packages/valaxy/node/app/state'
import { createMarkdownBaseContext } from '../packages/valaxy/node/plugins/markdown/base'
import { createMarkdownPlugin } from '../packages/valaxy/node/plugins/markdown/transform'

const cleanup: (() => void | Promise<void>)[] = []
afterEach(async () => {
  for (const dispose of cleanup.splice(0))
    await dispose()
})

async function fixture(mode: 'build' | 'dev' = 'build', setup?: (md: MarkdownRenderer) => void) {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-render-cache-'))
  const state = new StateManager()
  cleanup.push(() => state.dispose(), () => rm(root, { recursive: true, force: true }))
  const parsed = vi.fn()
  const before = vi.fn((code: string) => code)
  const after = vi.fn((code: string) => code)
  const options = {
    userRoot: root,
    pages: [],
    mode,
    config: {
      build: { ignoreDeadLinks: false },
      features: {},
      markdown: {
        highlight: (code: string) => code,
        transforms: { before, after },
        markdownSetup: (md: MarkdownRenderer) => {
          md.core.ruler.push('count-render', parsed)
          setup?.(md)
        },
      },
      siteConfig: { lastUpdated: false },
    },
  } as unknown as ResolvedValaxyOptions
  const base = createMarkdownBaseContext('/')
  const plugin = await createMarkdownPlugin(options, base, state)
  const transform = plugin.transform as (this: { error: (error: unknown) => never }, code: string, id: string) => Promise<{ code: string }>
  const id = join(root, 'page.md')
  const render = (code: string) => transform.call({
    error(error) {
      throw error
    },
  }, code, id)
  return { root, state, base, parsed, before, after, render, id }
}

it('reuses the parser result between bundles and restores isolated metadata for the next loader', async () => {
  const f = await fixture()
  const source = '---\ntitle: Cached page\n---\n\n# Heading\n\n## Section\n\n[Guide](/guide)'
  const first = await f.render(source)
  const metadata = f.state.take(f.id)!
  expect(metadata.links).toEqual(['/guide'])
  metadata.frontmatter.title = 'mutated by a consumer'
  const second = await f.render(source)
  expect(second.code).toBe(first.code)
  expect(f.state.take(f.id)).toMatchObject({ title: 'Heading', frontmatter: { title: 'Cached page' }, headers: [{ title: 'Section' }] })
  expect(f.parsed).toHaveBeenCalledTimes(1)
  expect(f.before).toHaveBeenCalledTimes(2)
  expect(f.after).toHaveBeenCalledTimes(2)
})

it('invalidates changed includes, source text and resolved base', async () => {
  const f = await fixture()
  const included = join(f.root, 'part.md')
  const source = '# Page\n\n<!-- @include: ./part.md -->'
  await writeFile(included, 'First include [Guide](/guide)')
  await f.render(source)
  f.state.take(f.id)
  await f.render(source)
  f.state.take(f.id)
  expect(f.parsed).toHaveBeenCalledTimes(1)
  await writeFile(included, 'Changed include [Guide](/guide)')
  expect((await f.render(source)).code).toContain('Changed include')
  f.state.take(f.id)
  expect((await f.render('# Different page')).code).toContain('Different page')
  f.state.take(f.id)
  f.base.value = '/docs/'
  expect((await f.render(source)).code).toContain('/docs/guide')
  expect(f.parsed).toHaveBeenCalledTimes(4)
})

it('keeps development rendering live and releases build cache with its pipeline', async () => {
  const dev = await fixture('dev')
  await dev.render('# Dev')
  await dev.render('# Dev')
  expect(dev.parsed).toHaveBeenCalledTimes(2)
  const build = await fixture()
  await build.render('# Build')
  build.state.take(build.id)
  await build.render('# Build')
  expect(build.parsed).toHaveBeenCalledTimes(1)
  build.state.dispose()
  await build.render('# Build')
  expect(build.parsed).toHaveBeenCalledTimes(2)
})

it('preserves custom plugin state that cannot be cached and retries failed renders', async () => {
  const custom = await fixture('build', (md) => {
    md.core.ruler.push('custom-function', (state) => {
      state.env.callback = () => 'custom state'
    })
  })
  await custom.render('# Custom plugin')
  await custom.render('# Custom plugin')
  expect(custom.parsed).toHaveBeenCalledTimes(2)

  let fail = true
  const retry = await fixture('build', (md) => {
    md.core.ruler.push('fail-once', () => {
      if (fail)
        throw new Error('Renderer failed')
    })
  })
  await expect(retry.render('# Retry')).rejects.toThrow('Renderer failed')
  fail = false
  expect((await retry.render('# Retry')).code).toContain('Retry')
  await retry.render('# Retry')
  expect(retry.parsed).toHaveBeenCalledTimes(2)
})

it('keeps cached metadata tied to its render when the same file renders concurrently', async () => {
  let enter!: () => void
  let resume!: () => void
  const entered = new Promise<void>((resolve) => {
    enter = resolve
  })
  const pending = new Promise<void>((resolve) => {
    resume = resolve
  })
  const f = await fixture('build', (md) => {
    md.renderer.rules.paragraph_open = async (_tokens, _index, _options, env) => {
      if (env.title === 'First') {
        enter()
        await pending
      }
      return '<p>'
    }
  })
  const first = f.render('# First\n\nText')
  await entered
  await f.render('# Second\n\nText')
  resume()
  await first
  f.state.clear()
  await f.render('# First\n\nText')
  expect(f.state.take(f.id)?.title).toBe('First')
  expect(f.parsed).toHaveBeenCalledTimes(2)
})
