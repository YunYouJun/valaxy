import type { UserModule } from '../types'
import { InferSeoMetaPlugin } from '@unhead/addons'

export const install: UserModule = async ({ head, isClient }) => {
  // Disables on client build, allows 0kb runtime
  if (isClient && import.meta.env.PROD)
    return

  /**
   * https://unhead.unjs.io/docs/head/guides/plugins/infer-seo-meta-tags
   */
  head?.use(InferSeoMetaPlugin())
}
