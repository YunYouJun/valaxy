// for client
export interface ValaxyAddon<AddonOptions = Record<string, any>> {
  name: string
  /** Whether the addon is enabled. @default true */
  enable?: boolean
  /**
   * be global component
   */
  global?: boolean
  props?: Record<string, any>
  options?: AddonOptions
}
