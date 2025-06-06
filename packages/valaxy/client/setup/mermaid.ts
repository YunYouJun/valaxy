/* __imports__ */

import type { MermaidOptions } from '../types'
import { defineMermaidSetup } from 'valaxy'

/**
 * @en
 * Extend the Mermaid configuration.
 *
 * @zh
 * 扩展 Mermaid 配置。
 */
export default defineMermaidSetup(() => {
  // eslint-disable-next-line prefer-const
  let injection_return: MermaidOptions = {
    theme: 'default',
  }

  /* __injections__ */

  return injection_return
})
