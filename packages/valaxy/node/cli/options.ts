import type { Argv } from 'yargs'

/**
 * set common options for cli
 * @param args
 */
export function commonOptions(args: Argv<object>) {
  return args.positional('root', {
    default: '.',
    type: 'string',
    describe: 'root folder of your source files',
  })
}
