<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'

const siteConfig = useSiteConfig()

const isAlgolia = computed(() => siteConfig.value.search.type === 'algolia')
const isFuse = computed(() => siteConfig.value.search.type === 'fuse')

const open = ref(false)

function togglePopup() {
  open.value = !open.value
}

onMounted(() => {
  const handleSearchHotKey = (event: KeyboardEvent) => {
    if (
      (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey))
    ) {
      event.preventDefault()
      togglePopup()
    }
  }

  const remove = () => {
    window.removeEventListener('keydown', handleSearchHotKey)
  }

  window.addEventListener('keydown', handleSearchHotKey)

  onUnmounted(remove)
})

function openSearch() {
  open.value = true
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

  <YunAlgoliaSearch v-if="isAlgolia" :open="open" @close="closeSearch" />
  <YunFuseSearch v-else-if="isFuse" :open="open" @close="closeSearch" />
</template>
