import path from 'path'
import consola from 'consola'
import yargs from 'yargs'
import { version } from '../../package.json'
import { createServer } from '.'

const cli = yargs.scriptName('valaxy')
  .usage('$0 [args]')
  .version(version)
  .showHelpOnFail(false)
  .alias('h', 'help')
  .alias('v', 'version')

cli.command(
  '* [entry]',
  'Start a local server for Valaxy',
  (args) => {
    args.option('open', {
      alias: 'o',
      default: false,
      type: 'boolean',
      describe: 'open in browser',
    })
  },
  async() => {
    const clientFolder = path.resolve(__dirname, '../client')
    try {
      const server = await createServer(clientFolder)
      await server.listen()
      console.log()
      server.printUrls()
    }
    catch (e) {
      consola.error('failed to start server. error:\n')
      console.error(e)
      process.exit(1)
    }
  })

cli.help().parse()
