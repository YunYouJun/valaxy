<script setup lang="ts">
import type { DocSearchInstance, DocSearchProps } from '@docsearch/js'
import type { SidepanelInstance, SidepanelProps } from '@docsearch/sidepanel-js'
import type { AlgoliaSearchOptions } from '../types/algolia'
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import '../styles/docsearch.css'

const props = defineProps<{
  openRequest?: {
    target: 'search' | 'askAi' | 'toggleAskAi'
    nonce: number
  } | null
}>()

const router = useRouter()

// Dynamically import addon to avoid hard dependency
const algoliaConfig = ref<{ options?: AlgoliaSearchOptions }>()
import('valaxy-addon-algolia').then(({ useAddonAlgoliaConfig }) => {
  // Direct assignment — the synchronous watcher below will react to this change
  algoliaConfig.value = useAddonAlgoliaConfig().value
}).catch(() => {
  console.warn('[valaxy-theme-press] valaxy-addon-algolia is not installed. Algolia search will not work.')
})

let cleanup = () => {}
let docsearchInstance: DocSearchInstance | undefined
let sidepanelInstance: SidepanelInstance | undefined
let openOnReady: 'search' | 'askAi' | null = null
let initializeCount = 0
let docsearchLoader: Promise<typeof import('@docsearch/js')> | undefined
let sidepanelLoader: Promise<typeof import('@docsearch/sidepanel-js')> | undefined
let lastFocusedElement: HTMLElement | null = null
let skipEventDocsearch = false
let skipEventSidepanel = false

watch(
  () => algoliaConfig.value?.options,
  (options) => {
    if (options)
      update(options)
  },
  { immediate: true },
)

onUnmounted(cleanup)

watch(
  () => props.openRequest?.nonce,
  () => {
    const req = props.openRequest
    if (!req)
      return

    if (req.target === 'search') {
      if (docsearchInstance?.isReady) {
        onBeforeOpen('docsearch', () => docsearchInstance?.open())
      }
      else {
        openOnReady = 'search'
      }
    }
    else if (req.target === 'toggleAskAi') {
      if (sidepanelInstance?.isOpen) {
        sidepanelInstance.close()
      }
      else {
        onBeforeOpen('sidepanel', () => sidepanelInstance?.open())
      }
    }
    else {
      // askAi - open sidepanel or fallback to docsearch modal
      if (sidepanelInstance?.isReady) {
        onBeforeOpen('sidepanel', () => sidepanelInstance?.open())
      }
      else if (sidepanelInstance) {
        openOnReady = 'askAi'
      }
      else if (docsearchInstance?.isReady) {
        onBeforeOpen('docsearch', () => docsearchInstance?.openAskAi())
      }
      else {
        openOnReady = 'askAi'
      }
    }
  },
  { immediate: true },
)

async function update(options: AlgoliaSearchOptions) {
  await nextTick()

  // Normalize askAi: string -> { assistantId }
  const askAi = typeof options.askAi === 'string'
    ? { assistantId: options.askAi }
    : options.askAi || undefined

  const appId = options.appId ?? askAi?.appId
  const apiKey = options.apiKey ?? askAi?.apiKey
  const indexName = options.indexName ?? askAi?.indexName

  if (!appId || !apiKey || !indexName) {
    console.warn('[valaxy-theme-press] Algolia search cannot be initialized: missing appId/apiKey/indexName.')
    return
  }

  await initialize({ ...options, appId, apiKey, indexName })
}

