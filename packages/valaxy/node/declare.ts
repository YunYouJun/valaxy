import type { ViteSSGOptions } from 'vite-ssg'
import type { ValaxyPluginOptions } from './options'

// extend vite.config.ts
declare module 'vite' {
  interface UserConfig {
    /**
     * Custom internal plugin options for Valaxy (advanced)
     *
     * @see ./options.ts'
     */
    valaxy?: ValaxyPluginOptions

    ssgOptions?: ViteSSGOptions
  }
}
