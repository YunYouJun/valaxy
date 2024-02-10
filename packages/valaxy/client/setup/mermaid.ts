/* __imports__ */

import { defineMermaidSetup } from 'valaxy'
import type { MermaidOptions } from '../types'

export default defineMermaidSetup(() => {
  // eslint-disable-next-line prefer-const
  let injection_return: MermaidOptions = {
    theme: 'default',
  }

  /* __injections__ */

  return injection_return
})
