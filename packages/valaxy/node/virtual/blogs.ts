import type { VirtualModuleTemplate } from './types'
import path from 'node:path'
import fs from 'fs-extra'
import { toAtFS } from '../utils'

/**
 * blog features
 * @param name
 */
function createBlogTemplate(name: string): VirtualModuleTemplate {
  return {
    id: `/@valaxyjs/blog/${name}s`,
    async getContent({ userRoot }) {
      // glob collections/${collectionId}/index.ts
      const root = path.resolve(userRoot, 'pages', 'collections')
      if (!(await fs.pathExists(root))) {
        return `export default []`
      }

      // 是目录
      const isDir = (file: string) => fs.statSync(path.join(root, file)).isDirectory()
      // 读取目录下的所有文件
      const files = fs.readdirSync(root).filter(file => isDir(file)).map(file => path.join(root, file, 'index.ts'))

      const imports: string[] = []
      const getImportedName = (idx: number) => `__valaxy_${name}_${idx + 1}`
      files.forEach((file, idx) => {
        const importedName = getImportedName(idx)
        const dirName = path.basename(path.dirname(file))
        imports.push(`import ${importedName} from '${toAtFS(file)}'`)
        // auto-derive key from directory name if not set
        imports.push(`const ${importedName}_e = { key: ${JSON.stringify(dirName)}, ...${importedName} }`)
      })

      // return array with enriched entries
      imports.push(`export default [${files.map((_, idx) => `${getImportedName(idx)}_e`).join(', ')}]`)
      return imports.join('\n')
    },
  }
}

/**
 * collections: collections/${collectionId}/index.ts
 */
const configs = [
  'collection',
]

export const templateBlogs = configs.map(createBlogTemplate)
