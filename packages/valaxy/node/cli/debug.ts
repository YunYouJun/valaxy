import type { Argv } from 'yargs'
import os from 'node:os'
import process from 'node:process'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import { version } from '../../package.json'

/**
 * @TODO valaxy debug
 */
export function registerDebugCommand(cli: Argv) {
  cli.command('debug', 'Debug your blog', async () => {
    console.log()
    consola.log('  Operating System:', colors.green(os.platform()))
    consola.log('  Node.JS Version:', colors.green(process.version))
    consola.log('  Valaxy Version:', colors.cyan(`v${version}`))
  })
}
