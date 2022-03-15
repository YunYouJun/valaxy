import * as readline from 'readline'
import consola from 'consola'
import type { InlineConfig } from 'vite'
import { createServer } from '../server'
import type { ResolvedValaxyOptions } from '../options'

export async function initServer(options: ResolvedValaxyOptions, viteConfig: InlineConfig) {
  try {
    const server = await createServer(options, viteConfig)

    await server.listen()
    console.log()
    server.printUrls()
  }
  catch (e) {
    consola.error('failed to start server. error:\n')
    console.error(e)
    process.exit(1)
  }
}

/**
     * bind shortcut for terminal
     */
export function bindShortcut(SHORTCUTS: { name: string; fullName: string; action: () => void }[]) {
  process.stdin.resume()
  process.stdin.setEncoding('utf8')
  readline.emitKeypressEvents(process.stdin)
  if (process.stdin.isTTY)
    process.stdin.setRawMode(true)

  process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.exit()
    }
    else {
      const [sh] = SHORTCUTS.filter(item => item.name === str)
      if (sh) {
        try {
          sh.action()
        }
        catch (err) {
          console.error(`Failed to execute shortcut ${sh.fullName}`, err)
        }
      }
    }
  })
}
