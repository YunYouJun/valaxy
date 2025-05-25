import type { Router } from 'vue-router'
import { nextTick } from 'vue'
import { activePath, devtoolsRouter, frontmatter, pageData } from '../composables/app'
import { clientPageData } from '../stores/app'
import { getWindowProperty } from './get'

/**
 * run in onMounted
 */
export function initDevtoolsClient() {
  const __VUE_DEVTOOLS_ROUTER__ = getWindowProperty('__VUE_DEVTOOLS_ROUTER__') as Router
  devtoolsRouter.value = __VUE_DEVTOOLS_ROUTER__

  devtoolsRouter.value?.beforeEach?.((to, _from, next) => {
    activePath.value = to.path
    next()
  })

  devtoolsRouter.value.afterEach?.(async () => {
    await nextTick()
    // get target post $frontmatter
    frontmatter.value = getWindowProperty('$frontmatter')
    pageData.value = getWindowProperty('$pageData')
  })

  // init $frontmatter and $pageData
  frontmatter.value = getWindowProperty('$frontmatter')
  pageData.value = getWindowProperty('$pageData')
  activePath.value = devtoolsRouter.value?.currentRoute.value.path || ''
  clientPageData.value = {
    frontmatter: frontmatter.value || {},
    filePath: pageData.value?.filePath || '',
    routePath: devtoolsRouter.value?.currentRoute.value.path || '',
  }
}
