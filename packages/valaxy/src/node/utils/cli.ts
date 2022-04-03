import * as readline from 'readline'
import path from 'path'
import os from 'os'
// import equal from 'fast-deep-equal'

import chalk from 'chalk'
import consola from 'consola'
import type { InlineConfig, ViteDevServer } from 'vite'
import { createServer } from '../server'
import type { ResolvedValaxyOptions } from '../options'
import { version } from '../../../package.json'
import { createSafelist } from '../plugins/unocss'

let server: ViteDevServer | undefined

export function printInfo(options: ResolvedValaxyOptions, port?: number, remote?: string | boolean) {
  console.log()
  console.log(`  ${chalk.bold('🌌 Valaxy')}  ${chalk.blue(`v${version}`)}`)
  console.log()
  console.log(`${chalk.dim('  🪐 theme  ')} > ${(options.theme ? chalk.green(options.theme) : chalk.gray('none'))}`)
  console.log(`  ${chalk.dim('📁')} ${chalk.dim(path.resolve(options.userRoot))}`)
  if (port) {
    console.log()
    console.log(`${chalk.dim('  Preview   ')} > ${chalk.cyan(`http://localhost:${chalk.bold(port)}/`)}`)

    if (remote) {
      Object.values(os.networkInterfaces())
        .forEach(v => (v || [])
          .filter(details => details.family === 'IPv4' && !details.address.includes('127.0.0.1'))
          .forEach(({ address }) => {
            console.log(`${chalk.dim('  Network   ')} > ${chalk.blue(`http://${address}:${chalk.bold(port)}/`)}`)
          }),
        )
    }

    console.log()
    console.log(`${chalk.dim('  shortcuts ')} > ${chalk.underline('r')}${chalk.dim('estart | ')}${chalk.underline('o')}${chalk.dim('pen | ')}${chalk.underline('e')}${chalk.dim('dit')}`)
  }
  console.log()
}

export async function initServer(options: ResolvedValaxyOptions, viteConfig: InlineConfig) {
  if (server)
    await server.close()

  try {
    const safelist = createSafelist(options.config).concat(options.config.unocss.safelist || [])

    server = await createServer(options, viteConfig, {
      onConfigReload(newConfig, config) {
        let reload = false

        const iconChanged = newConfig.social.some((item, i) => {
          return !safelist.includes(item.icon) && item.icon !== config.social[i].icon
        })

        if (iconChanged) {
          consola.info('Find new icon, reload server...')
          consola.info(`If you do not want to reload it, write icon name in ${chalk.green('config.unocss.safelist')}.`)
          consola.info('For example: ["i-ri-cloud-line"]')
          console.log()
          reload = true
        }

        if (reload)
          initServer(options, viteConfig)
      },
    })
    await server.listen()
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
