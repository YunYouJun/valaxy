import { useAppStore } from 'valaxy'
import { nextTick, onMounted, ref, watch } from 'vue'
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
  const app = useAppStore()
  const route = useRoute()

  const utterScriptRef = ref<HTMLScriptElement>()
  /**
   * mount utterances
   * @see https://utteranc.es/
   */
  function createUtterancesScript() {
    if (utterScriptRef.value) {
      utterScriptRef.value.remove()
    }

    utterScriptRef.value = document.createElement('script')

    utterScriptRef.value.src = utterancesClientSrc
    utterScriptRef.value.async = true
    utterScriptRef.value.crossOrigin = 'anonymous'

    utterScriptRef.value.setAttribute('repo', options.repo)
    utterScriptRef.value.setAttribute('issue-term', options.issueTerm)
    utterScriptRef.value.setAttribute('label', options.label)

    utterScriptRef.value.setAttribute('theme', app.isDark ? 'github-dark' : 'github-light')

    const commentContainer = document.querySelector('.comment')

    if (commentContainer) {
      // 如果旧元素存在，移除旧元素
      const utterancesContainer = commentContainer.querySelector('.utterances')
      if (utterancesContainer)
        commentContainer.removeChild(utterancesContainer)

      commentContainer.appendChild(utterScriptRef.value)
    }
  }

  // watch dark mode for theme
  watch(() => app.isDark, () => {
    createUtterancesScript()
  })

  watch(
    () => route.path,
    () => {
      nextTick(() => {
        createUtterancesScript()
      })
    },
  )

  onMounted(() => {
    createUtterancesScript()
  })
}
