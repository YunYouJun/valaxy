/** Stable identity colors; status colors are explicit and independent of the brand. */
const hues = [250, 290, 165, 335, 65, 205]
export function identityColor(value: string) {
  let hash = 0
  for (const char of value)
    hash = (Math.imul(hash, 31) + char.codePointAt(0)!) >>> 0
  return { '--vd-hue': hues[hash % hues.length] }
}
