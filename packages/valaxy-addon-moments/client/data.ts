import type { MomentEntry, MomentFrontmatter, MomentImage, MomentRouteInput } from '../types'
import { getMomentPinPriority, getMomentTimestamp, isMomentDateValid } from './time'

const MAX_MOMENT_IMAGES = 9

function optionalPositiveNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : undefined
}

export function normalizeMomentImages(images: unknown): MomentImage[] {
  if (!Array.isArray(images))
    return []

  return images.flatMap((image: unknown) => {
    if (typeof image === 'string') {
      const src = image.trim()
      return src ? [{ src }] : []
    }

    if (!image || typeof image !== 'object')
      return []

    const record = image as Record<string, unknown>
    const src = typeof record.src === 'string' ? record.src.trim() : ''
    if (!src)
      return []

    const normalized: MomentImage = { src }
    if (typeof record.alt === 'string' && record.alt.trim())
      normalized.alt = record.alt.trim()
    normalized.width = optionalPositiveNumber(record.width)
    normalized.height = optionalPositiveNumber(record.height)
    return [normalized]
  }).slice(0, MAX_MOMENT_IMAGES)
}

function isHiddenFromTimeline(frontmatter: Partial<MomentFrontmatter>, isDev: boolean) {
  return !isDev && (frontmatter.draft === true || Boolean(frontmatter.hide))
}

export function normalizeMomentRoutes(
  routes: MomentRouteInput[],
  options: { isDev?: boolean, timezone?: string } = {},
): MomentEntry[] {
  const isDev = options.isDev ?? false

  return routes.flatMap((route) => {
    const frontmatter = route.meta?.frontmatter
    const content = route.meta?.momentContent

    if (
      route.path === '/moments/'
      || route.path === '/moments'
      || !route.path.startsWith('/moments/')
      || route.aliasOf
      || !isMomentDateValid(frontmatter?.date, options.timezone)
      || typeof content !== 'string'
      || isHiddenFromTimeline(frontmatter, isDev)
    ) {
      return []
    }

    return [{
      ...frontmatter,
      content,
      date: frontmatter.date,
      images: normalizeMomentImages(frontmatter.images),
      path: route.path,
    } as MomentEntry]
  }).sort((a, b) => {
    const topDifference = getMomentPinPriority(b) - getMomentPinPriority(a)
    if (topDifference)
      return topDifference

    const dateDifference = getMomentTimestamp(b.date, options.timezone) - getMomentTimestamp(a.date, options.timezone)
    return dateDifference || a.path.localeCompare(b.path)
  })
}
