import type { PostContent } from '../../shared/rpc'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import matter from '@11ty/gray-matter'
import { devtoolsMatterOptions } from './matter'
import { updatePageFile } from './page-write'
import { resolvePageFile } from './paths'

function snapshot(content: string): PostContent {
  return { content, revision: createHash('sha256').update(content).digest('hex') }
}

/** Read the body without reserializing the article's frontmatter. */
export async function readPostContent(userRoot: string, filePath: string): Promise<PostContent> {
  const file = await resolvePageFile(userRoot, filePath)
  return snapshot(matter(await readFile(file, 'utf8'), devtoolsMatterOptions).content)
}

/** Save a body only if its revision still matches, preserving current metadata. */
export async function writePostContent(userRoot: string, filePath: string, content: string, revision: string): Promise<PostContent> {
  const file = await resolvePageFile(userRoot, filePath)
  return updatePageFile(file, (raw) => {
    const previous = matter(raw, devtoolsMatterOptions).content
    if (snapshot(previous).revision !== revision)
      throw new Error('The article body changed on disk. Reload it before saving.')
    // Preserve comments, formatting, and frontmatter edits made in the other tab.
    return { content: raw.slice(0, raw.length - previous.length) + content, result: snapshot(content) }
  })
}
