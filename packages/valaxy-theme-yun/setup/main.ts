import { defineAppSetup, useAppStore } from 'valaxy'
import { nextTick } from 'vue'
import { useYunAppStore } from '../stores'

export default defineAppSetup((ctx) => {
  // can do for setup

  const { router } = ctx
  const appStore = useAppStore()
  const yunAppStore = useYunAppStore()
  router.afterEach(() => {
    nextTick(() => {
      if (appStore.isMobile)
        yunAppStore.leftSidebar.close()
    })
  })
})
