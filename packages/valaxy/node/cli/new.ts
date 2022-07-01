import consola from 'consola'
import { magenta } from 'chalk'
import type { Argv } from 'yargs'
import { type CreatePostParams, create } from './utils/post'

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
          describe: 'Generate post with the current date',
        })
        .strict()
        .help()
    }, async ({ title, path, date, layout }) => {
      const filename = await create({
        title,
        date,
        layout,
        path,
      } as CreatePostParams)
      consola.success(`[valaxy new]: successfully generated file ${magenta(filename)}}`)
    })
}
