import crc from 'crc'

export function getAbbrlinkHash(str: string): string {
  const hash = crc.crc32(str)
  const hex = hash.toString(16).padStart(8, '0')
  return hex
}
