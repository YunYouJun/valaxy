<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { computed, defineAsyncComponent, ref } from 'vue'

// ref vitepress search box
const siteConfig = useSiteConfig()
const isAlgolia = computed(() => siteConfig.value.search.provider === 'algolia')
const isFuse = computed(() => siteConfig.value.search.provider === 'fuse')

const PressAlgoliaSearch = isAlgolia.value && defineAsyncComponent({
  loader: () => import('./PressAlgoliaSearch.vue'),
  errorComponent: import('./PressFuseSearchModal.vue'),
})

const algoliaSearchRef = ref<{ loaded: boolean, load: () => void, dispatchEvent: () => void } | null>(null)

function openAlgoliaSearch() {
  const search = algoliaSearchRef.value
  if (search) {
    if (search.loaded)
      search.dispatchEvent()
    else
      search.load()
  }
}
</script>

<template>
  <div v-if="siteConfig.search.enable" class="VPNavBarSearch">
    <ClientOnly>
      <PressAlgoliaSearch v-if="isAlgolia" ref="algoliaSearchRef" />
    </ClientOnly>

    <PressFuseSearch v-if="isFuse" />

    <PressNavBarAskAiButton v-if="isAlgolia" @click="openAlgoliaSearch" />
  </div>
</template>

<style>
/* stylelint-disable selector-class-pattern */
.VPNavBarSearch {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (width >= 768px) {
  .VPNavBarSearch {
    flex-grow: 1;
    padding-left: 24px;
  }
}

@media (width >= 960px) {
  .VPNavBarSearch {
    padding-left: 32px;
  }
}
</style>
