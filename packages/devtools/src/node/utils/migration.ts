import matter from '@11ty/gray-matter'
import fs from 'fs-extra'
import { devtoolsMatterOptions } from './matter'

/**
 * migration
 * @param path
 * @param frontmatter
 */
export async function migration(path: string, frontmatter: { [key: string]: string }, validateFrontmatter: (data: Record<string, unknown>) => void = () => {}) {
  if (fs.existsSync(path)) {
    const rawMd = await fs.readFile(path, 'utf-8')
    const matterFile = matter(rawMd, devtoolsMatterOptions)
    let mod = false
    for (const key in frontmatter) {
      if (key in matterFile.data) {
        matterFile.data[frontmatter[key]] = matterFile.data[key]
        delete matterFile.data[key]
        mod = true
      }
    }
    if (mod) {
      validateFrontmatter(matterFile.data)
      const newMd = matter.stringify(matterFile.content, matterFile.data, devtoolsMatterOptions)
      await fs.writeFile(path, newMd)
    }
  }
  else {
    // console.error(`post not exist:${path}`)
  }
}
