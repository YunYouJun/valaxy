import { defineConfig } from 'tsdown'

export default defineConfig((options) => {
  return {
    entry: [
      './src/index.ts',
    ],
    format: ['cjs', 'esm'],
    minify: !options.watch,

    outExtensions({ format }) {
      return {
        js: `.${format === 'es' ? 'mjs' : 'cjs'}`,
      }
    },

    /**
     * @see https://tsdown.dev/options/shims
     * shim for __filename
     */
    shims: true,
  }
})
