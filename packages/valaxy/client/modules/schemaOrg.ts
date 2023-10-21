import { initValaxyConfig } from 'valaxy'
import type { UserModule } from '../types'

// https://unhead-schema-org.harlanzw.com/
export const install: UserModule = async ({ head, isClient, router }) => {
  // Disables on client build, allows 0kb runtime
  if (isClient && import.meta.env.PROD)
    return

  const valaxyConfig = initValaxyConfig()

  const { SchemaOrgUnheadPlugin } = await import('@unhead/schema-org')
  head?.use(SchemaOrgUnheadPlugin({
    // config
    host: valaxyConfig.value.siteConfig.url || 'https://valaxy.site',
    inLanguage: valaxyConfig.value.siteConfig.lang || 'en',
  }, () => {
    return {
      path: router.currentRoute.value.path,
      ...router.currentRoute.value.meta,
    }
  }))
}
