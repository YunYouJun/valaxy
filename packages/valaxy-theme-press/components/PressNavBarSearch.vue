<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { computed, defineAsyncComponent } from 'vue'

// ref vitepress search box
const siteConfig = useSiteConfig()
const isAlgolia = computed(() => siteConfig.value.search.type === 'algolia')

const PressAlgoliaSearch = isAlgolia.value
  ? defineAsyncComponent(() => import('./PressAlgoliaSearch.vue'))
  : () => null
</script>

<template>
  <div v-if="siteConfig.search.enable" class="VPNavBarSearch">
    <ClientOnly>
      <PressAlgoliaSearch v-if="isAlgolia" />
    </ClientOnly>
  </div>
</template>

<style>
/* stylelint-disable selector-class-pattern */
.VPNavBarSearch {
  display: flex;
  align-items: center;
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
