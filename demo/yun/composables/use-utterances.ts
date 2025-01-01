import { useAppStore } from 'valaxy'
import { onMounted, ref, watch } from 'vue'

/**
 * @see https://utteranc.es/
 */
export function useUtterances() {
  const app = useAppStore()

  const utterScriptRef = ref<HTMLScriptElement>()
  /**
   * mount utterances
   * @see https://utteranc.es/
   */
  function createUtterancesScript() {
    utterScriptRef.value = document.createElement('script')

    utterScriptRef.value.src = 'https://utteranc.es/client.js'
    utterScriptRef.value.async = true
    utterScriptRef.value.crossOrigin = 'anonymous'

    utterScriptRef.value.setAttribute('repo', 'YunYouJun/valaxy')
    utterScriptRef.value.setAttribute('issue-term', 'pathname')
    utterScriptRef.value.setAttribute('label', 'utterances')

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

  onMounted(() => {
    createUtterancesScript()
  })
}
