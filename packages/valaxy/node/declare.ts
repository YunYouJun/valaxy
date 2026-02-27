import type { ValaxySSGOptions } from './build/ssg'

// extend vite.config.ts
declare module 'vite' {
  interface UserConfig {
    ssgOptions?: ValaxySSGOptions
  }
}
