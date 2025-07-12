<script setup lang="ts">
import type { AlgoliaSearchOptions } from '../types'
import docsearch from '@docsearch/js'
import { nextTick, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAddonAlgoliaConfig } from '../client'
import '@docsearch/css'

const router = useRouter()

const algolia = useAddonAlgoliaConfig()

const { locale } = useI18n()

type DocSearchProps = Parameters<typeof docsearch>[0]

onMounted(update)
watch(locale, update)

async function update() {
  await nextTick()
  const options = {
    ...algolia.value.options!,
    ...algolia.value.options?.locales?.[locale.value],
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

  initialize({
    ...options,
    searchParameters: {
      ...options.searchParameters,
      // facetFilters,
    },
  })
}

function initialize(userOptions: AlgoliaSearchOptions) {
  // note: multi-lang search support is removed since the theme
  // doesn't support multiple locales as of now.
  const options = Object.assign<object, AlgoliaSearchOptions, Partial<DocSearchProps>>(
    {},
    userOptions,
    {
      container: '#docsearch',

      navigator: {
        navigate({ itemUrl }) {
          router.push(itemUrl)
        },
      },
      transformItems(items) {
        return items.map((item) => {
          return Object.assign({}, item, {
            url: getRelativePath(item.url),
          })
        })
      },
    },
  ) as DocSearchProps

  docsearch(options)
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
