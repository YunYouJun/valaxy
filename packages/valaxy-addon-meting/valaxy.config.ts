import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => {
          return tag === 'meting-js'
        },
      },
    },
  },
})
