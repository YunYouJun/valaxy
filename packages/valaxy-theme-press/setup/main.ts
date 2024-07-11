import { defineAppSetup, scrollTo } from 'valaxy'
import { nextTick } from 'vue'

import 'vitepress/dist/client/theme-default/styles/vars.css'
import 'vitepress/dist/client/theme-default/styles/icons.css'

// import 'vitepress/dist/client/theme-default/styles/base.css'
// import 'vitepress/dist/client/theme-default/styles/utils.css'
import 'vitepress/dist/client/theme-default/styles/components/vp-code.css'
import 'vitepress/dist/client/theme-default/styles/components/vp-code-group.css'
import 'vitepress/dist/client/theme-default/styles/components/vp-doc.css'
import 'vitepress/dist/client/theme-default/styles/components/custom-block.css'

// import 'vitepress/dist/client/theme-default/styles/components/vp-sponsor.css'

export default defineAppSetup((ctx) => {
  const { router, isClient } = ctx
  if (!isClient)
    return

  router.afterEach((to, from) => {
    if (to.path !== from.path)
      return

    nextTick(() => {
      scrollTo(document.body, to.hash, {
        smooth: true,
      })
    })
  })
})
