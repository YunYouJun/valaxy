<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useHotKey } from '../composables'

const siteConfig = useSiteConfig()

const isAlgolia = computed(() => siteConfig.value.search.type === 'algolia')
const isFuse = computed(() => siteConfig.value.search.type === 'fuse')

const open = ref(false)

function togglePopup() {
  open.value = !open.value
}

const algoliaRef = ref()
onMounted(() => {
  // algolia has its own hotkey handling in YunAlgoliaSearch component
  if (isFuse.value)
    useHotKey('k', togglePopup)
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
