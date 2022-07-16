import type { ViteSSGOptions } from 'vite-ssg'

// extend vite.config.ts
declare module 'vite' {
  interface UserConfig {
    ssgOptions?: ViteSSGOptions
  }
}
