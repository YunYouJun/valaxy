import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import ts from 'typescript'
import { expect, it } from 'vitest'

const coreConsumer = `
import type { PageFrontMatter, PostFrontMatter } from 'valaxy/types'
import type { PostFrontMatter as CanonicalPost } from 'valaxy/types/frontmatter'

export const path: PageFrontMatter['path'] = '/post'
export const tags: PostFrontMatter['tags'] = ['test']
export const draft: CanonicalPost['draft'] = true
// @ts-expect-error Core fields retain their types.
export const invalidTags: PostFrontMatter['tags'] = [1]
`

const yunConsumer = `/// <reference types="valaxy/client" />
import type { UserSiteConfig } from 'valaxy/types'
import 'valaxy-theme-yun/theme'
${coreConsumer}

export const titleClass: CanonicalPost['postTitleClass'] = 'post-title'
export const defaults: NonNullable<UserSiteConfig['frontmatter']> = {
  pageTitleClass: 'page-title',
  postTitleClass: 'post-title',
}

// @ts-expect-error The canonical declaration also receives Yun augmentation.
export const invalidTitleClass: CanonicalPost['postTitleClass'] = 1
export const invalidDefaults: NonNullable<UserSiteConfig['frontmatter']> = {
  // @ts-expect-error Site defaults use the augmented frontmatter declaration.
  pageTitleClass: 1,
}
`

it.each([
  { name: 'NodeNext ESM', module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext, code: coreConsumer },
  { name: 'Bundler with Yun', module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, code: yunConsumer },
])('exposes built frontmatter types to $name consumers', async ({ module, moduleResolution, code }) => {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-frontmatter-types-'))
  try {
    const modules = join(root, 'node_modules')
    await mkdir(modules)
    for (const name of ['valaxy', 'valaxy-theme-yun']) {
      await symlink(resolve(import.meta.dirname, '../packages', name), join(modules, name), 'junction')
    }

    const consumer = join(root, 'consumer.mts')
    await writeFile(consumer, code)

    const program = ts.createProgram([consumer], {
      module,
      moduleResolution,
      target: ts.ScriptTarget.ESNext,
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      types: [],
    })
    expect(ts.formatDiagnostics(ts.getPreEmitDiagnostics(program), {
      getCanonicalFileName: file => file,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n',
    })).toBe('')
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
}, 30_000)
