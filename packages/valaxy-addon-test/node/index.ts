import { defineValaxyAddon } from 'valaxy'
import consola from 'consola'
import pkg from '../package.json'

export const addonTest = defineValaxyAddon(options => ({
  name: pkg.name,
  enable: true,
  options,

  setup(valaxy) {
    valaxy.hook('build:before', () => {
      consola.log('build:before')
    })
  },
}))
