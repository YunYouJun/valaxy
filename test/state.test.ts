import type { Plugin, PluginOption } from 'vite'
import type { ResolvedValaxyOptions } from '../packages/valaxy/node'
import { describe, expect, it } from 'vitest'
import { resolveOptions, ViteValaxyPlugins } from '../packages/valaxy/node'
import { createValaxyNode, StateManager } from '../packages/valaxy/node/app'
import { createMarkdownToVueRenderFn, getMarkdownCacheSize } from '../packages/valaxy/node/plugins/markdown/markdownToVue'
import { createMarkdownPlugin } from '../packages/valaxy/node/plugins/markdown/transform'
import { createMemoryReleasePlugin } from '../packages/valaxy/node/plugins/preset'
import { createValaxyPlugin } from '../packages/valaxy/node/plugins/valaxy'
import { fixtureFolder } from './shared'

function findPluginOptional(entries: PluginOption[], name: string): Plugin | undefined {
  for (const entry of entries) {
    if (Array.isArray(entry)) {
      const nested = findPluginOptional(entry, name)
      if (nested)
        return nested
    }
    else if (entry && typeof entry === 'object' && 'name' in entry && entry.name === name) {
      return entry as Plugin
    }
  }
}

function findPlugin(entries: PluginOption[], name: string): Plugin {
  const plugin = findPluginOptional(entries, name)
  if (plugin)
    return plugin
  throw new Error(`Plugin not found: ${name}`)
}

function createCompileOptions(): ResolvedValaxyOptions {
  return {
    userRoot: '/project',
    pages: [],
    mode: 'dev',
    config: {
      build: { ignoreDeadLinks: false },
      features: {},
      markdown: { highlight: (code: string) => code },
      siteConfig: {
        encrypt: { enable: false },
        lastUpdated: false,
      },
    },
  } as unknown as ResolvedValaxyOptions
}

