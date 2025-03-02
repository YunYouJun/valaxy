import type { PostFrontMatter } from 'valaxy/types'
import type { ValaxyData } from '../app/data'
import { isClient } from '@vueuse/core'

import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import { dataSymbol, useSiteConfig } from '../config'

/**
 * Get `route.meta.frontmatter` from your markdown file
 * @example
 * ```md
 * ---
 * title: Hello World
 * ---
 * ```
 *
 * ```ts
 * const fm = useFrontmatter()
 * console.log(fm.value.title)
 *
 * const fm = useFrontmatter<{ custom: string }>()
 * console.log(fm.value.custom)
 * ```
 */
export function useFrontmatter<T extends Record<string, any> = PostFrontMatter>() {
  // inject not in app root
  const route = useRoute()
  const frontmatter = computed(() => {
    return route.meta.frontmatter as Partial<PostFrontMatter & T> || {}
  })
  return frontmatter
}

/**
 * 获取加密文章数据
 */
export function useEncryptedContent() {
  // const value = inject<string>('valaxy:encryptedContent')
  // inject 还没有插入
  const route = useRoute()
  return computed(() => {
    return route.meta.$encryptedContent || ''
  })
}

/**
 * 获取部分加密内容
 */
export function usePartiallyEncryptedContents() {
  // const value = inject<string>('valaxy:partiallyEncryptedContents')
  // inject 还没有插入
  const route = useRoute()
  return computed(() => {
    return route.meta.$partiallyEncryptedContents || []
  })
}

/**
 * encryptedPhotos
 * 获取加密相册数据
 */
export function useEncryptedPhotos() {
  // const value = inject<string>('valaxy:encryptedPhotos')
  // inject 还没有插入
  const route = useRoute()
  return computed(() => {
    return route.meta.$encryptedPhotos || ''
  })
}

/**
 * inject pageData
 */
export function useData(): ValaxyData {
  const data = inject(dataSymbol, {} as any)
  if (!data) {
    throw new Error('Valaxy data not properly injected in app')
  }
  return data
}

/**
 * get full url
 */
export function useFullUrl() {
  const siteConfig = useSiteConfig()
  const route = useRoute()
  const url = computed(() => {
    const siteUrl = siteConfig.value.url.endsWith('/') ? siteConfig.value.url.slice(0, -1) : siteConfig.value.url
    const origin = siteUrl || (isClient && window.location.origin)
    return origin + route.path
  })
  return url
}
