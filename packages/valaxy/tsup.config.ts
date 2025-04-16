import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig((_options) => {
  return {
    entry: [
      'node/index.ts',
      'node/cli/index.ts',
      // 'client/index.ts',
      'types/index.ts',
    ],
    clean: true,
    dts: true,
    format: ['esm'],
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
     * @see https://tsup.egoist.dev/#inject-cjs-and-esm-shims
     * shim for __filename
     */
    shims: true,
    /**
     * @see https://github.com/egoist/tsup/discussions/505
     * banner require not needed
     */
  }
})
