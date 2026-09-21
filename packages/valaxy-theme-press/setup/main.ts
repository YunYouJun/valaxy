import { defineAppSetup, scrollTo } from 'valaxy'
import { nextTick } from 'vue'
import PressToggleLocale from '../components/PressToggleLocale.vue'

import 'valaxy/client/styles/common/index.scss'

import '../styles/tokens.css'
import 'valaxy/client/styles/components/custom-block.scss'
import '../styles/code.css'
import '../styles/code-group.css'
import '../styles/doc.css'

export default defineAppSetup((ctx) => {
  const { app, router, isClient } = ctx

  // Register components that may appear in post excerpts
  // (runtime-compiled templates can only resolve globally registered components)
  app.component('PressToggleLocale', PressToggleLocale)

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
