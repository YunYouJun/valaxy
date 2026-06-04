import type { ViteDevServer } from 'vite'
import { exec } from 'node:child_process'
import os from 'node:os'
import process from 'node:process'
import * as readline from 'node:readline'
import { colors } from 'consola/utils'
import qrcode from 'qrcode'

export type CreateDevServer = () => Promise<void>

export interface CLIShortcut {
  key: string
  description: string
  action: (server: ViteDevServer, createDevServer: CreateDevServer) => void | Promise<void>
}

export const SHORTCUTS: CLIShortcut[] = [
  {
    key: 'r',
    description: 'restart',
    async action(server, createDevServer) {
      await server.close()
      setTimeout(async () => {
        await createDevServer()
      }, 100)
    },
  },
  {
    key: 'o',
    description: 'open',
    async action(server) {
      const { default: openBrowser } = await import('open')
      openBrowser(`http://localhost:${server.config.server.port}/`)
    },
  },
  {
    key: 'q',
    description: 'qr',
    action(server) {
      const addresses = Object.values(os.networkInterfaces())
        .flat()
        .filter(details => details?.family === 'IPv4' && !details.address.includes('127.0.0.1'))

      const port = server.config.server.port
      const remoteUrl = `http://${addresses[0]?.address || 'localhost'}:${port}`
      qrcode.toString(remoteUrl, { type: 'terminal' }, (err, qrCode) => {
        if (err)
          throw err

        console.log(qrCode)
      })
    },
  },
  {
    key: 'e',
    description: 'edit',
    action() {
      exec(`code "${process.cwd()}"`, (err) => {
        if (err)
          console.error('Failed to open editor', err)
      })
    },
  },
]

/**
 * bind shortcut for terminal
 */
export function bindShortcuts(server: ViteDevServer, createDevServer: CreateDevServer) {
  // Shortcuts require a raw-mode TTY, so skip non-interactive environments
  // (CI, piped stdin, docker without `-it`, pm2/nohup, background jobs).
  // Beyond being useless there, `process.stdin.resume()` on a non-TTY stdin puts it into
  // flowing mode and lets it reach EOF — which triggers vite's `process.stdin.on('end')`
  // handler (registered in `server.listen()` unless `CI==='true'`) to close the server and
  // exit. That is what made `valaxy dev` exit immediately in non-TTY environments.
  if (!server.httpServer || !process.stdin.isTTY || process.env.CI)
    return

  process.stdin.resume()
  process.stdin.setEncoding('utf8')
  readline.emitKeypressEvents(process.stdin)
  process.stdin.setRawMode(true)

  async function onKeyPress(str: any, key: any) {
    if (key.ctrl && key.name === 'c') {
      process.exit()
    }
    else {
      const shortcut = SHORTCUTS.find(shortcut => shortcut.key === str)
      if (!shortcut)
        return

      try {
        await shortcut.action(server, createDevServer)
      }
      catch (error) {
        console.error(colors.red('Error executing shortcut:'), key, error)
      }
    }
  }

  process.stdin.on('keypress', onKeyPress)
  server.httpServer.on('close', () => {
    process.stdin.off('keypress', onKeyPress)
  })
}
