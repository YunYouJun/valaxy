import yaml, { CORE_SCHEMA } from 'js-yaml'
import type matter from 'gray-matter'
import { EXCERPT_SEPARATOR } from '../../../constants'

type GrayMatterOptions = matter.GrayMatterOption<string, GrayMatterOptions>

export const matterOptions: GrayMatterOptions = {
  excerpt_separator: EXCERPT_SEPARATOR,
  engines: {
    yaml: {
      // Use the CORE_SCHEMA with more basic support to manually handle time (#409)
      parse: (str: string) => yaml.load(str, { schema: CORE_SCHEMA }) as object,
      stringify: (data: any) => yaml.dump(data),
    },
  },
}
