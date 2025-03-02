import consola from 'consola'
import { defineValaxyAddon } from 'valaxy'
import pkg from '../package.json'

export const addonTest = defineValaxyAddon(options => ({
  name: pkg.name,
  enable: true,
  options,

  setup(valaxy) {
    valaxy.hook('build:before', () => {
      // do something before build
      consola.info('[valaxy-addon-test] build:before')
    })
  },
}))
