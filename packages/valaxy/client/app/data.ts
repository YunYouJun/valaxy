import type { Ref } from 'vue'
import type { Router } from 'vue-router'
import type { PageData, Post } from '../../types'
import { computed } from 'vue'

export interface ValaxyData<FM = PageData['frontmatter']> {
  page: Ref<PageData>
  frontmatter: Ref<FM & PageData['frontmatter']>
}

/**
 * init valaxy data
 */
export function initData(router: Router): ValaxyData {
  return {
    page: computed(() => (router.currentRoute.value as unknown as {
      data: PageData
    }).data),
    frontmatter: computed(() => router.currentRoute.value.meta.frontmatter!) as Ref<Post>,
  }
}
