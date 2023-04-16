import { TinyColor } from '@ctrl/tinycolor'
import { useTags } from 'valaxy'

/**
 * get utils about tags
 */
export function useYunTags(options: {
  /**
   * Primary Color
   */
  primary: string
} = {
  primary: '#0078E7',
}) {
  const tags = useTags()

  const gray = new TinyColor('#999999')
  const primaryColor = new TinyColor(options.primary)

  const getTagStyle = (count: number) => {
    const counts = Array.from(tags.value).map(([_, value]) => value.count)
    const max = Math.max(...counts)
    const min = Math.min(...counts)
    const range = max - min
    const percent = (count - min) / range
    return {
      '--yun-tag-color': gray.mix(primaryColor, percent * 100).toString(),
      'fontSize': `${percent * 36 + 12}px`,
    }
  }

  return {
    tags,
    getTagStyle,
  }
}
