import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  vue: {
    isCustomElement: [
      (tag) => {
        return tag === 'meting-js'
      },
    ],
  },
})
