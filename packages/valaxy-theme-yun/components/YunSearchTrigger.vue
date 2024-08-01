<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useEventListener } from '@vueuse/core'

const siteConfig = useSiteConfig()

const isAlgolia = computed(() => siteConfig.value.search.type === 'algolia')
const isFuse = computed(() => siteConfig.value.search.type === 'fuse')

const open = ref(false)

function togglePopup() {
  open.value = !open.value
}

function handleSearchHotKey(event: KeyboardEvent) {
  if (
    (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey))
  ) {
    event.preventDefault()
    togglePopup()
  }
}

const algoliaRef = ref()
onMounted(() => {
  // algolia has its own hotkey
  if (isFuse.value)
    useEventListener('keydown', handleSearchHotKey)
})

function openSearch() {
  open.value = true

  if (isAlgolia.value) {
    algoliaRef.value.load()
    algoliaRef.value.dispatchEvent()
  }
}

function closeSearch() {
  open.value = false
}

const YunAlgoliaSearch = isAlgolia.value
  ? defineAsyncComponent(() => import('./third/YunAlgoliaSearch.vue'))
  : () => null
</script>

<template>
  <YunSearchBtn :open="open && !isAlgolia" @open="openSearch" @close="closeSearch" />

  <YunAlgoliaSearch v-if="isAlgolia" ref="algoliaRef" :open="open" @close="closeSearch" />
  <YunFuseSearch v-else-if="isFuse" :open="open" @close="closeSearch" />
</template>
