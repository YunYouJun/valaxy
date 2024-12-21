import fs from 'fs-extra'
import matter from 'gray-matter'
import { JSON_SCHEMA } from 'js-yaml'

/**
 * migration
 * @param path
 * @param frontmatter
 */
export async function migration(path: string, frontmatter: { [key: string]: string }) {
  if (fs.existsSync(path)) {
    const rawMd = await fs.readFile(path, 'utf-8')
    const matterFile = matter(rawMd, { schema: JSON_SCHEMA } as any)
    let mod = false
    for (const key in frontmatter) {
      if (key in matterFile.data) {
        matterFile.data[frontmatter[key]] = matterFile.data[key]
        delete matterFile.data[key]
        mod = true
      }
    }
    if (mod) {
      const newMd = matter.stringify(matterFile.content, matterFile.data)
      await fs.writeFile(path, newMd)
    }
  }
  else {
    // console.error(`post not exist:${path}`)
  }
}
