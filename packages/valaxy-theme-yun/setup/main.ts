import { defineAppSetup, useAppStore } from 'valaxy'
import { nextTick } from 'vue'
import { useYunAppStore } from '../stores'

export default defineAppSetup((ctx) => {
  // can do for setup

  const { router } = ctx
  router.afterEach(() => {
    /**
     * router import order
     * @see https://pinia.vuejs.org/zh/core-concepts/outside-component-usage.html#single-page-applications
     */
    const appStore = useAppStore()
    const yunAppStore = useYunAppStore()
    nextTick(() => {
      if (appStore.isMobile)
        yunAppStore.leftSidebar.close()
    })
  })
})
