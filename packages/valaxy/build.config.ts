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
    'markdown-it-mathjax3',

    '@vueuse/shared',
  ],

  rollup: {
    inlineDependencies: [
      'unplugin-vue-markdown',
      '@mdit-vue/plugin-component',
      '@mdit-vue/plugin-frontmatter',
      '@mdit-vue/plugin-headers',
      '@mdit-vue/plugin-sfc',
      '@mdit-vue/plugin-title',
      '@mdit-vue/plugin-toc',
      '@mdit-vue/shared',
      '@mdit-vue/types',
      'gray-matter',
      'nanoid',
    ],
  },

  hooks: {
    'rollup:options': (_, options) => {
      // Bundle the Markdown adapter so published installs use the maintained
      // parser too, without workspace overrides or global Node loader hooks.
      options.plugins = [{
        name: 'valaxy-frontmatter',
        resolveId(id: string) {
          if (id === 'gray-matter')
            return { id: '@11ty/gray-matter', external: true }
        },
      }, options.plugins].flat()
    },
  },

  failOnWarn: false,
})
