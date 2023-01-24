<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'

// ref vitepress search box
const siteConfig = useSiteConfig()
const isAlgolia = computed(() => siteConfig.value.search.type === 'algolia')
</script>

<template>
  <div v-if="siteConfig.search.enable" class="VPNavBarSearch">
    <PressAlgoliaSearch v-if="isAlgolia" />
  </div>
</template>

<style>
.VPNavBarSearch {
  display: flex;
  align-items: center;
}

@media (min-width: 768px) {
  .VPNavBarSearch {
    flex-grow: 1;
    padding-left: 24px;
  }
}

@media (min-width: 960px) {
  .VPNavBarSearch {
    padding-left: 32px;
  }
}
</style>
