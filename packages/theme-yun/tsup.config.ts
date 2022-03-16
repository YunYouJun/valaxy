import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    splitting: true,
    // disable for dev watch before valaxy watch
    clean: !options.watch,
    dts: true,
    format: ['cjs', 'esm'],
    minify: !options.watch,
  }
})
