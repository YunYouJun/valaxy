import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Composable for copying raw Markdown content of the current post.
 * Requires `modules.llms.files: true` to have .md files available at build output.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useCopyMarkdown } from 'valaxy'
 * const { copy, copied, loading } = useCopyMarkdown()
 * </script>
 * <template>
 *   <button @click="copy" :disabled="loading">
 *     {{ copied ? 'Copied!' : 'Copy Markdown' }}
 *   </button>
 * </template>
 * ```
 */
export function useCopyMarkdown() {
  const route = useRoute()
  const copied = ref(false)
  const loading = ref(false)

  const mdUrl = computed(() => `${route.path}.md`)

  async function copy() {
    if (loading.value)
      return

    loading.value = true
    try {
      const res = await fetch(mdUrl.value)
      if (!res.ok)
        throw new Error(`Failed to fetch ${mdUrl.value}: ${res.status}`)

      const text = await res.text()
      await navigator.clipboard.writeText(text)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }
    catch (err) {
      console.error('[valaxy] Failed to copy markdown:', err)
    }
    finally {
      loading.value = false
    }
  }

  return { copy, copied, loading, mdUrl }
}
