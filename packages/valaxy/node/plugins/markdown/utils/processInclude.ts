/**
 * @file Utility function to process includes in markdown files
 * @description ref vitepress/packages/vitepress/src/node/markdown/utils/processInclude.ts
 */

import path from 'node:path'
import fs from 'fs-extra'

export function processIncludes(
  srcDir: string,
  src: string,
  file: string,
): string {
  const includesRE = /<!--\s*@include:\s*(.*?)\s*-->/g
  const rangeRE = /\{(\d*),(\d*)\}$/
  return src.replace(includesRE, (m: string, m1: string) => {
    if (!m1.length)
      return m

    const range = m1.match(rangeRE)
    range && (m1 = m1.slice(0, -range[0].length))
    const atPresent = m1[0] === '@'
    try {
      const includePath = atPresent
        ? path.join(srcDir, m1.slice(m1[1] === '/' ? 2 : 1))
        : path.join(path.dirname(file), m1)
      let content = fs.readFileSync(includePath, 'utf-8')
      if (range) {
        const [, startLine, endLine] = range
        const lines = content.split(/\r?\n/)
        content = lines
          .slice(
            startLine ? Number.parseInt(startLine, 10) - 1 : undefined,
            endLine ? Number.parseInt(endLine, 10) : undefined,
          )
          .join('\n')
      }
      content = `<!-- @included: ${m1} -->\n${content}`
      // recursively process includes in the content
      return processIncludes(srcDir, content, includePath)
    }
    catch (error) {
      return m // silently ignore error if file is not present
    }
  })
}
