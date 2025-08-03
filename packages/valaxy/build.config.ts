import { defineBuildConfig } from 'unbuild'
import pkg from './package.json'

export default defineBuildConfig({
  entries: [
    'node/index',
    'node/cli/index',
    // 'client/index',
    'types/index',
  ],
  clean: true,
  declaration: 'node16',
  externals: [
    'valaxy/types',

    '/@valaxyjs/',
    '/@valaxyjs/config',
    '/@valaxyjs/context',

    ...Object.keys(pkg.dependencies || {}),

    // dynamic install
    'gh-pages',
    'rollup-plugin-visualizer',

    '@vueuse/shared',
  ],

  failOnWarn: false,
})
