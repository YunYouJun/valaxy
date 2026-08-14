import type { MomentEntry } from '../../../types/moments'

export interface MomentMonthGroup {
  anchor: string
  label: string
  month: number
  moments: MomentEntry[]
  year: number
}

export interface MomentYearGroup {
  months: MomentMonthGroup[]
  year: number
}

export function getMomentMonth(date: string | Date) {
  const value = new Date(date)
  const year = value.getFullYear()
  const month = value.getMonth() + 1
  return {
    anchor: `moments-${year}-${String(month).padStart(2, '0')}`,
    label: String(month).padStart(2, '0'),
    month,
    year,
  }
}

export function partitionPinnedMoments(moments: MomentEntry[]) {
  const pinned: MomentEntry[] = []
  const regular: MomentEntry[] = []

  for (const moment of moments) {
    if (moment.top && moment.top > 0)
      pinned.push(moment)
    else
      regular.push(moment)
  }

  return { pinned, regular }
}

export function getMomentMonthAnchorTargets(moments: MomentEntry[]) {
  const targets = new Map<string, string>()
  const regularMonths = new Set<string>()

  for (const moment of moments) {
    const anchor = getMomentMonth(moment.date).anchor
    const isPinned = Boolean(moment.top && moment.top > 0)

    if (!isPinned && !regularMonths.has(anchor)) {
      targets.set(anchor, moment.path)
      regularMonths.add(anchor)
    }
    else if (isPinned && !targets.has(anchor)) {
      targets.set(anchor, moment.path)
    }
  }

  return targets
}

export function groupMomentsByYear(moments: MomentEntry[]): MomentYearGroup[] {
  const years = new Map<number, Map<number, MomentMonthGroup>>()

  for (const moment of moments) {
    const period = getMomentMonth(moment.date)
    const months = years.get(period.year) ?? new Map<number, MomentMonthGroup>()
    const group = months.get(period.month) ?? { ...period, moments: [] }
    group.moments.push(moment)
    months.set(period.month, group)
    years.set(period.year, months)
  }

  return [...years.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, months]) => ({
      year,
      months: [...months.values()].sort((a, b) => b.month - a.month),
    }))
}
