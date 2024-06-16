import path from 'pathe'
import { slash } from '@antfu/utils'
import type { ResolvedValaxyOptions } from '../../../options'
import { processIncludes } from '../utils'

const includedRE = /<!--\s*@included:\s*(.*?)\s*-->/g

export function createTransformIncludes(options: ResolvedValaxyOptions) {
  const srcDir = options.userRoot

  return (code: string, id: string) => {
    const fileOrig = id
    return processIncludes(srcDir, code, fileOrig)
  }
}

export function resolveTransformIncludes(code: string, id: string) {
  const includes: string[] = []
  const dir = path.dirname(id)
  code = code.replace(includedRE, (m, m1) => {
    const includePath = path.join(dir, m1)
    includes.push(slash(includePath))
    return ''
  })
  return {
    code,
    includes,
  }
}
