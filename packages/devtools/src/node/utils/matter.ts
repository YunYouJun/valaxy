import { dump, load, YAML11_SCHEMA } from 'js-yaml'

/**
 * DevTools reads and rewrites author frontmatter with the YAML 1.1 safe schema
 * that gray-matter 4 used: dates stay Date values, `yes`/`no` stay booleans,
 * and `<<` merge keys merge. Blog rendering keeps CORE_SCHEMA so dates stay
 * strings (#409).
 */
export const devtoolsMatterOptions = {
  engines: {
    yaml: {
      parse: (source: string) => load(source, { schema: YAML11_SCHEMA }) as object,
      stringify: (data: object) => dump(data, { schema: YAML11_SCHEMA }),
    },
  },
}
