import type { ValaxyNode } from '../packages/valaxy/node/types'
import type { Post } from '../packages/valaxy/types'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { orderByMeta } from '../packages/valaxy/client/utils/time'
import { resolveOptions } from '../packages/valaxy/node'
import { createRouterOptions, createRouterPlugin } from '../packages/valaxy/node/plugins/vueRouter'
import { fixtureFolder } from './shared'

// Capture the file router lifecycle hook without starting a Vite server.
vi.mock('vue-router/vite', () => ({ default: (options: unknown) => options }))

describe('route metadata refresh', () => {
  it('preserves custom layouts and metadata across repeated route extension', async () => {
    const options = await resolveOptions({ userRoot: fixtureFolder.userRoot })
    const app = { options, hooks: { callHook: vi.fn() } } as unknown as ValaxyNode
    const plugin = await createRouterPlugin(app) as unknown as { extendRoute: (value: typeof route) => Promise<void> }
    const route = {
      fullPath: '/release/',
      children: [],
      components: new Map([['default', '/pages/release/index.vue']]),
      meta: { layout: 'release', releasePage: true, frontmatter: { stale: true } } as Record<string, unknown>,
      addToMeta(meta: Record<string, unknown>) {
        Object.assign(this.meta, meta)
      },
    }

    await plugin.extendRoute(route)
    await plugin.extendRoute(route)

    expect(route.meta.layout).toBe('release')
    expect(route.meta.releasePage).toBe(true)
    expect(route.meta.frontmatter).toEqual(options.config.siteConfig.frontmatter)
    expect(route.meta.frontmatter).not.toHaveProperty('stale')
  })
})

describe('route metadata dates', () => {
  const created = '2024-01-01T10:00:00+08:00'
  const updated = '2024-06-01T10:00:00+08:00'
  let base: Awaited<ReturnType<typeof resolveOptions>>
  let root: string
  let app: ValaxyNode

  beforeAll(async () => {
    base = await resolveOptions({ userRoot: fixtureFolder.userRoot })
  })

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'valaxy-route-dates-'))
    mkdirSync(join(root, 'pages/posts'), { recursive: true })
    app = {
      options: {
        ...base,
        userRoot: root,
        roots: [root],
        tempDir: join(root, '.valaxy'),
        redirects: [],
        config: {
          ...base.config,
          router: {},
          markdown: { ...base.config.markdown, highlight: (code: string) => code },
          siteConfig: { ...base.config.siteConfig, lastUpdated: true, orderBy: 'updated' },
        },
      },
      hooks: { callHook: vi.fn() },
    } as unknown as ValaxyNode
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  function git(args: string[], date = created) {
    execFileSync('git', ['-c', 'commit.gpgsign=false', ...args], {
      cwd: root,
      env: {
        ...process.env,
        GIT_AUTHOR_DATE: date,
        GIT_COMMITTER_DATE: date,
        GIT_AUTHOR_NAME: 'valaxy test',
        GIT_AUTHOR_EMAIL: 'test@valaxy.site',
        GIT_COMMITTER_NAME: 'valaxy test',
        GIT_COMMITTER_EMAIL: 'test@valaxy.site',
      },
      stdio: 'pipe',
    })
  }

  function commit(file: string, date: string) {
    git(['add', '--', file])
    git(['commit', '-m', 'update post'], date)
  }

  async function resolvePost(name: string) {
    const route = {
      fullPath: `/posts/${name.replace(/\.md$/, '')}`,
      children: [],
      components: new Map([['default', join(root, 'pages/posts', name)]]),
      meta: {} as { frontmatter: Post },
      addToMeta(meta: Record<string, unknown>) {
        Object.assign(this.meta, meta)
      },
    }
    const router = await createRouterOptions(app)
    await router.extendRoute!(route as unknown as Parameters<NonNullable<typeof router.extendRoute>>[0])
    return { path: route.fullPath, ...route.meta.frontmatter }
  }

  it('uses commit dates for routes and orders posts by their Git update time', async () => {
    git(['init'])
    const first = 'pages/posts/a.md'
    const second = 'pages/posts/b.md'
    writeFileSync(join(root, first), '# First\n')
    commit(first, created)
    writeFileSync(join(root, second), '# Second\n')
    commit(second, '2024-02-01T10:00:00+08:00')
    writeFileSync(join(root, first), '# First\n\nUpdated\n')
    commit(first, updated)
    writeFileSync(join(root, second), '# Second\n\nUpdated\n')
    commit(second, '2024-07-01T10:00:00+08:00')

    const posts = await Promise.all([resolvePost('a.md'), resolvePost('b.md')])
    expect(posts[0].date).toEqual(new Date(created))
    expect(posts[0].updated).toEqual(new Date(updated))
    expect(posts[1].date).toEqual(new Date('2024-02-01T10:00:00+08:00'))
    expect(orderByMeta(posts, 'updated').map(post => post.path)).toEqual(['/posts/b', '/posts/a'])
  })

  it('preserves explicit frontmatter dates even when Git history differs', async () => {
    git(['init'])
    const file = 'pages/posts/explicit.md'
    writeFileSync(join(root, file), '---\ndate: 2020-01-01\nupdated: 2020-02-01\n---\n# Explicit\n')
    commit(file, updated)
    const post = await resolvePost('explicit.md')
    expect(post.date).toBe('2020-01-01')
    expect(post.updated).toBe('2020-02-01')
  })

  it('uses filesystem modification time when Git history is unavailable', async () => {
    const file = join(root, 'pages/posts/untracked.md')
    writeFileSync(file, '# Untracked\n')
    utimesSync(file, new Date(created), new Date(updated))
    const stat = statSync(file)
    const post = await resolvePost('untracked.md')
    expect(post.date).toEqual(stat.ctime)
    expect(post.updated).toEqual(stat.mtime)
  })

  it('keeps updated equal to date when lastUpdated is disabled', async () => {
    git(['init'])
    const file = 'pages/posts/disabled.md'
    writeFileSync(join(root, file), '# Disabled\n')
    commit(file, created)
    writeFileSync(join(root, file), '# Disabled\n\nUpdated\n')
    commit(file, updated)
    app.options.config.siteConfig.lastUpdated = false
    const post = await resolvePost('disabled.md')
    expect(post.date).toEqual(new Date(created))
    expect(post.updated).toEqual(post.date)
  })
})
