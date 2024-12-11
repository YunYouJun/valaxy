import { MotionPlugin } from '@vueuse/motion'
import PrimeVue from 'primevue/config'

import ToastService from 'primevue/toastservice'
import { defineAppSetup } from 'valaxy'
import { useYunAppStore } from '../stores'

import primeStyles from '../styles/primevue'

import 'valaxy/client/styles/common/index.scss'
import '../styles/global.scss'
import '../styles/primevue/tooltip.scss'

export default defineAppSetup((ctx) => {
  // can do for setup

  const { router, app } = ctx
  // https://motion.vueuse.org/
  app.use(MotionPlugin)
  // primevue
  app.use(PrimeVue, {
    unstyled: true,
    // ripple: true,

    pt: {
      // tooltip: {
      //   arrow: {
      //     style: {
      //       borderBottomColor: 'var(--p-primary-color)',
      //     },
      //   },
      //   text: '!bg-primary !text-primary-contrast !font-medium',
      // },
      ...primeStyles,

      dock: {
        root: 'yun-dock',
        list: 'yun-dock-list',
        listContainer: 'yun-dock-list-container',
        item: 'yun-dock-item',
        itemLink: 'yun-dock-item-link',
      },
    },
  })

  // use floating-vue
  // app.directive('tooltip', Tooltip)
  app.use(ToastService)

  // app.$primevue.config.ripple = true

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
