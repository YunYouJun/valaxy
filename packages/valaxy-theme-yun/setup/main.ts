import { defineAppSetup } from 'valaxy'
import '../styles/global.scss'
import { MotionPlugin } from '@vueuse/motion'

import PrimeVue from 'primevue/config'
import AnimateOnScroll from 'primevue/animateonscroll'
import StyleClass from 'primevue/styleclass'

export default defineAppSetup((ctx) => {
  // can do for setup

  const { router, app } = ctx
  // https://motion.vueuse.org/
  app.use(MotionPlugin)
  // primevue
  app.use(PrimeVue, {
    unstyled: true,
  })
  app.directive('animateonscroll', AnimateOnScroll)
  app.directive('styleclass', StyleClass)

  router.afterEach(() => {
    /**
     * router import order
     * @see https://pinia.vuejs.org/zh/core-concepts/outside-component-usage.html#single-page-applications
     */
  })
})
