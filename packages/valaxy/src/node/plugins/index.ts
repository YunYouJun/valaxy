
import type { ValaxyConfig } from 'valaxy/src/types'
import type { Plugin } from 'vite'
import { VALAXY_CONFIG_ID } from './valaxy'

export function createValaxyPlugin(valaxyConfig: ValaxyConfig): Plugin {
  const valaxyPrefix = '/@valaxy'

  return {
    name: 'Valaxy',

    resolveId(id) {
      if (id.startsWith(valaxyPrefix))
        return id
      return null
    },

    load(id) {
      if (id === `/${VALAXY_CONFIG_ID}`)
        // stringify twice for \"
        return `export default ${JSON.stringify(JSON.stringify(valaxyConfig))}`

      if (id.startsWith(valaxyPrefix))
        return ''
    },
  }
}
