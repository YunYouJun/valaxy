import { createI18n } from 'vue-i18n'

/*
 * All i18n resources specified in the plugin `include` option can be loaded
 * at once using the import syntax
 *
 * Not support ssr https://github.com/intlify/bundle-tools/issues/78
 */
// import messages from '@intlify/vite-plugin-vue-i18n/messages'

import { useStorage } from '@vueuse/core'

import { initConfig, valaxyConfigSymbol } from '../config'

import type { UserModule } from '~/types'

// @ts-expect-error virtual
import messages from '/@valaxyjs/locales'

// Import i18n resources
// https://vitejs.dev/guide/features.html#glob-import
//
// Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
// const messages = Object.fromEntries(
//   Object.entries(
//     import.meta.globEager('../locales/*.y(a)?ml'))
//     .map(([key, value]) => {
//       const yaml = key.endsWith('.yaml')
//       return [key.slice(11, yaml ? -5 : -4), value.default]
//     }),
// )

// import zh from '../../../../../demo/yun/locales/zh-CN.yml'
// import en from '../../../../../demo/yun/locales/en.yml'

function shouldHotReload(payload: any): boolean {
  const payloadPath = payload.path.replace(/(\bindex)?\.md$/, '')
  const locationPath = location.pathname.replace(/(\bindex)?\.html$/, '')
  return payloadPath === locationPath
}

export const install: UserModule = ({ app, router }) => {
  // inject valaxy config before modules
  const config = initConfig()
  app.provide(valaxyConfigSymbol, config)

  const locale = useStorage('valaxy-locale', config.value.lang || 'en')

  // init i18n, by valaxy config
  const i18n = createI18n({
    legacy: false,
    locale: locale.value,
    messages,
  })
  app.use(i18n)

  // for dev
  if (__DEV__) {
    import.meta.hot!.on('valaxy:pageHeaders', (payload) => {
      if (shouldHotReload(payload))
        router.currentRoute.value.meta.headers = payload.pageHeaders
    })
  }
}