async function initialize(userOptions: AlgoliaSearchOptions) {
  const currentInitialize = ++initializeCount

  // Always tear down previous instances first
  cleanup()

  const { askAi: _askAi, locales: _locales, mode: _mode, ...docSearchUserOptions } = userOptions
  // Normalize askAi: string -> { assistantId }
  const askAi = typeof _askAi === 'string'
    ? { assistantId: _askAi }
    : _askAi || undefined

  const { default: docsearch } = await loadDocsearch()
  if (currentInitialize !== initializeCount)
    return

  // Initialize sidepanel if askAi.sidePanel is configured
  if (askAi?.sidePanel) {
    const { default: sidepanel } = await loadSidepanel()
    if (currentInitialize !== initializeCount)
      return

    const sidePanelConfig = askAi.sidePanel === true ? {} : askAi.sidePanel

    sidepanelInstance = sidepanel({
      ...sidePanelConfig,
      container: '#press-docsearch-sidepanel',
      indexName: askAi.indexName ?? docSearchUserOptions.indexName,
      appId: askAi.appId ?? docSearchUserOptions.appId,
      apiKey: askAi.apiKey ?? docSearchUserOptions.apiKey,
      assistantId: askAi.assistantId,
      onOpen: focusInput,
      onClose: onClose.bind(null, 'sidepanel'),
      onReady: () => {
        if (openOnReady === 'askAi') {
          openOnReady = null
          onBeforeOpen('sidepanel', () => sidepanelInstance?.open())
        }
      },
      keyboardShortcuts: {
        'Ctrl/Cmd+I': false,
      },
    } as SidepanelProps)
  }

  const options: DocSearchProps = {
    ...docSearchUserOptions as DocSearchProps,
    container: '#press-docsearch',
    navigator: {
      navigate(item) {
        const { pathname, hash } = new URL(item.itemUrl, location.origin)
        router.push(pathname + hash)
      },
    },
    transformItems: items =>
      items.map(item => ({
        ...item,
        url: getRelativePath(item.url),
      })),
    // When sidepanel is enabled, intercept Ask AI events to open it instead
    ...(sidepanelInstance && {
      interceptAskAiEvent: (initialMessage: any) => {
        onBeforeOpen('sidepanel', () => sidepanelInstance?.open(initialMessage))
        return true
      },
    }),
    onOpen: focusInput,
    onClose: onClose.bind(null, 'docsearch'),
    onReady: () => {
      if (openOnReady === 'search') {
        openOnReady = null
        onBeforeOpen('docsearch', () => docsearchInstance?.open())
      }
      else if (openOnReady === 'askAi' && !sidepanelInstance) {
        openOnReady = null
        onBeforeOpen('docsearch', () => docsearchInstance?.openAskAi())
      }
    },
    keyboardShortcuts: {
      '/': false,
      'Ctrl/Cmd+K': false,
    },
  }

  docsearchInstance = docsearch(options)

  cleanup = () => {
    docsearchInstance?.destroy()
    sidepanelInstance?.destroy()
    docsearchInstance = undefined
    sidepanelInstance = undefined
    openOnReady = null
    lastFocusedElement = null
  }
}

function focusInput() {
  requestAnimationFrame(() => {
    const input
      = document.querySelector<HTMLInputElement>('#docsearch-input')
        || document.querySelector<HTMLInputElement>('#docsearch-sidepanel textarea')
    input?.focus()
  })
}

function onBeforeOpen(target: 'docsearch' | 'sidepanel', cb: () => void) {
  if (target === 'docsearch') {
    if (sidepanelInstance?.isOpen) {
      skipEventSidepanel = true
      sidepanelInstance.close()
    }
    else if (!docsearchInstance?.isOpen) {
      if (document.activeElement instanceof HTMLElement)
        lastFocusedElement = document.activeElement
    }
  }
  else if (target === 'sidepanel') {
    if (docsearchInstance?.isOpen) {
      skipEventDocsearch = true
      docsearchInstance.close()
    }
    else if (!sidepanelInstance?.isOpen) {
      if (document.activeElement instanceof HTMLElement)
        lastFocusedElement = document.activeElement
    }
  }
  setTimeout(cb, 0)
}

function onClose(target: 'docsearch' | 'sidepanel') {
  if (target === 'docsearch') {
    if (skipEventDocsearch) {
      skipEventDocsearch = false
      return
    }
  }
  else if (target === 'sidepanel') {
    if (skipEventSidepanel) {
      skipEventSidepanel = false
      return
    }
  }
  if (lastFocusedElement) {
    lastFocusedElement.focus()
    lastFocusedElement = null
  }
}

function loadDocsearch() {
  if (!docsearchLoader)
    docsearchLoader = import('@docsearch/js')
  return docsearchLoader
}

function loadSidepanel() {
  if (!sidepanelLoader)
    sidepanelLoader = import('@docsearch/sidepanel-js')
  return sidepanelLoader
}

function getRelativePath(url: string) {
  const { pathname, hash } = new URL(url, location.origin)
  return pathname.replace(/\.html$/, '') + hash
}
</script>

<template>
  <div id="press-docsearch" />
  <div id="press-docsearch-sidepanel" />
</template>
