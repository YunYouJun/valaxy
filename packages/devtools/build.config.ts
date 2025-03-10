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
    'valaxy/node',
  ],
  rollup: {
    dts: {
      respectExternal: true,
    },
  },
})
