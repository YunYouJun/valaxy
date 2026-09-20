export interface ApiIndexGroup {
  module?: string
  title: string
  items: { text: string, link: string }[]
}

/** Match group names as well as symbol names without changing link destinations. */
export function filterApiGroups(groups: ApiIndexGroup[], query: string, module?: string): ApiIndexGroup[] {
  const normalize = (value: string) => value.toLocaleLowerCase().replace(/[-_]/g, ' ')
  const words = normalize(query).trim().split(/\s+/).filter(Boolean)
  return groups.filter(group => !module || group.module === module).map(group => ({
    ...group,
    items: group.items.filter(item => words.every(word => normalize(`${group.module || ''} ${group.title} ${item.text}`).includes(word))),
  })).filter(group => group.items.length)
}
