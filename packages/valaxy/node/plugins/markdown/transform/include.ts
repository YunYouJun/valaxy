import type { ResolvedValaxyOptions } from '../../../options'
import { slash } from '@antfu/utils'
import path from 'pathe'
import { processIncludes } from '../utils'

const includedRE = /<!--\s*@included:\s*(.*?)\s*-->/g

export function createTransformIncludes(options: ResolvedValaxyOptions) {
  const srcDir = options.userRoot

  return (code: string, id: string) => {
    const fileOrig = id
    return processIncludes(srcDir, code, fileOrig)
  }
}

export function resolveTransformIncludes(code: string, id: string, options: ResolvedValaxyOptions) {
  const includes: string[] = []
  const dir = path.dirname(id)
  code = code.replace(includedRE, (m, m1) => {
    const atPresent = m1.startsWith('@')
    const includePath = atPresent
      ? path.resolve(options.userRoot, m1.slice(m1[1] === '/' ? 2 : 1))
      : path.join(dir, m1)
    includes.push(slash(includePath))
    return ''
  })
  return {
    code,
    includes,
  }
}
