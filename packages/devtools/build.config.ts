import { defineBuildConfig } from 'unbuild'

import { dependencies } from '../../packages/valaxy/package.json'

export default defineBuildConfig({
  entries: [
    './src/index',
  ],
  clean: false,
  declaration: true,
  externals: [
    ...Object.keys(dependencies),

    // in valaxy
    'valaxy',
    'vite',
    'gray-matter',
    'fs-extra',
    'fast-glob',
    'consola',
  ],
  rollup: {
    dts: {
      respectExternal: true,
    },
  },
})
