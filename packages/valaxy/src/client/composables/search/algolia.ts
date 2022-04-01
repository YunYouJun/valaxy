import { isClient, useScriptTag } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const algoliasearchUrl = 'https://cdn.jsdelivr.net/npm/algoliasearch@4/dist/algoliasearch-lite.umd.js'
const instantsearchUrl = 'https://cdn.jsdelivr.net/npm/instantsearch.js@4/dist/instantsearch.production.min.js'

export function useAlgoliaSearch(config: {
  appId: string
  apiKey: string
  indexName: string
  hits: {
    per_page: number
  }
}) {
  if (!isClient) return

  const route = useRoute()
  const { t } = useI18n()

  useScriptTag(algoliasearchUrl, () => {
    useScriptTag(instantsearchUrl, () => {
      const algoliaSettings = config
      const { indexName, appId, apiKey } = algoliaSettings

      const search = window.instantsearch({
        indexName,
        searchClient: window.algoliasearch(appId, apiKey),
        searchFunction: (helper: { search: () => void }) => {
          const searchInput = document.querySelector('.search-input') as HTMLInputElement
          if (searchInput.value)
            helper.search()
        },
      })

      // Registering Widgets
      search.addWidgets([
        window.instantsearch.widgets.configure({
          hitsPerPage: algoliaSettings.hits.per_page || 8,
        }),

        window.instantsearch.widgets.searchBox({
          container: '.search-input-container',
          placeholder: t('search.placeholder'),
          // Hide default icons of algolia search
          showReset: false,
          showSubmit: false,
          showLoadingIndicator: false,
          cssClasses: {
            input: 'search-input',
          },
        }),

        window.instantsearch.widgets.stats({
          container: '#algolia-stats',
          templates: {
            text: (data: any) => {
              const stats = t('search.hits_time', {
                hits: data.nbHits,
                time: data.processingTimeMS,
              })
              return `<span>${stats}</span>
          <a href="https://www.algolia.com/" target="_blank" class="algolia-powered">
            <img src="https://simpleicons.org/icons/algolia.svg" alt="Algolia">
          </a>
          `
            },
          },
        }),

        window.instantsearch.widgets.hits({
          container: '#algolia-hits',
          templates: {
            item: (data: any) => {
              const link = data.permalink ? data.permalink : route.path
              return `<a href="${link}" class="algolia-hit-item-link">
              ${data._highlightResult.title.value}
              <small>${data._highlightResult.slug.value}</small>
              </a>`
            },
            empty: (data: any) => {
              return `<div id="algolia-hits-empty">${t('search.empty', data.query)}</div>`
            },
          },
          cssClasses: {
            item: 'algolia-hit-item',
          },
        }),

        window.instantsearch.widgets.pagination({
          container: '#algolia-pagination',
          scrollTo: false,
          showFirst: false,
          showLast: false,
          templates: {
            first: '<div i-ri-arrow-left-line></div>',
            last: '<div i-ri-arrow-right-line></div>',
            previous: '<div i-ri-arrow-left-s-line></div>',
            next: '<div i-ri-arrow-right-s-line></div>',
          },
          cssClasses: {
            root: 'pagination',
            item: 'page-number',
            link: 'page-number',
            selectedItem: 'active',
            disabledItem: 'disabled-item',
          },
        }),
      ])

      search.start()
    })
  })
}
