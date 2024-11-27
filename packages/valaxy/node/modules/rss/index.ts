import { defineValaxyModule } from '..'
import { commonOptions } from '../../cli/options'
import { resolveOptions } from '../../options'
import { setEnvProd } from '../../utils/env'
import { build } from './utils'

export const rssModule = defineValaxyModule({
  /**
   * valaxy rss
   * @param cli
   */
  extendCli(cli) {
    cli.command(
      'rss [root]',
      'generate rss feed',
      args => commonOptions(args)
        .strict()
        .help(),
      async ({ root }) => {
        setEnvProd()
        const options = await resolveOptions({ userRoot: root }, 'build')
        await build(options)
      },
    )
  },

  setup(node) {
    node.hook('build:after', async () => {
      // eslint-disable-next-line no-console
      console.log()
      await build(node.options)
    })
  },
})
