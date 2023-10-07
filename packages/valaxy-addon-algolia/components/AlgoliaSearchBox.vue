<script setup lang="ts">
import '@docsearch/css'
import docsearch from '@docsearch/js'
import type { DocSearchHit } from '@docsearch/react/dist/esm/types'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { AlgoliaSearchOptions } from '../types'
import { useAddonAlgoliaConfig } from '../client'

const router = useRouter()
const route = useRoute()

const algolia = useAddonAlgoliaConfig()

const { locale } = useI18n()

onMounted(() => {
  const options = {
    ...algolia.value.options,
    ...algolia.value.options?.locales?.[locale.value],
  }

  // now only lang:en
  // const rawFacetFilters = options.searchParameters?.facetFilters ?? []
  // const facetFilters = [
  //   ...(Array.isArray(rawFacetFilters)
  //     ? rawFacetFilters
  //     : [rawFacetFilters]
  //   ).filter(f => !f.startsWith('lang:')),
  //   `lang:${locale.value}`,
  // ]

  if (options && options.apiKey && options.appId && options.indexName) {
    if (!document.querySelector('.DocSearch-Container')) {
      initialize({
        ...options as AlgoliaSearchOptions,
        searchParameters: {
          ...options.searchParameters,
          // facetFilters,
        },
      })
    }
  }
})

function initialize(userOptions: AlgoliaSearchOptions) {
  // note: multi-lang search support is removed since the theme
  // doesn't support multiple locales as of now.
  const options = Object.assign({}, userOptions, {
    container: '#docsearch',
    navigator: {
      navigate({ itemUrl }: { itemUrl: string }) {
        const { pathname: hitPathname } = new URL(
          window.location.origin + itemUrl,
        )
        // router doesn't handle same-page navigation so we use the native
        // browser location API for anchor navigation
        if (route.path === hitPathname)
          window.location.assign(window.location.origin + itemUrl)

        else
          router.push(itemUrl)
      },
    },
    transformItems(items: DocSearchHit[]) {
      return items.map((item) => {
        return Object.assign({}, item, {
          url: getRelativePath(item.url),
        })
      })
    },
    hitComponent({ hit, children }: { hit: DocSearchHit; children: any }) {
      const relativeHit = hit.url.startsWith('http')
        ? getRelativePath(hit.url as string)
        : hit.url
      return {
        __v: null,
        type: 'a',
        ref: undefined,
        constructor: undefined,
        key: undefined,
        props: {
          href: hit.url,
          onClick(event: MouseEvent) {
            if (isSpecialClick(event))
              return

            // we rely on the native link scrolling when user is already on
            // the right anchor because Router doesn't support duplicated
            // history entries.
            if (route.path === relativeHit)
              return

            // if the hits goes to another page, we prevent the native link
            // behavior to leverage the Router loading feature.
            if (route.path !== relativeHit)
              event.preventDefault()

            router.push(relativeHit)
          },
          children,
        },
      }
    },
  })
  docsearch(options)
}

function isSpecialClick(event: MouseEvent) {
  return (
    event.button === 1
    || event.altKey
    || event.ctrlKey
    || event.metaKey
    || event.shiftKey
  )
}

function getRelativePath(absoluteUrl: string) {
  const { pathname, hash } = new URL(absoluteUrl)
  return pathname + hash
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
