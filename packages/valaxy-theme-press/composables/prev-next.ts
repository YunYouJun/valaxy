import type { CategoryList, Post } from 'valaxy'
import type { PressTheme } from '../types'
import { isCategoryList, removeItemFromCategory, useFrontmatter, usePageList } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLocaleConfig } from './locale'
import { normalize } from './sidebar'

export interface DocFooterLink {
  text: string
  link: string
}

/**
 * Build a category tree from pages (same logic as PressSidebar.vue).
 */
function buildCategoryTree(pages: Post[]): CategoryList {
  const categoryList: CategoryList = {
    name: 'All',
    total: pages.length,
    children: new Map([
      ['Uncategorized', { name: 'Uncategorized', total: 0, children: new Map() }],
    ]),
  }

  const uncategorized = categoryList.children.get('Uncategorized')! as CategoryList

  pages.forEach((post: Post) => {
    if (post.categories) {
      if (Array.isArray(post.categories)) {
        const len = post.categories.length
        let curCategoryList: CategoryList = categoryList
        let parentCategory: CategoryList = curCategoryList

        post.categories.forEach((categoryName, i) => {
          curCategoryList.total += 1
          curCategoryList = curCategoryList.children.get(categoryName) as CategoryList

          if (!curCategoryList) {
            curCategoryList = { name: categoryName, total: 0, children: new Map() }
            parentCategory.children.set(categoryName, curCategoryList)
          }

          if (i === len - 1) {
            curCategoryList.children.set(post.path!, post)
            curCategoryList.total += 1
          }

          parentCategory = curCategoryList
        })
      }
      else {
        const categoryName = post.categories as string
        const curCategory = categoryList.children.get(categoryName) as CategoryList | undefined
        if (curCategory) {
          curCategory.total += 1
          curCategory.children.set(post.path!, post)
        }
        else {
          categoryList.children.set(categoryName, {
            name: categoryName,
            total: 1,
            children: new Map([[post.path!, post]]),
          })
        }
      }
    }
    else {
      uncategorized.total += 1
      uncategorized.children.set(post.path!, post)
    }
  })

  if (uncategorized.total === 0)
    categoryList.children.delete('Uncategorized')

  removeItemFromCategory(categoryList, 'Uncategorized')
  return categoryList
}

/**
 * Extract flat links from a category by name.
 */
function getCategoryLinks(categoryTree: CategoryList, categoryName: string): FlatLink[] {
  const category = categoryTree.children.get(categoryName)
  if (!category || !isCategoryList(category))
    return []

  const links: FlatLink[] = []
  function extract(cat: CategoryList) {
    cat.children.forEach((child) => {
      if (isCategoryList(child)) {
        extract(child)
      }
      else {
        // It's a Post
        const post = child as Post
        if (post.path && post.title) {
          links.push({
            text: typeof post.title === 'string' ? post.title : (post.title as any)?.en || String(post.title),
            link: post.path,
          })
        }
      }
    })
  }
  extract(category)
  return links
}

/**
 * Resolve sidebar items for the current route path from the theme config.
 */
function getSidebarItems(
  sidebar: PressTheme.Sidebar | undefined,
  path: string,
): PressTheme.SidebarItem[] {
  if (!sidebar)
    return []

  if (Array.isArray(sidebar)) {
    // Sidebar arrays may contain strings (category names) — filter to objects only
    const items = sidebar.filter((item): item is PressTheme.SidebarItem => typeof item !== 'string')
    return addBase(items)
  }

  // SidebarMulti: find the longest matching prefix
  path = ensureStartingSlash(path)
  const dir = Object.keys(sidebar)
    .sort((a, b) => b.split('/').length - a.split('/').length)
    .find(dir => path.startsWith(ensureStartingSlash(dir)))

  if (!dir)
    return []

  const matched = sidebar[dir]
  if (Array.isArray(matched)) {
    const items = matched.filter((item): item is PressTheme.SidebarItem => typeof item !== 'string')
    return addBase(items)
  }

  return addBase(matched.items, matched.base)
}

function ensureStartingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * Join base and link with exactly one `/` separator.
 */
function joinPath(base: string, link: string): string {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const normalizedLink = link.startsWith('/') ? link : `/${link}`
  return normalizedBase + normalizedLink
}

function addBase(items: PressTheme.SidebarItem[], base?: string): PressTheme.SidebarItem[] {
  return items.map((item) => {
    const result = { ...item }
    const itemBase = result.base || base
    if (itemBase && result.link)
      result.link = joinPath(itemBase, result.link)
    if (result.items)
      result.items = addBase(result.items, itemBase)
    return result
  })
}

interface FlatLink {
  text: string
  link: string
  docFooterText?: string
}

/**
 * Recursively flatten sidebar items into a flat list of links.
 */
function getFlatLinks(items: PressTheme.SidebarItem[]): FlatLink[] {
  const links: FlatLink[] = []

  function extract(items: PressTheme.SidebarItem[]) {
    for (const item of items) {
      if (item.text && item.link) {
        links.push({
          text: item.text,
          link: item.link,
          docFooterText: item.docFooterText,
        })
      }
      if (item.items)
        extract(item.items)
    }
  }

  extract(items)
  return links
}

/**
 * Composable to compute previous and next page links
 * based on the sidebar configuration, similar to VitePress.
 *
 * Handles both string category items (expanded from page categories)
 * and object sidebar items (static link trees).
 */
export function usePrevNext() {
  const route = useRoute()
  const frontmatter = useFrontmatter()
  const { localeConfig, currentLocaleKey, hasLocales, currentLocale } = useLocaleConfig()
  const pages = usePageList()

  /**
   * Filter pages by current locale prefix (same logic as PressSidebar.vue).
   */
  const localePages = computed(() => {
    if (!hasLocales.value)
      return pages.value

    if (currentLocaleKey.value === 'root') {
      const locales = localeConfig.value.locales
      const prefixes = locales
        ? Object.keys(locales)
            .filter(k => k !== 'root')
            .map(k => locales[k].link || `/${k}/`)
        : []
      return pages.value.filter(p => p.path && !prefixes.some(prefix => p.path!.startsWith(prefix)))
    }

    const prefix = currentLocale.value.link
    return pages.value.filter(p => p.path?.startsWith(prefix))
  })

  return computed(() => {
    const sidebar = localeConfig.value.sidebar
    let candidates: FlatLink[]

    if (Array.isArray(sidebar)) {
      // Build category tree from locale-filtered pages
      const categoryTree = buildCategoryTree(localePages.value)

      // Walk sidebar items in order, expanding string categories into page links
      candidates = []
      for (const item of sidebar) {
        if (typeof item === 'string') {
          // Expand category name into its page links
          candidates.push(...getCategoryLinks(categoryTree, item))
        }
        else {
          // Object sidebar item — flatten as before
          candidates.push(...getFlatLinks(addBase([item])))
        }
      }
    }
    else {
      // SidebarMulti — only object items, use original logic
      candidates = getFlatLinks(getSidebarItems(sidebar, route.path))
    }

    const index = candidates.findIndex(link =>
      normalize(link.link) === normalize(route.path),
    )

    let prev: DocFooterLink | undefined
    let next: DocFooterLink | undefined

    if (index > 0) {
      const link = candidates[index - 1]
      prev = {
        text: link.docFooterText || link.text,
        link: link.link,
      }
    }

    if (index !== -1 && index < candidates.length - 1) {
      const link = candidates[index + 1]
      next = {
        text: link.docFooterText || link.text,
        link: link.link,
      }
    }

    // Allow frontmatter to disable navigation
    if (frontmatter.value.nav === false) {
      prev = undefined
      next = undefined
    }

    return { prev, next }
  })
}
