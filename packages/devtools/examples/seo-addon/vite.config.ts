import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  root: fileURLToPath(new URL('./client', import.meta.url)),
  base: './',
  devtools: false,
  build: { outDir: '../dist/client', emptyOutDir: true },
})
