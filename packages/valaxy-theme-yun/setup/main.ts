import { defineAppSetup } from 'valaxy'

export default defineAppSetup((ctx) => {
  // can do for setup

  const { router } = ctx
  router.afterEach(() => {
    /**
     * router import order
     * @see https://pinia.vuejs.org/zh/core-concepts/outside-component-usage.html#single-page-applications
     */
  })
})
