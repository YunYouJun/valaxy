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

    // The redirect installer must stay a real file so import.meta.url points
    // at vendor/, where redirect-gray-matter.mjs lives.
    'valaxy/vendor/ensure-gray-matter.mjs',

    // dynamic install
    'gh-pages',
    'rollup-plugin-visualizer',
    'markdown-it-mathjax3',

    '@vueuse/shared',
  ],

  rollup: {
    inlineDependencies: [
      '@mdit-vue/plugin-headers',
      '@mdit-vue/plugin-sfc',
      '@mdit-vue/plugin-title',
      '@mdit-vue/plugin-toc',
      '@mdit-vue/shared',
      '@mdit-vue/types',
      'nanoid',
    ],
  },

  failOnWarn: false,
})
