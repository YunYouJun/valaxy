import { defineConfig } from 'tsdown'
import pkg from './package.json' with { type: 'json' }

export default defineConfig((_options) => {
  return {
    entry: [
      'node/index.ts',
      'node/cli/index.ts',
      // 'client/index.ts',
      'types/index.ts',
    ],
    // minify: !options.watch,
    external: [
      '/@valaxyjs/',
      '/@valaxyjs/config',
      '/@valaxyjs/context',

      'valaxy/types',
      ...Object.keys(pkg.dependencies || {}),

      // dynamic install
      'gh-pages',
      'rollup-plugin-visualizer',
    ],

    /**
     * @see https://tsdown.dev/options/shims
     * shim for __filename
     */
    shims: true,
  }
})
