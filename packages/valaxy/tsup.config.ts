import { globSync } from 'tinyglobby'
import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig((options) => {
  return {
    entry: [
      'node/index.ts',
      'node/cli/index.ts',
      // 'client/index.ts',
      'types/index.ts',

      ...globSync('node/worker_*.ts'),
    ],
    clean: true,
    dts: true,
    format: ['esm'],
    minify: !options.watch,
    external: [
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
     */
    banner: ({ format }) => {
      if (format === 'esm') {
        return {
          js: `import {createRequire as __createRequire} from 'module';var require=__createRequire(import\.meta.url);`,
        }
      }
    },
  }
})
