import { isClient } from '@vueuse/core'
import { onContentUpdated, useAppStore } from 'valaxy'
import { nextTick, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'

const utterancesClientSrc = 'https://utteranc.es/client.js'

/**
 * @see https://utteranc.es/
 */
export function useUtterances(options: {
  repo: string
  issueTerm: 'pathname' | 'title'
  label: string
}) {
  // Guard: only run on client side
  if (!isClient) {
    return
  }

  const app = useAppStore()
  const route = useRoute()

  let script: HTMLScriptElement | undefined
  let mountedContainer: Element | null = null
  let mountedKey = ''
  let contentPath: string | undefined
  let disposed = false

  function cleanup() {
    script?.remove()
    mountedContainer?.querySelector('.utterances')?.remove()
    script = undefined
    mountedContainer = null
    mountedKey = ''
  }

  /**
   * mount utterances
   * @see https://utteranc.es/
   */
  function createUtterancesScript() {
    if (disposed || contentPath !== route.path)
      return
    const commentContainer = document.querySelector('.comment')
    const key = `${route.path}:${app.isDark}`
    // Content updates (for example a language change) must not reload the same iframe.
    if (commentContainer === mountedContainer && key === mountedKey)
      return

    cleanup()
    if (!commentContainer)
      return

    script = document.createElement('script')
    script.src = utterancesClientSrc
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('repo', options.repo)
    script.setAttribute('issue-term', options.issueTerm)
    script.setAttribute('label', options.label)
    script.setAttribute('theme', app.isDark ? 'github-dark' : 'github-light')
    commentContainer.appendChild(script)
    mountedContainer = commentContainer
    mountedKey = key
  }

  function scheduleMount() {
    nextTick(createUtterancesScript)
  }

  // UserApp can mount before the async route hydrates. Wait for its Markdown
  // content, then finish that render before inserting third-party DOM.
  onContentUpdated(() => {
    contentPath = route.path
    scheduleMount()
  })

  watch(() => app.isDark, scheduleMount, { flush: 'post' })
  watch(() => route.path, () => {
    contentPath = undefined
    cleanup()
  })

  onBeforeUnmount(() => {
    disposed = true
    cleanup()
  })
}
