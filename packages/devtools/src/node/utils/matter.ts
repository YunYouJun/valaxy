import { CORE_SCHEMA, dump, load } from 'js-yaml'

/**
 * Match blog rendering's YAML 1.2 core schema: dates and yes/no stay strings,
 * and << is a literal key rather than a merge operation.
 */
export const devtoolsMatterOptions = {
  engines: {
    yaml: {
      parse: (source: string) => load(source, { schema: CORE_SCHEMA }) as object,
      stringify: (data: object) => dump(data, { schema: CORE_SCHEMA }),
    },
  },
}
