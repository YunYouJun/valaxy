import { isClient, useClipboard } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteConfig } from '../../config'

/**
 * Composable for copying raw Markdown content of the current post.
 * Requires `siteConfig.llms.enable: true` and `siteConfig.llms.files: true` to have .md files available at build output.
 *
 * The `available` ref is initially `false` and becomes `true` after a HEAD request
 * confirms the `.md` file exists. This allows themes to conditionally render
 * the copy button only when the llms feature is enabled.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useCopyMarkdown } from 'valaxy'
 * const { copy, copied, loading, available, error } = useCopyMarkdown()
 * </script>
 * <template>
 *   <button v-if="available" @click="copy" :disabled="loading">
 *     {{ copied ? 'Copied!' : 'Copy Markdown' }}
 *   </button>
 *   <span v-if="error" class="text-red">{{ error }}</span>
 * </template>
 * ```
 */
export function useCopyMarkdown() {
  const route = useRoute()
  const siteConfig = useSiteConfig()
  const copied = ref(false)
  const loading = ref(false)
  const available = ref(false)
  const error = ref<string | null>(null)
  const { copy: copyToClipboard } = useClipboard({ legacy: true })

  const mdUrl = computed(() => {
    const p = route.path !== '/' && route.path.endsWith('/')
      ? route.path.slice(0, -1)
      : route.path
    return `${p}.md`
  })

  // Only probe when raw Markdown output is enabled.
  if (isClient) {
    watchEffect((onCleanup) => {
      available.value = false
      error.value = null
      if (!siteConfig.value.llms.enable || !siteConfig.value.llms.files)
        return

      const controller = new AbortController()
      onCleanup(() => controller.abort())

      fetch(mdUrl.value, { method: 'HEAD', signal: controller.signal })
        .then((res) => {
          if (!controller.signal.aborted)
            available.value = res.ok
        })
        .catch(() => {
          if (!controller.signal.aborted)
            available.value = false
        })
    })
  }

  async function copy() {
    if (loading.value)
      return

    error.value = null
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
      const msg = err instanceof Error ? err.message : 'Unknown error'
      error.value = msg
      console.error('[valaxy] Failed to copy markdown:', err)
      setTimeout(() => {
        error.value = null
      }, 3000)
    }
    finally {
      loading.value = false
    }
  }

  return { copy, copied, loading, mdUrl, available, error }
}
