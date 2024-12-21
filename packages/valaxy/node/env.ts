import type { ViteDevServer } from 'vite'
import type { ValaxyApp } from './types'

export const GLOBAL_STATE: {
  valaxyApp: ValaxyApp | undefined
  server: ViteDevServer | undefined
} = {
  valaxyApp: undefined,
  server: undefined,
}
