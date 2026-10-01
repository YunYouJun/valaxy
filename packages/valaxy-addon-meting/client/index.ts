import type { Ref } from 'vue'
import { useHead } from '@unhead/vue'
import { useScriptTag } from '@vueuse/core'
import { useFrontmatter, useSiteConfig } from 'valaxy'
import { computed, effectScope, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { onMetingInit } from './hook'
import { useMetingLoadObserver } from './observer'
import { useAddonMeting } from './options'

export { useAddonMeting } from './options'
export { useMetingProps } from './useMetingProps'

let scriptsLoading: Promise<void> | undefined

function loadMetingScripts(cdnPrefix: string) {
  if (!scriptsLoading) {
    // Scripts belong to the page, so their load listeners must survive the
    // component that first requested them, including while loading APlayer.
    const scope = effectScope(true)
    scriptsLoading = scope.run(() => {
      const aplayer = useScriptTag(`${cdnPrefix}aplayer/dist/APlayer.min.js`, undefined, { manual: true })
      const meting = useScriptTag(`${cdnPrefix}meting@2/dist/Meting.min.js`, undefined, { manual: true })
      return aplayer.load().then(() => scope.run(() => meting.load()))
    })!.then(() => {}).finally(() => scope.stop())
  }
  return scriptsLoading
}

/**
 * use MetingJS and Aplayer
 * @see https://github.com/MoePlayer/APlayer
 * @see https://github.com/metowolf/MetingJS
 */
export function useMeting(target?: Readonly<Ref<HTMLElement | null | undefined>>) {
  const siteConfig = useSiteConfig()
  const addonMeting = useAddonMeting()
  const cdnPrefix = computed(() => siteConfig.value.cdn.prefix)

  useHead({
    link: [
      {
        rel: 'stylesheet',
        href: `${cdnPrefix.value}aplayer/dist/APlayer.min.css`,
      },
    ],
  })

  onMounted(() => {
    void loadMetingScripts(cdnPrefix.value)
  })

  onMetingInit(addonMeting.value)
  useMetingLoadObserver(addonMeting.value, target)
}

interface Frontmatter {
  /**
   * use aplayer
   * @url https://aplayer.js.org/
   */
  aplayer?: boolean
}

export function useVisible(defaultVisible?: boolean) {
  const route = useRoute()
  const addonMeting = useAddonMeting()
  const frontmatter = useFrontmatter<Frontmatter>()

  const visible = ref(true)

  watch(() => route.path, () => {
    visible.value = frontmatter.value?.aplayer ?? defaultVisible ?? addonMeting.value?.global ?? true
  }, { immediate: true })

  return visible
}
