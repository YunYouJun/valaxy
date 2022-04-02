import { createI18n } from 'vue-i18n'
import { initConfig, valaxyConfigSymbol } from '../config'
import { isDev } from '..'
import type { UserModule } from '~/types'

// Import i18n resources
// https://vitejs.dev/guide/features.html#glob-import
//
// Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
const messages = Object.fromEntries(
  Object.entries(
    import.meta.globEager('../locales/*.y(a)?ml'))
    .map(([key, value]) => {
      const yaml = key.endsWith('.yaml')
      return [key.slice(11, yaml ? -5 : -4), value.default]
    }),
)

function shouldHotReload(payload: any): boolean {
  const payloadPath = payload.path.replace(/(\bindex)?\.md$/, '')
  const locationPath = location.pathname.replace(/(\bindex)?\.html$/, '')
  return payloadPath === locationPath
}

// https://github.com/antfu/vite-plugin-pwa#automatic-reload-when-new-content-available
export const install: UserModule = ({ app, router }) => {
  // inject valaxy config before modules
  const valaxyConfigRef = initConfig()
  app.provide(valaxyConfigSymbol, valaxyConfigRef)

  // init i18n, by valaxy config
  const i18n = createI18n({
    legacy: false,
    locale: valaxyConfigRef.value.lang || 'en',
    messages,
  })
  app.use(i18n)

  // for dev
  if (isDev) {
    import.meta.hot!.on('valaxy:pageHeaders', (payload) => {
      if (shouldHotReload(payload))
        router.currentRoute.value.meta.headers = payload.pageHeaders
    })
  }
}
