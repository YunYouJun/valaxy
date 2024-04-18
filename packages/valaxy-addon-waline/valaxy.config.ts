import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  vite: {
    optimizeDeps: {
      include: ['@waline/client/component'],
    },
  },
})
