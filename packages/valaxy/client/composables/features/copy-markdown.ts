import { isClient, useClipboard } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Composable for copying raw Markdown content of the current post.
 * Requires `siteConfig.llms.files: true` to have .md files available at build output.
 *
 * The `available` ref is initially `false` and becomes `true` after a HEAD request
 * confirms the `.md` file exists. This allows themes to conditionally render
 * the copy button only when the llms feature is enabled.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useCopyMarkdown } from 'valaxy'
 * const { copy, copied, loading, available } = useCopyMarkdown()
 * </script>
 * <template>
 *   <button v-if="available" @click="copy" :disabled="loading">
 *     {{ copied ? 'Copied!' : 'Copy Markdown' }}
 *   </button>
 * </template>
 * ```
 */
export function useCopyMarkdown() {
  const route = useRoute()
  const copied = ref(false)
  const loading = ref(false)
  const available = ref(false)
  const { copy: copyToClipboard } = useClipboard({ legacy: true })

  const mdUrl = computed(() => {
    const p = route.path !== '/' && route.path.endsWith('/')
      ? route.path.slice(0, -1)
      : route.path
    return `${p}.md`
  })

  // Probe the .md file to detect availability (siteConfig.llms.files enabled at build time)
  if (isClient) {
    watchEffect(() => {
      available.value = false
      fetch(mdUrl.value, { method: 'HEAD' })
        .then((res) => { available.value = res.ok })
        .catch(() => { available.value = false })
    })
  }

  async function copy() {
    if (loading.value)
      return

    loading.value = true
    try {
      const res = await fetch(mdUrl.value)
      if (!res.ok)
        throw new Error(`Failed to fetch ${mdUrl.value}: ${res.status}`)

      const text = await res.text()
      await copyToClipboard(text)
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

  return { copy, copied, loading, mdUrl, available }
}
