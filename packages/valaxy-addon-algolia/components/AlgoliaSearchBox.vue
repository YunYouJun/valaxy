<script setup lang="ts">
import type { DocSearchProps as DocSearchAIProps } from '@docsearch/js'
import type { DocSearchInstance, DocSearchProps } from '@docsearch/js/docsearch'
import type { AlgoliaSearchOptions } from '../types'
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAddonAlgoliaConfig } from '../client'
import '@docsearch/css'

const router = useRouter()

const algolia = useAddonAlgoliaConfig()

const { locale } = useI18n()

type DocSearchIndex = Exclude<DocSearchProps['indices'][number], string>

let docsearchInstance: DocSearchInstance | undefined
let initializeCount = 0

onMounted(() => watch([locale, () => algolia.value?.options], update, { immediate: true, deep: true }))
onUnmounted(() => {
  ++initializeCount
  docsearchInstance?.destroy()
})

async function update() {
  const currentInitialize = ++initializeCount
  await nextTick()
  if (currentInitialize !== initializeCount)
    return

  docsearchInstance?.destroy()
  docsearchInstance = undefined
  if (!algolia.value?.options)
    return

  const options = {
    ...algolia.value!.options!,
    ...algolia.value!.options?.locales?.[locale.value],
  }

  // now only lang:en
  // const rawFacetFilters = options.searchParameters?.facetFilters ?? []
  // const facetFilters = [
  //   ...(Array.isArray(rawFacetFilters)
  //     ? rawFacetFilters
  //     : [rawFacetFilters]
  //   ).filter(f => !f.startsWith('lang:')),
  //   `lang:${lang.value}`,
  // ]

  await initialize({
    ...options,
    searchParameters: {
      ...options.searchParameters,
      // facetFilters,
    },
  }, currentInitialize)
}

async function initialize(userOptions: AlgoliaSearchOptions, currentInitialize: number) {
  const { askAi: rawAskAi, locales: _locales, mode: _mode, indexName, searchParameters, translations, ...restOptions } = userOptions
  const normalizedAskAi = typeof rawAskAi === 'string' ? { agentId: rawAskAi } : rawAskAi
  const askAi = normalizedAskAi?.agentId ? normalizedAskAi : undefined
  if (normalizedAskAi && !askAi)
    console.warn('[valaxy-addon-algolia] Ask AI requires a published Agent Studio agentId. Migrate the legacy assistant in the Algolia dashboard.')

  const options: DocSearchProps = {
    ...restOptions,
    container: '#docsearch',
    indices: [{
      name: indexName,
      searchParameters: searchParameters as DocSearchIndex['searchParameters'],
    }],
    translations: normalizeTranslations(translations),

    navigator: {
      navigate({ itemUrl }) {
        router.push(itemUrl)
      },
    },
    transformItems(items) {
      return items.map((item) => {
        return { ...item, ...{
          url: getRelativePath(item.url),
        } }
      })
    },
  }

  if (askAi) {
    const { default: docsearchAi } = await import('@docsearch/js')
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
    }
    docsearchInstance = docsearchAi(aiOptions)
  }
  else {
    const { default: docsearch } = await import('@docsearch/js/docsearch')
    if (currentInitialize !== initializeCount)
      return
    docsearchInstance = docsearch(options)
  }
}

function normalizeTranslations(translations: AlgoliaSearchOptions['translations']): DocSearchProps['translations'] {
  if (!translations)
    return undefined

  const { searchBox, footer, ...screenTranslations } = translations.modal ?? {}
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
  <div id="docsearch" />
</template>

<style lang="scss">
/* stylelint-disable selector-class-pattern */
.DocSearch {
  --docsearch-primary-color: var(--va-c-primary);
  --docsearch-highlight-color: var(--docsearch-primary-color);
  --docsearch-text-color: var(--va-c-text-primary);
  --docsearch-muted-color: var(--va-c-text-light);
  --docsearch-searchbox-focus-background: transparent;
  --docsearch-searchbox-shadow: none;
  --docsearch-key-gradient: transparent;
  --docsearch-key-shadow: none;
  --docsearch-modal-background: var(--va-c-bg-light);
  --docsearch-footer-background: var(--va-c-bg);

  input {
    &::placeholder {
      color: var(--va-c-text-dark);
    }
  }
}

.dark .DocSearch {
  --docsearch-modal-shadow: none;
  --docsearch-footer-shadow: none;
  --docsearch-logo-color: var(--va-c-text-light);
  --docsearch-hit-background: var(--va-c-bg-mute);
  --docsearch-hit-color: var(--va-c-text-light);
  --docsearch-hit-shadow: none;
}

.DocSearch-Form {
  border: 1px solid var(--va-c-primary);
}
</style>
