import { build as buildNode } from 'tsup'
import { build as buildRenderer } from 'vite'

await buildNode({
  entry: { index: 'src/main/index.ts', worker: 'src/main/worker.ts' },
  format: ['esm'],
  outDir: 'dist/main',
  external: ['electron'],
  splitting: false,
  clean: true,
})
// Sandboxed preload scripts require CommonJS and cannot import local modules.
await buildNode({
  entry: { preload: 'src/main/preload.ts' },
  format: ['cjs'],
  outDir: 'dist/main',
  external: ['electron'],
  splitting: false,
})
await buildRenderer()
