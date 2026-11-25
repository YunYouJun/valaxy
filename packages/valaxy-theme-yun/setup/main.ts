import { MotionPlugin } from '@vueuse/motion'
import { defineAppSetup } from 'valaxy'
import { useThemeConfig } from '../composables'
import { useYunAppStore } from '../stores'
import { setupYunRouteTransition } from '../utils/routeTransition'

export default defineAppSetup((ctx) => {
  const { router, app, isClient } = ctx
  // https://motion.vueuse.org/
  app.use(MotionPlugin)

  if (isClient) {
    const themeConfig = app.runWithContext(() => useThemeConfig())
    const stopRouteTransition = setupYunRouteTransition(router, () => themeConfig.value.viewTransition !== false)
    app.onUnmount(stopRouteTransition)
  }

  router.afterEach(() => {
    /**
     * router import order
     * @see https://pinia.vuejs.org/zh/core-concepts/outside-component-usage.html#single-page-applications
     */
    const app = useYunAppStore()
    if (app.fullscreenMenu.isOpen)
      app.fullscreenMenu.toggle()
  })
})
