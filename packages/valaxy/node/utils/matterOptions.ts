import yaml from 'js-yaml'
import { EXCERPT_SEPARATOR } from '../constants'

const engines = {
  yaml: {
    parse: (str: string) => yaml.load(str, { schema: yaml.CORE_SCHEMA }) as object,
    stringify: (data: any) => yaml.dump(data),
  },
}

export const matterOptions = {
  excerpt_separator: EXCERPT_SEPARATOR,
  engines,
}
