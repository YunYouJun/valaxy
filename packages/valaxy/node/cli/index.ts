import process from 'node:process'
import yargs from 'yargs'

import { hideBin } from 'yargs/helpers'
import { version } from '../../package.json'

// build

// rss
import { rssModule } from '../modules/rss'
import type { ValaxyModule } from '../modules'
import { fuseModule } from './fuse'
import { registerNewCommand } from './new'

import { registerBuildCommand } from './build'
import { registerDevCommand } from './dev'

export const cli = yargs(hideBin(process.argv)).scriptName('valaxy')
  .usage('$0 [args]')
  .version(version)
  .showHelpOnFail(false)
  .alias('h', 'help')
  .alias('v', 'version')

registerDevCommand(cli)
registerBuildCommand(cli)
registerNewCommand(cli)

const modules: ValaxyModule[] = [
  rssModule,
  fuseModule,
]

modules.forEach((module) => {
  module.extendCli?.(cli)
})

export function run() {
  cli.help().parse()
}
