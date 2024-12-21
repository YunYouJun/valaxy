import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './src/index',
  ],
  clean: false,
  declaration: true,
  externals: [
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
