import type { ValaxySSGOptions } from './build/ssg'

// extend vite.config.ts
// The Valaxy SSG engine reads `ssgOptions` (typed as ValaxySSGOptions) from Vite's UserConfig.
declare module 'vite' {
  interface UserConfig {
    ssgOptions?: ValaxySSGOptions
  }
}
