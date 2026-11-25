import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { defineValaxyConfig } from 'valaxy'

const require = createRequire(import.meta.url)

function resolveWalineClientDir() {
  try {
    return dirname(require.resolve('@waline/client/package.json'))
  }
  catch {
    return undefined
  }
}

const walineClientDir = resolveWalineClientDir()

export default defineValaxyConfig({
  vite: {
    ...(walineClientDir
      ? {
          server: {
            fs: {
              allow: [walineClientDir],
            },
          },
        }
      : {}),
  },
})
