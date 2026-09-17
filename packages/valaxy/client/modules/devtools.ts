import type { UserModule } from '../types'
import { createValaxyPageBridge } from '@valaxyjs/devtools/page'
import { useWindowSize } from '@vueuse/core'
import { effectScope, onScopeDispose, watch } from 'vue'
import { useScreenSize } from '../composables/helper/useScreenSize'
import { useValaxyConfig } from '../config'

export const install: UserModule = ({ app, router }) => {
  const scope = effectScope()
  app.runWithContext(() => scope.run(() => {
    const config = useValaxyConfig()
    const { width, height } = useWindowSize()
    const screen = useScreenSize()
    const bridge = createValaxyPageBridge(router, {
      getDebug() {
        const route = router.currentRoute.value
        const { siteConfig, themeConfig, theme } = config.value
        return {
          route: {
            path: route.path,
            fullPath: route.fullPath,
            name: route.name == null ? undefined : String(route.name),
            layout: String(route.meta.layout || 'default'),
            query: route.query,
            params: route.params,
          },
          viewport: {
            width: width.value,
            height: height.value,
            breakpoints: [
              { label: 'xs', active: screen.isXs.value },
              { label: 'sm', active: screen.isSm.value },
              { label: 'md', active: screen.isMd.value },
              { label: 'lg', active: screen.isLg.value },
              { label: 'xl', active: screen.isXl.value },
              { label: '2xl', active: screen.is2xl.value },
            ],
          },
          config: {
            theme: theme || '',
            site: { lang: siteConfig.lang, title: siteConfig.title, url: siteConfig.url },
            themeConfig: { ...themeConfig },
          },
        }
      },
    })
    const sync = () => bridge.sync()
    watch([width, height, config, ...Object.values(screen)], sync, { deep: true })
    import.meta.hot?.on('valaxy:pageData', sync)
    onScopeDispose(() => {
      bridge.close()
      import.meta.hot?.off('valaxy:pageData', sync)
    })
  }))
  app.onUnmount(() => scope.stop())
  import.meta.hot?.dispose(() => scope.stop())
}
