import { defineConfig } from 'vite'
import config from './valaxy.config'

const safelist = [
  'i-ri-home-line',
]

/**
 * add your icon to safelist
 * if your theme is not yun, so you can add it by yourself
 */
config.themeConfig?.pages?.forEach((item) => {
  item?.icon && safelist?.push(item?.icon)
})

export default defineConfig({
  valaxy: {
    unocss: {
      safelist,
    },
  },
})
