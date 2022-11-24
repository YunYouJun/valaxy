export interface ValaxyAddon<AddonOptions = Record<string, any>> {
  name: string
  /**
   * be global component
   */
  global?: boolean
  props?: Record<string, any>
  options?: AddonOptions
}
