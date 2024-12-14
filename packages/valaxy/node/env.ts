import type { ViteDevServer } from 'vite'

export const GLOBAL_STATE: {
  server: ViteDevServer | undefined
} = {
  server: undefined,
}
