import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { createBlog } from '../../packages/desktop/src/main/onboarding'
import { inspectProject } from '../../packages/desktop/src/main/project'

let parent: string
let resources: string
beforeEach(async () => {
  parent = await mkdtemp(join(tmpdir(), 'valaxy-onboarding-'))
  resources = join(parent, 'resources')
  await mkdir(join(resources, 'packages'), { recursive: true })
  await writeFile(join(resources, 'packages.json'), JSON.stringify({ 'valaxy': 'valaxy.tgz', 'valaxy-theme-yun': 'theme.tgz' }))
  await writeFile(join(resources, 'framework-overrides.json'), JSON.stringify({ semver: '7' }))
})
afterEach(async () => {
  await rm(parent, { recursive: true, force: true })
})

it('never replaces an existing project directory', async () => {
  const root = join(parent, 'my-blog')
  await mkdir(root)
  await writeFile(join(root, 'keep.txt'), 'User content')
  await expect(createBlog(parent, { directory: 'my-blog', title: 'Blog', author: 'Author' }, resources)).rejects.toThrow()
  expect(await readFile(join(root, 'keep.txt'), 'utf8')).toBe('User content')
})

it.each(['../outside', '/absolute', 'con', 'my/blog'])('rejects unsafe directory %s', async (directory) => {
  await expect(createBlog(parent, { directory, title: 'Blog', author: 'Author' }, resources)).rejects.toThrow('目录名')
})

it('creates an inspectable project before dependencies are installed', async () => {
  const root = await createBlog(parent, { directory: 'my-blog', title: 'Quoted "title"', author: '作者' }, resources)
  expect(await inspectProject(root)).toMatchObject({ name: 'my-blog', dependenciesReady: false })
  expect(await readFile(join(root, 'site.config.ts'), 'utf8')).toContain('Quoted \\"title\\"')
  expect(await readFile(join(root, 'pages/posts/hello.md'), 'utf8')).toContain('我的第一篇文章')
  expect(await readFile(join(root, 'pnpm-workspace.yaml'), 'utf8')).toContain('"semver": "7"')
})
