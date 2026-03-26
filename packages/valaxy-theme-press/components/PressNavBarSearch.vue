<script lang="ts" setup>
import type { AlgoliaSearchOptions } from '../types/algolia'
import { onKeyStroke } from '@vueuse/core'
import { useSiteConfig } from 'valaxy'
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import PressNavBarAskAiButton from './PressNavBarAskAiButton.vue'
import PressNavBarSearchButton from './PressNavBarSearchButton.vue'

const siteConfig = useSiteConfig()

const isAlgolia = computed(() => siteConfig.value.search.provider === 'algolia')
const isFuse = computed(() => siteConfig.value.search.provider === 'fuse')

// Whether to show the Ask AI button (requires askAi config in addon-algolia)
const showAskAi = ref(false)

if (isAlgolia.value) {
  import('valaxy-addon-algolia').then(({ useAddonAlgoliaConfig }) => {
    const algoliaConfig = useAddonAlgoliaConfig()
    const askAi = (algoliaConfig.value?.options as AlgoliaSearchOptions | undefined)?.askAi
    showAskAi.value = !!askAi
  }).catch(() => {})
}

const PressAlgoliaSearch = isAlgolia.value
  ? defineAsyncComponent(() => import('./PressAlgoliaSearch.vue'))
  : () => null

const PressFuseSearch = isFuse.value
  ? defineAsyncComponent(() => import('./PressFuseSearch.vue'))
  : () => null

// #region Algolia lazy loading

type OpenTarget = 'search' | 'askAi' | 'toggleAskAi'
interface OpenRequest { target: OpenTarget, nonce: number }
const openRequest = ref<OpenRequest | null>(null)
let openNonce = 0

const loaded = ref(false)
const actuallyLoaded = ref(false)

// Preconnect to Algolia DSN on idle
onMounted(async () => {
  if (!isAlgolia.value)
    return

  const id = 'PressAlgoliaPreconnect'
  if (document.getElementById(id))
    return

  // Dynamically import addon config to get appId for preconnect
  try {
    const { useAddonAlgoliaConfig } = await import('valaxy-addon-algolia')
    const algoliaConfig = useAddonAlgoliaConfig()
    const appId = algoliaConfig.value?.options?.appId

    if (!appId)
      return

    const rIC = window.requestIdleCallback || setTimeout
    rIC(() => {
      const preconnect = document.createElement('link')
      preconnect.id = id
      preconnect.rel = 'preconnect'
      preconnect.href = `https://${appId}-dsn.algolia.net`
      preconnect.crossOrigin = ''
      document.head.appendChild(preconnect)
    })
  }
  catch {
    // valaxy-addon-algolia not installed, skip preconnect
  }
})

// Keyboard shortcuts for Algolia
if (isAlgolia.value) {
  onKeyStroke('k', (event) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      loadAndOpen('search')
    }
  })

  onKeyStroke('i', (event) => {
    if ((event.ctrlKey || event.metaKey) && showAskAi.value) {
      event.preventDefault()
      loadAndOpen('askAi')
    }
  })

  onKeyStroke('/', (event) => {
    if (!isEditingContent(event)) {
      event.preventDefault()
      loadAndOpen('search')
    }
  })
}

function loadAndOpen(target: OpenTarget) {
  if (!loaded.value)
    loaded.value = true

  openRequest.value = { target, nonce: ++openNonce }
}

// #endregion

function isEditingContent(event: KeyboardEvent): boolean {
  const element = event.target as HTMLElement
  const tagName = element.tagName

  return (
    element.isContentEditable
    || tagName === 'INPUT'
    || tagName === 'SELECT'
    || tagName === 'TEXTAREA'
  )
}
</script>

<template>
  <div v-if="siteConfig.search.enable" class="VPNavBarSearch">
    <template v-if="isAlgolia">
      <PressNavBarSearchButton
        aria-keyshortcuts="/ control+k meta+k"
        @click="loadAndOpen('search')"
      />
      <PressNavBarAskAiButton
        v-if="showAskAi"
        aria-keyshortcuts="control+i meta+i"
        @click="actuallyLoaded ? loadAndOpen('toggleAskAi') : loadAndOpen('askAi')"
      />
      <ClientOnly>
        <PressAlgoliaSearch
          v-if="loaded"
          :open-request="openRequest"
          @vue:before-mount="actuallyLoaded = true"
        />
      </ClientOnly>
    </template>
    <template v-else-if="isFuse">
      <PressFuseSearch />
    </template>
  </div>
</template>

<style>
/* stylelint-disable selector-class-pattern */
.VPNavBarSearch {
  display: flex;
  align-items: center;
}

@media (width >= 768px) {
  .VPNavBarSearch {
    gap: 8px;
    flex-grow: 1;
    padding-left: 24px;
  }
}

@media (width >= 960px) {
  .VPNavBarSearch {
    padding-left: 32px;
  }
}
</style>
