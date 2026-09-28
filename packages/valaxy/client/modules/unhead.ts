import type { UserModule } from '../types'
import { InferSeoMetaPlugin } from '@unhead/bundler'

export const install: UserModule = async ({ head, isClient }) => {
  // Disables on client build, allows 0kb runtime
  if (isClient && import.meta.env.PROD)
    return

  // Unhead's server entry adds this default, but its client entry does not.
  // Keep mobile development previews at device width, just like SSG pages.
  if (import.meta.env.DEV) {
    head?.push({
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    })
  }

  /**
   * https://unhead.unjs.io/docs/head/guides/plugins/infer-seo-meta-tags
   */
  head?.use(InferSeoMetaPlugin())
}
