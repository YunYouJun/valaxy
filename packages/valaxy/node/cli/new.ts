import type { Argv } from 'yargs'
import { type CreatePostParams, create } from './utils/post'

/**
 * register new post command
 * @param cli
 */
export function registerNewCommand(cli: Argv<object>) {
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
          describe: 'the path to generate new post. Customize the path of post to generate',
        })
        .option('layout', {
          alias: 'l',
          type: 'string',
          default: 'post',
        })
        .option('date', {
          alias: 'd',
          type: 'boolean',
          default: true,
          describe: 'Generate post with the current date',
        })
        .strict()
        .help()
    }, async ({ title, path, date, layout }) => {
      await create({
        title,
        date,
        layout,
        path,
      } as CreatePostParams)
    })
}
