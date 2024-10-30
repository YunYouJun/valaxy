import process from 'node:process'
import yargs from 'yargs'

import { hideBin } from 'yargs/helpers'
import { version } from '../../package.json'

// modules
import type { ValaxyModule } from '../modules'
import { rssModule } from '../modules/rss'
import { fuseModule } from '../modules/fuse'

// commands
import { registerNewCommand } from './new'
import { registerBuildCommand } from './build'
import { registerDevCommand } from './dev'
import { registerCleanCommand } from './clean'
import { registerDeployCommand } from './deploy'
import { registerDebugCommand } from './debug'

export const cli = yargs(hideBin(process.argv)).scriptName('valaxy')
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
