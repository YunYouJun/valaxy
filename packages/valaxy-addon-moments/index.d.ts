export * from './client'
export * from './node'
export * from './types'

declare module 'vue-router' {
  interface RouteMeta {
    /** Rendered Markdown for an entry provided by valaxy-addon-moments. */
    momentContent?: string
  }
}
