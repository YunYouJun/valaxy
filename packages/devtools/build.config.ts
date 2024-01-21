import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './src/index',
  ],
  clean: false,
  declaration: true,
  externals: [
    'vite',
  ],
  rollup: {
    emitCJS: true,
    dts: {
      respectExternal: true,
    },
  },
})
