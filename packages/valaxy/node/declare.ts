import type { ViteSSGOptions } from 'vite-ssg'

// extend vite.config.ts
// Note: vite-ssg already augments Vite's UserConfig with ssgOptions?: ViteSSGOptions.
// We re-declare with the same type here for explicitness. The new Valaxy SSG engine
// reads ssgOptions as ValaxySSGOptions internally (the option shapes are compatible).
declare module 'vite' {
  interface UserConfig {
    ssgOptions?: ViteSSGOptions
  }
}
