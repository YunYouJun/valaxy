import type { Alias } from 'vite'
import path from 'node:path'

export const commonAlias: Alias[] = [
  { find: 'valaxy/vendor/layouts/runtime.mjs', replacement: path.resolve(import.meta.dirname, '../../valaxy/vendor/layouts/runtime.mjs') },
  { find: 'valaxy', replacement: path.resolve(import.meta.dirname, '../../valaxy/client/index.ts') },
  { find: '@valaxyjs/utils', replacement: path.resolve(import.meta.dirname, '../../@valaxyjs/utils/src/index.ts') },
]
