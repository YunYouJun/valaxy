import { range, uniq } from '@antfu/utils'

/**
 * 1,3-5,8 => [1, 3, 4, 5, 8]
 */
export function parseRangeString(total: number, rangeStr?: string) {
  if (!rangeStr || rangeStr === 'all' || rangeStr === '*')
    return range(1, total + 1)

  const pages: number[] = []
  for (const part of rangeStr.split(/[,;]/g)) {
    if (!part.includes('-')) {
      pages.push(+part)
    }
    else {
      const [start, end] = part.split('-', 2)
      pages.push(
        ...range(+start, !end ? (total + 1) : (+end + 1)),
      )
    }
  }

  return uniq(pages).filter(i => i <= total).sort((a, b) => a - b)
}
