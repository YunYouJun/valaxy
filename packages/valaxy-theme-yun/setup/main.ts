import { defineAppSetup } from 'valaxy'
import '../styles/global.scss'
import { MotionPlugin } from '@vueuse/motion'

export default defineAppSetup((ctx) => {
  // can do for setup

  const { router, app } = ctx
  // https://motion.vueuse.org/
  app.use(MotionPlugin)
  router.afterEach(() => {
    /**
     * router import order
     * @see https://pinia.vuejs.org/zh/core-concepts/outside-component-usage.html#single-page-applications
     */
  })
})
