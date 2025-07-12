export interface FuseListItem extends Record<string, any> {
  title: string | Record<string, string>
  excerpt?: string
  author: string
  tags: string[]
  categories: string[]
  link: string
  content?: string
}
