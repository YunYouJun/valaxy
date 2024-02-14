import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './src/index',
  ],
  clean: false,
  declaration: true,
  externals: [
    // in valaxy
    'vite',
    'gray-matter',
    'fs-extra',
  ],
  rollup: {
    emitCJS: true,
    dts: {
      respectExternal: true,
    },
  },
})
