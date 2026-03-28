<script lang="ts" setup>
import type { LocalSearchResult } from '../composables/search/useLocalSearch'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalSearch } from '../composables/search/useLocalSearch'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const query = ref('')
const { results, loading, load } = useLocalSearch(query)
const selectedIndex = ref(0)

const router = useRouter()

watch(() => props.open, (val) => {
  if (val) {
    load()
    selectedIndex.value = 0
  }
  else {
    query.value = ''
  }
})

watch(results, () => {
  selectedIndex.value = 0
})

function getPageTitle(id: string): string {
  return id.replace(/#.*$/, '').replace(/\.html$/, '') || '/'
}

function getSectionTitle(result: LocalSearchResult): string {
  return [...result.titles, result.title].filter(Boolean).join(' > ')
}

function navigate(result: LocalSearchResult) {
  const url = result.id
  router.push(url)
  emit('close')
}

function updateQuery(value: string) {
  query.value = value
}

function onKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      e.preventDefault()
      if (results.value[selectedIndex.value]) {
        navigate(results.value[selectedIndex.value])
      }
      break
    case 'Escape':
      e.preventDefault()
      emit('close')
      break
  }
}
</script>

<template>
  <slot
    :query="query"
    :results="results"
    :loading="loading"
    :selected-index="selectedIndex"
    :update-query="updateQuery"
    :navigate="navigate"
    :on-keydown="onKeydown"
    :get-page-title="getPageTitle"
    :get-section-title="getSectionTitle"
  />
</template>
