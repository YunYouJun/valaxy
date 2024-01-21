/* eslint-disable no-console */
import * as readline from 'node:readline'
import path from 'node:path'
import os from 'node:os'
import process from 'node:process'

import { blue, bold, cyan, dim, gray, green, underline, yellow } from 'picocolors'
import consola from 'consola'
import type { InlineConfig, ViteDevServer } from 'vite'
import { mergeConfig } from 'vite'
import { version } from 'valaxy/package.json'
import { createServer } from '../../server'
import type { ResolvedValaxyOptions } from '../../options'
import { mergeViteConfigs } from '../../common'
import { vLogger } from '../../logger'

let server: ViteDevServer | undefined

export function printInfo(options: ResolvedValaxyOptions, port?: number, remote?: string | boolean) {
  console.log()
  console.log(`  ${bold('🌌 Valaxy')}  ${blue(`v${version}`)}`)
  console.log()
  console.log(`${dim('  🪐 theme  ')} > ${(options.theme ? green(options.theme) : gray('none'))}`)
  console.log(`  ${dim('📁')} ${dim(path.resolve(options.userRoot))}`)
  if (port) {
    console.log()
    console.log(`${dim('  Preview   ')} > ${cyan(`http://localhost:${bold(port)}/`)}`)

    if (remote) {
      Object.values(os.networkInterfaces())
        .forEach(v =>
          (v || [])
            .filter(details => details.family === 'IPv4' && !details.address.includes('127.0.0.1'))
            .forEach(({ address }) => {
              console.log(`${dim('  Network   ')} > ${blue(`http://${address}:${bold(port)}/`)}`)
            }),
        )
    }

    console.log()
    const restart = `${underline('r')}${dim('estart')}`
    const edit = `${underline('e')}${dim('dit')}`
    const open = `${underline('o')}${dim('pen')}`
    const qr = `${underline('q')}${dim('r')}`
    const divider = `${dim(' | ')}`
    console.log(`${dim('  shortcuts ')} > ${restart}${divider}${open}${divider}${qr}${divider}${edit}`)
  }
  console.log()
}

// const CONFIG_RESTART_FIELDS: ValaxyConfigExtendKey[] = [
//   'vite',
//   'vue',
//   'unocss',
//   'unocssPresets',
//   'markdown',
//   'extendMd',
// ]

export async function initServer(options: ResolvedValaxyOptions, viteConfig: InlineConfig) {
  if (server) {
    vLogger.info('close server...')
    await server.close()
  }

  const viteConfigs: InlineConfig = mergeConfig(
    await mergeViteConfigs(options, 'serve'),
    viteConfig,
  )

  try {
    server = await createServer(options, viteConfigs, {
      async onConfigReload(newConfig, config, force = false) {
        if (force) {
          vLogger.info(`${yellow('force')} reload the server`)
          initServer(options, viteConfig)
        }

        let reload = false

        if (newConfig.theme !== config.theme)
          reload = true

        // consola.info('Find new icon, reload server...')
        // consola.info(`If you do not want to reload, write icon name in ${yellow('vite.config.ts')} ${green('valaxy.unocss.safelist')}.`)
        // console.log()
        // reload = true

        // if (CONFIG_RESTART_FIELDS.some(i => !equal(newConfig[i], config[i]))) {
        //   reload = true
        //   console.log(yellow('\n  restarting on config change\n'))
        // }

        if (reload)
          initServer(options, viteConfig)
      },
    })
    await server.listen()
    // consola.success(, 'server ready')
    vLogger.ready('server ready')
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
export function bindShortcut(SHORTCUTS: { name: string, fullName: string, action: () => void }[]) {
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
