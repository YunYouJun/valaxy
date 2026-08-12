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

/**
 * Transient state shared by plugins in one Valaxy build context.
 */
export class StateManager {
  /**
   * @zh 文章 ID 映射
   */
  idMap: Map<string, ValaxyFileInfo> = new Map()
  private pendingFiles = new Map<string, ValaxyFileInfo[]>()
  private disposers = new Set<() => void>()

  get size() {
    let size = 0
    for (const pending of this.pendingFiles.values())
      size += pending.length
    for (const id of this.idMap.keys()) {
      if (!this.pendingFiles.has(id))
        size++
    }
    return size
  }

  set(fileInfo: ValaxyFileInfo) {
    const pending = this.pendingFiles.get(fileInfo.id)
    if (pending)
      pending.push(fileInfo)
    else
      this.pendingFiles.set(fileInfo.id, [fileInfo])

    // Preserve the original public map as a view of the latest environment.
    this.idMap.set(fileInfo.id, fileInfo)
  }

  get(id: string) {
    return this.idMap.get(id)
  }

  take(id: string) {
    const pending = this.pendingFiles.get(id)
    if (!pending) {
      // Compatibility for callers that still write to idMap directly.
      const fileInfo = this.idMap.get(id)
      this.idMap.delete(id)
      return fileInfo
    }

    const fileInfo = pending.shift()
    if (!pending.length) {
      this.pendingFiles.delete(id)
      this.idMap.delete(id)
    }
    return fileInfo
  }

  delete(id: string) {
    this.pendingFiles.delete(id)
    return this.idMap.delete(id)
  }

  clear() {
    this.pendingFiles.clear()
    this.idMap.clear()
  }

  onDispose(dispose: () => void) {
    this.disposers.add(dispose)
  }

  dispose() {
    this.clear()
    for (const dispose of this.disposers)
      dispose()
    this.disposers.clear()
  }
}
