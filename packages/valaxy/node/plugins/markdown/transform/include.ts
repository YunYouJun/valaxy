import path from 'pathe'
import fs from 'fs-extra'
import type { ResolvedValaxyOptions } from '../../../options'
import { processIncludes } from '../utils'

const includesRE = /<!--\s*@include:\s*(.*?)\s*-->/g

export function createTransformIncludes(options: ResolvedValaxyOptions) {
  const srcDir = options.userRoot

  return (code: string, id: string) => {
    const fileOrig = id
    // resolve includes
    const includes: string[] = []
    const dir = path.dirname(id)

    code = processIncludes(srcDir, code, fileOrig, includes)
    code = code.replace(includesRE, (m, m1) => {
      try {
        const includePath = path.join(dir, m1)
        const content = fs.readFileSync(includePath, 'utf-8')
        includes.push(includePath)
        return content
      }
      catch (error) {
        return m // silently ignore error if file is not present
      }
    })

    return {
      code,
      includes,
    }
  }
}
