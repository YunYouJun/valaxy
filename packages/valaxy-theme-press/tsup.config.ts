import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: ['node/index.ts'],
    // disable for dev watch before valaxy watch
    clean: !options.watch,
    dts: true,
    format: ['cjs', 'esm'],
    minify: !options.watch,
    external: [
      'valaxy',
      'vite',
    ],
  }
})
