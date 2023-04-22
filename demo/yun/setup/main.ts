import { defineAppSetup } from 'valaxy'

// eslint-disable-next-line unused-imports/no-unused-vars
export default defineAppSetup(({ router, isClient }) => {
  // router.isReady().then(async () => {
  //   if (!isClient)
  //     return
  //   const { registerSW } = await import('virtual:pwa-register')
  //   registerSW({ immediate: true })
  // })
})
