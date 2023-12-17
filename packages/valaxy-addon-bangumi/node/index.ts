import { defineValaxyAddon } from 'valaxy'
import consola from 'consola'
import pkg from '../package.json'

import type { BangumiOptions } from '../types'

export const addonBangumi = defineValaxyAddon<BangumiOptions>(options => ({
  name: pkg.name,
  enable: true,
  options,

  setup(valaxy) {
    valaxy.hook('build:before', () => {
      consola.info('[valaxy-addon-bangumi] build:before')
    })
  },
}))
