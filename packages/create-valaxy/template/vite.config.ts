import { defineConfig } from 'vite'

// add icons what you will need
const safelist = [
  'i-ri-home-line',
]

export default defineConfig({
  valaxy: {
    unocss: {
      safelist,
    },
  },
})
