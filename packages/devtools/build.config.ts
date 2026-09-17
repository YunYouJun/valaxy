import { defineBuildConfig } from 'unbuild'

import { dependencies } from './package.json'

export default defineBuildConfig({
  entries: [
    './src/index',
    './src/node/definition',
    './src/shared/rpc',
    './src/page',
    './src/plugin',
    './src/client-api',
  ],
  clean: false,
  declaration: true,
  externals: [
    ...Object.keys(dependencies),
    'vite',
    'vue-router',

    // in valaxy
    'valaxy',
    'valaxy/node',
    'consola/utils',
  ],
  rollup: {
    dts: {
      respectExternal: true,
    },
  },
})
