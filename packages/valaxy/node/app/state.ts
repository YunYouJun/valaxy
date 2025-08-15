import type { Header } from '@valaxyjs/utils'

export interface ValaxyFileInfo {
  /**
   * file path id
   */
  id: string
  title: string
  headers: Header[]
  links: string[]
  frontmatter: Record<string, any>
}

export class StateManager {
  /**
   * @zh 文章 ID 映射
   */
  idMap: Map<string, ValaxyFileInfo> = new Map()
}
