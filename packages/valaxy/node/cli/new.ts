import type { Argv } from 'yargs'

export const newPost = (cli: Argv<{}>) => {
  cli.command(
    'new <title>',
    'Draft a new post',
    (args) => {
      args.usage('$0 <title> -p [path] -l [layout]')
        .positional('title', {
          describe: 'The title of the new post',
          required: true,
        })
        .option('path', {
          alias: 'p',
          type: 'string',
          describe: 'the path to generate new post',
          default: 'post',
        })
        .option('layout', {
          alias: 'l',
          type: 'string',
          default: 'post',
        })
        .option('date', {
          alias: 'd',
          type: 'boolean',
          describe: 'Generate post with the current date',
        })
        .strict()
        .help()
    }, async (_args) => {
      // TODO: Implement commands
    })
}
