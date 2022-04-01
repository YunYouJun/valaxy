import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: ['src/node/index.ts', 'src/node/cli.ts', 'src/types/index.ts'],
    splitting: true,
    clean: true,
    dts: true,
    format: ['cjs', 'esm'],
    minify: !options.watch,
    external: [
      'vite',
      'sass',
      'chalk',
    ],
  }
})
