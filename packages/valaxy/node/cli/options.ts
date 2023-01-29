import type { Argv } from 'yargs'

/**
 * set common options for cli
 * @param args
 * @returns
 */
export function commonOptions(args: Argv<{}>) {
  return args.positional('root', {
    default: '.',
    type: 'string',
    describe: 'root folder of your source files',
  })
}