describe('build state', () => {
  it('isolates plugin pipelines created from the same Valaxy context', async () => {
    const options = await resolveOptions({ userRoot: fixtureFolder.userRoot }, 'build')
    const app = createValaxyNode(options)
    const firstPlugins = await ViteValaxyPlugins(app)
    const secondPlugins = await ViteValaxyPlugins(app)
    const firstMarkdown = findPlugin(firstPlugins, 'unplugin-vue-markdown')
    const secondMarkdown = findPlugin(secondPlugins, 'unplugin-vue-markdown')
    const firstLoader = findPlugin(firstPlugins, 'valaxy:loader')
    const secondLoader = findPlugin(secondPlugins, 'valaxy:loader')
    const id = `${options.userRoot}/pages/shared-context.md`
    const transformContext = {
      error: (error: unknown) => {
        throw error
      },
    }
    const loaderContext = { addWatchFile() {} }

    await (firstLoader.configResolved as (config: object) => Promise<void>)({})
    await (secondLoader.configResolved as (config: object) => Promise<void>)({})
    const firstMarkdownResult = await (firstMarkdown.transform as (
      this: typeof transformContext,
      code: string,
      id: string,
    ) => Promise<{ code: string }>).call(transformContext, '---\ntitle: First pipeline\n---\n\n# First', id)
    const secondMarkdownResult = await (secondMarkdown.transform as (
      this: typeof transformContext,
      code: string,
      id: string,
    ) => Promise<{ code: string }>).call(transformContext, '---\ntitle: Second pipeline\n---\n\n# Second', id)

    const first = await (firstLoader.transform as unknown as (
      this: typeof loaderContext,
      code: string,
      id: string,
    ) => Promise<string>).call(loaderContext, firstMarkdownResult.code, id)
    const second = await (secondLoader.transform as unknown as (
      this: typeof loaderContext,
      code: string,
      id: string,
    ) => Promise<string>).call(loaderContext, secondMarkdownResult.code, id)

    expect(first).toContain('First pipeline')
    expect(first).not.toContain('Second pipeline')
    expect(second).toContain('Second pipeline')
    expect(second).not.toContain('First pipeline')

    await (findPlugin(firstPlugins, 'valaxy:memory-release').closeBundle as () => void | Promise<void>)()
    await (findPlugin(secondPlugins, 'valaxy:memory-release').closeBundle as () => void | Promise<void>)()
  }, 30_000)

  it('releases a markdown environment when compilation fails', async () => {
    const options = createCompileOptions()
    const state = new StateManager()
    const id = '/project/pages/failing.md'
    state.set({
      id,
      title: 'Failing page',
      headers: [],
      links: [],
      frontmatter: { unserialisable: 1n },
    })

    const compile = await createMarkdownToVueRenderFn(options, state)

    await expect(compile('# Failing page', id)).rejects.toThrow()
    expect(state.size).toBe(0)
  })

  it('uses the owning context when the Valaxy plugin compiles markdown', async () => {
    const options = createCompileOptions()
    const state = new StateManager()
    const id = '/project/pages/context.md'
    state.set({
      id,
      title: 'Context title',
      headers: [],
      links: [],
      frontmatter: {},
    })
    const [loader] = await createValaxyPlugin(options, {}, state)

    await (loader.configResolved as (config: object) => Promise<void>)({})
    const result = await (loader.transform as (
      this: { addWatchFile: (id: string) => void },
      code: string,
      id: string,
    ) => Promise<string>).call(
      { addWatchFile() {} },
      '<template><div>Content</div></template>',
      id,
    )

    expect(result).toContain('Context title')
    expect(state.size).toBe(0)
  })

  it('records MarkdownIt environments in the owning context', async () => {
    const options = createCompileOptions()
    const state = new StateManager()
    const id = '/project/pages/markdown.md'
    const plugin = await createMarkdownPlugin(options, undefined, state)

    const result = await (plugin.transform as (
      this: { error: (error: unknown) => never },
      code: string,
      id: string,
    ) => Promise<{ code: string }>).call(
      { error: (error: unknown) => { throw error } },
      '---\ntitle: Context markdown\n---\n\n# Heading',
      id,
    )

    expect(result.code).toContain('<h1')
    expect(state.get(id)?.frontmatter.title).toBe('Context markdown')
  })

  it('transforms fenced code blocks with an async highlighter', async () => {
    const options = createCompileOptions()
    options.config.markdown!.highlight = async code => `<pre class="async-highlight"><code>${code}</code></pre>`
    const state = new StateManager()
    const id = '/project/pages/async-code-block.md'
    const plugin = await createMarkdownPlugin(options, undefined, state)

    const result = await (plugin.transform as (
      this: { error: (error: unknown) => never },
      code: string,
      id: string,
    ) => Promise<{ code: string }>).call(
      { error: (error: unknown) => { throw error } },
      '# Async page\n\n## Section\n\n```ts\nconst answer = 42\n```',
      id,
    )

    expect(result.code).toContain('<pre class="async-highlight">')
    expect(result.code).not.toContain('[object Promise]')
    expect(state.get(id)?.title).toBe('Async page')
    expect(state.get(id)?.headers).toMatchObject([{ title: 'Section', link: '#section' }])
  })

  it('extracts page metadata after user MarkdownIt core rules', async () => {
    const options = createCompileOptions()
    options.config.markdown!.markdownSetup = (md) => {
      md.core.ruler.push('test_transform_heading', (markdownState) => {
        const inline = markdownState.tokens.find(token => token.type === 'inline' && token.content === 'Original title')
        if (!inline)
          throw new Error('Expected heading token')
        inline.content = 'Transformed title'
        inline.children![0].content = 'Transformed title'
      })
    }
    const state = new StateManager()
    const id = '/project/pages/transformed-title.md'
    const plugin = await createMarkdownPlugin(options, undefined, state)

    await (plugin.transform as (
      this: { error: (error: unknown) => never },
      code: string,
      id: string,
    ) => Promise<{ code: string }>).call(
      { error: (error: unknown) => { throw error } },
      '# Original title',
      id,
    )

    expect(state.get(id)?.title).toBe('Transformed title')
  })

  it('awaits async user renderer rules in the page compiler', async () => {
    const options = createCompileOptions()
    options.config.markdown!.markdownSetup = (md) => {
      md.renderer.rules.paragraph_open = async () => {
        await Promise.resolve()
        return '<p data-async-renderer="true">'
      }
    }
    const state = new StateManager()
    const id = '/project/pages/async-renderer.md'
    const plugin = await createMarkdownPlugin(options, undefined, state)

    const result = await (plugin.transform as (
      this: { error: (error: unknown) => never },
      code: string,
      id: string,
    ) => Promise<{ code: string }>).call(
      { error: (error: unknown) => { throw error } },
      'Async renderer',
      id,
    )

    expect(result.code).toContain('<p data-async-renderer="true">')
    expect(result.code).not.toContain('[object Promise]')
  })

  it('releases orphaned environments at the end of a build cycle', async () => {
    const state = new StateManager()
    const plugins = await createValaxyPlugin(createCompileOptions(), {}, state)
    const cleanup = plugins.find(plugin => plugin.name === 'valaxy:state-cleanup')
    state.set({
      id: '/project/pages/orphaned.md',
      title: 'Orphaned page',
      headers: [],
      links: [],
      frontmatter: { payload: 'x'.repeat(8 * 1024 * 1024) },
    })

    expect(cleanup).toBeDefined()
    await (cleanup!.buildEnd as () => void | Promise<void>)()
    expect(state.size).toBe(0)
  })

  it('releases pipeline resources when a dev server closes', async () => {
    const state = new StateManager()
    const plugins = await createValaxyPlugin(createCompileOptions(), {}, state)
    const cleanup = plugins.find(plugin => plugin.name === 'valaxy:state-cleanup')
    let disposeCount = 0
    state.onDispose(() => disposeCount++)

    expect(cleanup).toBeDefined()
    await (cleanup!.closeBundle as () => void | Promise<void>)()
    expect(disposeCount).toBe(1)
  })

  it('keeps parallel build contexts isolated for the same file id', async () => {
    const id = '/project/pages/shared.md'
    const firstState = new StateManager()
    const secondState = new StateManager()
    firstState.set({
      id,
      title: 'First build',
      headers: [],
      links: [],
      frontmatter: {},
    })
    secondState.set({
      id,
      title: 'Second build',
      headers: [],
      links: [],
      frontmatter: {},
    })
    const firstCompile = await createMarkdownToVueRenderFn(createCompileOptions(), firstState)
    const secondCompile = await createMarkdownToVueRenderFn(createCompileOptions(), secondState)

    const [first, second] = await Promise.all([
      firstCompile('<template><div>First</div></template>', id),
      secondCompile('<template><div>Second</div></template>', id),
    ])

    expect(first.pageData.title).toBe('First build')
    expect(second.pageData.title).toBe('Second build')
    expect(firstState.size).toBe(0)
    expect(secondState.size).toBe(0)
  })

  it('uses fresh environments across incremental compilations', async () => {
    const options = createCompileOptions()
    options.mode = 'build'
    const state = new StateManager()
    const id = '/project/pages/incremental.md'
    const compile = await createMarkdownToVueRenderFn(options, state)

    state.set({
      id,
      title: 'Initial title',
      headers: [],
      links: [],
      frontmatter: {},
    })
    const initial = await compile('<template><div>Initial</div></template>', id)

    state.set({
      id,
      title: 'Updated title',
      headers: [],
      links: [],
      frontmatter: {},
    })
    const updated = await compile('<template><div>Updated</div></template>', id)

    expect(initial.pageData.title).toBe('Initial title')
    expect(updated.pageData.title).toBe('Updated title')
    expect(state.size).toBe(0)
  })

  it('does not reuse cached page data when only the environment changes', async () => {
    const options = createCompileOptions()
    options.mode = 'build'
    const state = new StateManager()
    const id = '/project/pages/frontmatter-only.md'
    const code = '<template><div>Unchanged content</div></template>'
    const compile = await createMarkdownToVueRenderFn(options, state)

    state.set({ id, title: 'First title', headers: [], links: [], frontmatter: {} })
    const first = await compile(code, id)
    state.set({ id, title: 'Second title', headers: [], links: [], frontmatter: {} })
    const second = await compile(code, id)

    expect(first.pageData.title).toBe('First title')
    expect(second.pageData.title).toBe('Second title')
  })

  it('pairs queued environments with overlapping transforms of the same file', async () => {
    const options = createCompileOptions()
    const state = new StateManager()
    const markdown = await createMarkdownPlugin(options, undefined, state)
    const [loader] = await createValaxyPlugin(options, {}, state)
    const id = '/project/pages/overlapping.md'
    const transformContext = {
      error: (error: unknown) => {
        throw error
      },
    }
    const loaderContext = { addWatchFile() {} }

    await (loader.configResolved as (config: object) => Promise<void>)({})
    const firstMarkdown = await (markdown.transform as (
      this: typeof transformContext,
      code: string,
      id: string,
    ) => Promise<{ code: string }>).call(transformContext, '---\ntitle: First revision\n---\n\n# Same', id)
    const secondMarkdown = await (markdown.transform as (
      this: typeof transformContext,
      code: string,
      id: string,
    ) => Promise<{ code: string }>).call(transformContext, '---\ntitle: Second revision\n---\n\n# Same', id)

    const first = await (loader.transform as unknown as (
      this: typeof loaderContext,
      code: string,
      id: string,
    ) => Promise<string>).call(loaderContext, firstMarkdown.code, id)
    const second = await (loader.transform as unknown as (
      this: typeof loaderContext,
      code: string,
      id: string,
    ) => Promise<string>).call(loaderContext, secondMarkdown.code, id)

    expect(first).toContain('First revision')
    expect(first).not.toContain('Second revision')
    expect(second).toContain('Second revision')
    expect(second).not.toContain('First revision')
    expect(state.size).toBe(0)
    state.dispose()
  })

  it('releases the current environment on a markdown cache hit', async () => {
    const options = createCompileOptions()
    options.mode = 'build'
    const state = new StateManager()
    const id = '/project/pages/cached.md'
    const code = '<template><div>Cached</div></template>'
    const compile = await createMarkdownToVueRenderFn(options, state)
    const fileInfo = {
      id,
      title: 'Cached title',
      headers: [],
      links: [],
      frontmatter: {},
    }

    state.set(fileInfo)
    await compile(code, id)
    state.set(fileInfo)
    await compile(code, id)

    expect(state.size).toBe(0)
  })

  it('isolates markdown caches between build contexts', async () => {
    const firstOptions = createCompileOptions()
    const secondOptions = createCompileOptions()
    firstOptions.mode = 'build'
    secondOptions.mode = 'build'
    const firstState = new StateManager()
    const secondState = new StateManager()
    const id = '/project/pages/cache-isolation.md'
    const code = '<template><div>Same source</div></template>'
    firstState.set({
      id,
      title: 'First cache',
      headers: [],
      links: [],
      frontmatter: {},
    })
    secondState.set({
      id,
      title: 'Second cache',
      headers: [],
      links: [],
      frontmatter: {},
    })
    const firstCompile = await createMarkdownToVueRenderFn(firstOptions, firstState)
    const secondCompile = await createMarkdownToVueRenderFn(secondOptions, secondState)

    const first = await firstCompile(code, id)
    const second = await secondCompile(code, id)

    expect(first.pageData.title).toBe('First cache')
    expect(second.pageData.title).toBe('Second cache')
  })

  it('does not mix or delete a newer environment while an older compile awaits', async () => {
    const options = createCompileOptions()
    options.config.siteConfig.lastUpdated = true
    const state = new StateManager()
    const id = '/project/pages/reentrant.md'
    const code = '<template><div class="language-ts">Code</div></template>'
    const compile = await createMarkdownToVueRenderFn(options, state)
    state.set({
      id,
      title: 'First revision',
      headers: [],
      links: [],
      frontmatter: { codeHeightLimit: 100 },
    })

    const firstPending = compile(code, id)
    state.set({
      id,
      title: 'Second revision',
      headers: [],
      links: [],
      frontmatter: { codeHeightLimit: 200 },
    })
    const first = await firstPending

    expect(first.code).toContain('max-height: 100px')
    expect(state.get(id)?.title).toBe('Second revision')

    const second = await compile(code, id)
    expect(second.code).toContain('max-height: 200px')
    expect(state.size).toBe(0)
  })

  it('releases a single-build markdown cache after the first closeBundle', async () => {
    const options = createCompileOptions()
    options.mode = 'build'
    const state = new StateManager()
    const id = '/project/pages/single-build.md'
    state.set({
      id,
      title: 'Single build',
      headers: [],
      links: [],
      frontmatter: {},
    })
    const compile = await createMarkdownToVueRenderFn(options, state)
    await compile('<template><div>Single build</div></template>', id)
    const release = createMemoryReleasePlugin(state, 1)

    expect(getMarkdownCacheSize(state)).toBe(1)
    await (release.closeBundle as () => void | Promise<void>)()
    expect(getMarkdownCacheSize(state)).toBe(0)
  })

  it('retains a dual-build cache until the second closeBundle', async () => {
    const options = createCompileOptions()
    options.mode = 'build'
    const state = new StateManager()
    const id = '/project/pages/dual-build.md'
    state.set({ id, title: 'Dual build', headers: [], links: [], frontmatter: {} })
    const compile = await createMarkdownToVueRenderFn(options, state)
    await compile('<template><div>Dual build</div></template>', id)
    const release = createMemoryReleasePlugin(state, 2)

    await (release.closeBundle as () => void | Promise<void>)()
    expect(getMarkdownCacheSize(state)).toBe(1)

    await (release.closeBundle as () => void | Promise<void>)()
    expect(getMarkdownCacheSize(state)).toBe(0)
  })

  it('releases a markdown cache when a build fails before closeBundle', async () => {
    const options = createCompileOptions()
    options.mode = 'build'
    const state = new StateManager()
    const id = '/project/pages/failed-build.md'
    state.set({ id, title: 'Failed build', headers: [], links: [], frontmatter: {} })
    const compile = await createMarkdownToVueRenderFn(options, state)
    await compile('<template><div>Failed build</div></template>', id)
    const release = createMemoryReleasePlugin(state, 2)

    expect(getMarkdownCacheSize(state)).toBe(1)
    await (release.buildEnd as (error?: Error) => void | Promise<void>)(new Error('build failed'))
    expect(getMarkdownCacheSize(state)).toBe(0)
  })

  it('keeps resources alive across incremental watch builds', async () => {
    const options = createCompileOptions()
    options.mode = 'build'
    const state = new StateManager()
    const id = '/project/pages/watch-build.md'
    state.set({ id, title: 'Watch build', headers: [], links: [], frontmatter: {} })
    const compile = await createMarkdownToVueRenderFn(options, state)
    await compile('<template><div>Watch build</div></template>', id)
    const release = createMemoryReleasePlugin(state, 1)
    let disposeCount = 0
    state.onDispose(() => disposeCount++)
    const watchContext = { meta: { watchMode: true } }

    await (release.closeBundle as () => void | Promise<void>).call(watchContext)
    await (release.buildEnd as (error?: Error) => void | Promise<void>).call(watchContext, new Error('recoverable'))

    expect(getMarkdownCacheSize(state)).toBe(1)
    expect(disposeCount).toBe(0)
  })
})
