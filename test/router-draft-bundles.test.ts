import type { ValaxyNode } from '../packages/valaxy/node/types'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRoutesContext, resolveOptions as resolveRouterOptions } from 'vue-router/unplugin'
import { resolveOptions } from '../packages/valaxy/node/options'
import { createRouterOptions } from '../packages/valaxy/node/plugins/vueRouter'
import { fixtureFolder } from './shared'

const roots: string[] = []
afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

describe('draft imports in the generated route module', () => {
  it.each([
    ['build', false, false],
    ['build', true, true],
    ['dev', false, true],
  ] as const)('respects mode %s and publishing.drafts=%s', async (mode, drafts, included) => {
    const base = await resolveOptions({ userRoot: fixtureFolder.userRoot })
    const root = await mkdtemp(join(tmpdir(), 'valaxy-draft-routes-'))
    roots.push(root)
    const pages = join(root, 'pages')
    const generatedPages = join(root, '.valaxy/content/pages')
    await mkdir(join(pages, 'posts/group'), { recursive: true })
    await mkdir(generatedPages, { recursive: true })
    const page = (title: string, draft = false) => `---\ntitle: ${title}\ndate: 2024-01-01\ndraft: ${draft}\n---\n${title} body\n`
    await Promise.all([
      writeFile(join(pages, 'posts/public.md'), page('Public')),
      writeFile(join(pages, 'posts/draft.md'), page('SECRET_METADATA', true)),
      writeFile(join(pages, 'posts/group/public.md'), page('Nested public')),
      writeFile(join(pages, 'posts/group/draft.md'), page('NESTED_SECRET', true)),
      writeFile(join(generatedPages, 'loader-draft.md'), page('LOADER_SECRET', true)),
      writeFile(join(pages, 'posts/promoted.md'), page('Promoted', true)),
      writeFile(join(pages, 'posts/demoted.md'), page('Demoted')),
    ])
    const extendRoute = vi.fn((route) => {
      if (route.fullPath === '/posts/promoted')
        route.addToMeta({ frontmatter: { draft: false } })
    })
    const beforeWriteFiles = vi.fn((tree) => {
      for (const route of tree) {
        if (route.fullPath === '/posts/demoted')
          route.addToMeta({ frontmatter: { draft: true } })
      }
      tree.insert('/custom-draft', join(root, 'custom-draft.vue')).addToMeta({ frontmatter: { draft: true } })
    })
    const app = {
      options: {
        ...base,
        mode,
        userRoot: root,
        roots: [root],
        tempDir: join(root, '.valaxy'),
        redirects: [],
        config: {
          ...base.config,
          loaders: [{}],
          router: { extendRoute, beforeWriteFiles },
          siteConfig: { ...base.config.siteConfig, publishing: { drafts }, lastUpdated: false },
        },
      },
      hooks: { callHook: vi.fn() },
    } as unknown as ValaxyNode
    const options = await createRouterOptions(app)
    const context = createRoutesContext(resolveRouterOptions({ ...options, root, dts: false, logs: false }))
    try {
      await context.scanPages(false)
      const code = context.generateRoutes()
      expect(extendRoute).toHaveBeenCalled()
      expect(beforeWriteFiles).toHaveBeenCalledOnce()
      expect(code).toContain('posts/public.md')
      expect(code).toContain('posts/group/public.md')
      expect(code).toContain('posts/promoted.md')
      for (const marker of ['posts/draft.md', 'SECRET_METADATA', 'posts/group/draft.md', 'NESTED_SECRET', 'loader-draft.md', 'LOADER_SECRET', 'posts/demoted.md', 'custom-draft.vue']) {
        if (included)
          expect(code).toContain(marker)
        else
          expect(code).not.toContain(marker)
      }
    }
    finally {
      context.stopWatcher()
    }
  })
})

it.each([false, true])('preserves public children of draft parents (component=%s)', async (hasParentComponent) => {
  const base = await resolveOptions({ userRoot: fixtureFolder.userRoot })
  const root = await mkdtemp(join(tmpdir(), 'valaxy-draft-parent-'))
  roots.push(root)
  await mkdir(join(root, 'pages/posts'), { recursive: true })
  await writeFile(join(root, 'pages/posts/public.md'), '---\ndraft: false\ntitle: Published child\ndate: 2024-01-01\n---\nPublic child body\n')
  await writeFile(join(root, 'pages/posts/private.md'), '---\ntitle: PRIVATE_CHILD_METADATA\n---\nPrivate child body\n')
  if (hasParentComponent)
    await writeFile(join(root, 'pages/posts.md'), '---\ndraft: true\ntitle: PRIVATE_PARENT_METADATA\n---\nPrivate parent body\n')
  const app = {
    options: {
      ...base,
      mode: 'build',
      userRoot: root,
      roots: [root],
      tempDir: join(root, '.valaxy'),
      redirects: [],
      config: {
        ...base.config,
        router: {},
        siteConfig: {
          ...base.config.siteConfig,
          lastUpdated: false,
          frontmatter: { ...base.config.siteConfig.frontmatter, draft: true },
        },
      },
    },
    hooks: { callHook: vi.fn() },
  } as unknown as ValaxyNode
  const options = await createRouterOptions(app)
  const context = createRoutesContext(resolveRouterOptions({ ...options, root, dts: false, logs: false }))
  try {
    await context.scanPages(false)
    const code = context.generateRoutes()
    expect(code).toContain('posts/public.md')
    expect(code).toContain('Published child')
    expect(code).not.toContain('posts/private.md')
    expect(code).not.toContain('PRIVATE_CHILD_METADATA')
    expect(code).not.toMatch(/import\([^\n]*\/posts\.md/)
    expect(code).not.toContain('posts.md?definePage')
    expect(code).not.toContain('PRIVATE_PARENT_METADATA')
    expect(code).not.toMatch(/"draft":\s*true/)
  }
  finally {
    context.stopWatcher()
  }
})
