// modules
import type { ValaxyModule } from '../modules'
import process from 'node:process'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

// type:json
import { version } from '../env'
import { fuseModule } from '../modules/fuse'
import { rssModule } from '../modules/rss'

import { registerBuildCommand } from './build'
import { registerCleanCommand } from './clean'
import { registerDebugCommand } from './debug'
import { registerDeployCommand } from './deploy'
import { registerDevCommand } from './dev'
// commands
import { registerNewCommand } from './new'

export * from './dev'
export const cli = yargs(hideBin(process.argv))
  .scriptName('valaxy')
  .usage('$0 [args]')
  .version(version)
  .showHelpOnFail(false)
  .alias('h', 'help')
  .alias('v', 'version')

registerDevCommand(cli)
registerBuildCommand(cli)
registerNewCommand(cli)
registerCleanCommand(cli)
registerDeployCommand(cli)
registerDebugCommand(cli)
cli.help()

const modules: ValaxyModule[] = [
  fuseModule,
  rssModule,
]

modules.forEach((module) => {
  module.extendCli?.(cli)
})

export function run() {
  cli.parse()
}
