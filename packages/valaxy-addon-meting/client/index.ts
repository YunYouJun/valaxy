import { useScriptTag } from '@vueuse/core'
import { useHead } from '@unhead/vue'
import { computed, ref, watch } from 'vue'
import { useSiteConfig } from 'valaxy'
import { useRoute } from 'vue-router'
import { useMetingLoadObserver } from './observer'
import { useAddonMeting } from './options'
import { onMetingInit } from './hook'

/**
 * use MetingJS and Aplayer
 * @see https://github.com/MoePlayer/APlayer
 * @see https://github.com/metowolf/MetingJS
 */
export function useMeting() {
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

  // load meting after aplayer
  useScriptTag(`${cdnPrefix.value}aplayer/dist/APlayer.min.js`, () => {
    useScriptTag(`${cdnPrefix.value}meting@2/dist/Meting.min.js`)
  })

  onMetingInit(addonMeting.value)
  useMetingLoadObserver(addonMeting.value)
}

export function useVisible() {
  const route = useRoute()
  const addonMeting = useAddonMeting()
  const visible = ref(true)

  watch(() => route.path, () => {
    visible.value = route.meta.frontmatter?.aplayer ?? addonMeting.value?.global ?? true
  }, { immediate: true })

  return visible
}
