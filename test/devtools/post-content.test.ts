import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readPostContent, writePostContent } from '../../packages/devtools/src/node/utils/post-content'

let root: string
let file: string
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'valaxy-body-'))
  file = join(root, 'pages/posts/hello.md')
  await mkdir(join(root, 'pages/posts'), { recursive: true })
  await writeFile(file, '---\n# Preserve this comment\ntitle: Hello\n---\n\nOriginal body.\n')
})
afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('article body editing', () => {
  it('preserves current frontmatter including comments and independent metadata edits', async () => {
    const { revision } = await readPostContent(root, file)
    await writeFile(file, (await readFile(file, 'utf8')).replace('title: Hello', 'title: Updated'))
    await writePostContent(root, file, '\nNew body.\n', revision)
    expect(await readFile(file, 'utf8')).toBe('---\n# Preserve this comment\ntitle: Updated\n---\n\nNew body.\n')
  })

  it('rejects stale edits without overwriting external work', async () => {
    const { revision } = await readPostContent(root, file)
    await writeFile(file, 'External update')
    await expect(writePostContent(root, file, 'Stale', revision)).rejects.toThrow('changed on disk')
    expect(await readFile(file, 'utf8')).toBe('External update')
  })

  it('rejects non-page paths and symlinks escaping the project', async () => {
    await expect(readPostContent(root, '../outside.md')).rejects.toThrow()
    await symlink(tmpdir(), join(root, 'pages/escape'))
    await expect(readPostContent(root, 'pages/escape/outside.md')).rejects.toThrow()
  })

  it('allows only one writer to consume a body revision', async () => {
    const { revision } = await readPostContent(root, file)
    const results = await Promise.allSettled([
      writePostContent(root, file, 'First', revision),
      writePostContent(root, file, 'Second', revision),
    ])
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1)
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(1)
  })
})
