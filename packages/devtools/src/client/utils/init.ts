import type { Router } from 'vue-router'
import { nextTick, onMounted } from 'vue'
import { activePath, devtoolsRouter, frontmatter, pageData } from '../composables/app'
import { getWindowProperty } from './get'

export function initDevtoolsClient() {
  const __VUE_DEVTOOLS_ROUTER__ = getWindowProperty('__VUE_DEVTOOLS_ROUTER__') as Router
  devtoolsRouter.value = __VUE_DEVTOOLS_ROUTER__

  devtoolsRouter.value.beforeEach((to, _from, next) => {
    activePath.value = to.path
    next()
  })

  // init $frontmatter and $pageData
  onMounted(() => {
    frontmatter.value = getWindowProperty('$frontmatter')
    pageData.value = getWindowProperty('$pageData')
  })

  devtoolsRouter.value.afterEach(async () => {
    await nextTick()
    // get target post $frontmatter
    frontmatter.value = getWindowProperty('$frontmatter')
    pageData.value = getWindowProperty('$pageData')
  })
}
