<script setup lang="ts">
import type { DocSearchProps as DocSearchAIProps, DocSearchInstance } from '@docsearch/js'
import type { DocSearchProps } from '@docsearch/js/docsearch'
import type { SidepanelInstance, SidepanelProps } from '@docsearch/sidepanel-js'
import type { AlgoliaSearchOptions } from '../types/algolia'
import { useAddonConfig } from 'valaxy'
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

import '../styles/docsearch.css'

const props = defineProps<{
  openRequest?: {
    target: 'search' | 'askAi' | 'toggleAskAi'
    nonce: number
  } | null
}>()

const router = useRouter()

const algoliaConfig = useAddonConfig<AlgoliaSearchOptions>('valaxy-addon-algolia')

let docsearchInstance: DocSearchInstance | undefined
let sidepanelInstance: SidepanelInstance | undefined
let openOnReady: 'search' | 'askAi' | null = null
let initializeCount = 0
let docsearchLoader: Promise<typeof import('@docsearch/js/docsearch')> | undefined
let docsearchAiLoader: Promise<typeof import('@docsearch/js')> | undefined
let sidepanelLoader: Promise<typeof import('@docsearch/sidepanel-js')> | undefined
let lastFocusedElement: HTMLElement | null = null
let skipEventDocsearch = false
let skipEventSidepanel = false

onMounted(() => watch(
  () => algoliaConfig.value?.options,
  (options) => {
    if (options)
      update(options)
  },
  { immediate: true },
))

onUnmounted(() => {
  ++initializeCount
  cleanup()
  openOnReady = null
  lastFocusedElement = null
})

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
  const currentInitialize = ++initializeCount
  await nextTick()
  if (currentInitialize !== initializeCount)
    return

  // Normalize askAi: string -> { agentId }
  const askAi = typeof options.askAi === 'string'
    ? { agentId: options.askAi }
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

  const {
    askAi: _askAi,
    locales: _locales,
    mode: _mode,
    indexName,
    searchParameters,
    translations,
    ...docSearchUserOptions
  } = userOptions
  // Normalize askAi: string -> { agentId }
  const normalizedAskAi = typeof _askAi === 'string'
    ? { agentId: _askAi }
    : _askAi || undefined
  const askAi = normalizedAskAi?.agentId ? normalizedAskAi : undefined
  if (normalizedAskAi && !askAi)
    console.warn('[valaxy-theme-press] Ask AI requires a published Agent Studio agentId. Migrate the legacy assistant in the Algolia dashboard.')

  // Initialize sidepanel if askAi.sidePanel is configured
  if (askAi?.sidePanel) {
    const { default: sidepanel } = await loadSidepanel()
    if (currentInitialize !== initializeCount)
      return

    const sidePanelConfig = askAi.sidePanel === true ? {} : askAi.sidePanel

    sidepanelInstance = sidepanel({
      ...sidePanelConfig,
      container: '#press-docsearch-sidepanel',
      appId: askAi.appId ?? docSearchUserOptions.appId,
      apiKey: askAi.apiKey ?? docSearchUserOptions.apiKey,
      agentId: askAi.agentId,
      indices: askAi.indices ?? [askAi.indexName ?? indexName],
      searchParameters: askAi.searchParameters,
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
    ...docSearchUserOptions as Omit<DocSearchProps, 'container' | 'indices'>,
    container: '#press-docsearch',
    indices: [{
      name: indexName,
      searchParameters: searchParameters as Exclude<DocSearchProps['indices'][number], string>['searchParameters'],
    }],
    translations: normalizeTranslations(translations),
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

  if (askAi) {
    const { default: docsearchAi } = await loadDocsearchAi()
    if (currentInitialize !== initializeCount)
      return

    const aiOptions: DocSearchAIProps = {
      ...options,
      askAi: {
        agentId: askAi.agentId,
        appId: askAi.appId,
        apiKey: askAi.apiKey,
        indices: askAi.indices ?? [askAi.indexName ?? indexName],
        searchParameters: askAi.searchParameters,
        suggestedQuestions: askAi.suggestedQuestions,
      },
      ...(sidepanelInstance && {
        interceptAskAiEvent: (initialMessage) => {
          onBeforeOpen('sidepanel', () => sidepanelInstance?.open(initialMessage))
          return true
        },
      }),
    }
    docsearchInstance = docsearchAi(aiOptions)
  }
  else {
    const { default: docsearch } = await loadDocsearch()
    if (currentInitialize !== initializeCount)
      return
    docsearchInstance = docsearch(options)
  }
}

function cleanup() {
  docsearchInstance?.destroy()
  sidepanelInstance?.destroy()
  docsearchInstance = undefined
  sidepanelInstance = undefined
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
    docsearchLoader = import('@docsearch/js/docsearch')
  return docsearchLoader
}

function loadDocsearchAi() {
  if (!docsearchAiLoader)
    docsearchAiLoader = import('@docsearch/js')
  return docsearchAiLoader
}

function loadSidepanel() {
  if (!sidepanelLoader)
    sidepanelLoader = import('@docsearch/sidepanel-js')
  return sidepanelLoader
}

function normalizeTranslations(translations: AlgoliaSearchOptions['translations']): DocSearchProps['translations'] {
  if (!translations)
    return undefined

  const modal = translations.modal as Record<string, any> | undefined
  const searchBox = modal?.searchBox as Record<string, string> | undefined
  const footer = modal?.footer as Record<string, string> | undefined
  const { searchBox: _searchBox, footer: _footer, ...screenTranslations } = modal ?? {}
  return {
    button: translations.button,
    modal: {
      ...screenTranslations,
      searchBox: searchBox && {
        clearButtonTitle: searchBox.resetButtonTitle,
        clearButtonAriaLabel: searchBox.resetButtonAriaLabel,
        closeButtonText: searchBox.cancelButtonText,
        closeButtonAriaLabel: searchBox.cancelButtonAriaLabel,
      },
      footer: footer && {
        ...footer,
        poweredByText: footer.searchByText,
      },
    },
  }
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
