import type { Ref } from 'vue'
import type { Router } from 'vue-router'
import type { PageData } from '../../types'
import { computed } from 'vue'

export interface ValaxyData {
  page: Ref<PageData>
}

/**
 * init valaxy data
 */
export function initData(router: Router): ValaxyData {
  return {
    page: computed(() => (router.currentRoute.value as unknown as {
      data: PageData
    }).data),
  }
}
