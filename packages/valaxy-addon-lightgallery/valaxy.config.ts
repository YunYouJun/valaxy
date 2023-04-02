import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  vite: {
    optimizeDeps: {
      include: ['lightgallery/vue/LightGalleryVue.umd.min.js'],
    },
  },
})
