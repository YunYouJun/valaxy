<script lang="ts" setup>
import { useLocaleConfig } from '../composables'

const { localeConfig } = useLocaleConfig()
</script>

<template>
  <div class="pr-nav-bar-menu flex" h="full">
    <template v-for="item in localeConfig.nav" :key="item.text">
      <PressNavItemLink v-if="'link' in item" class="px-2" :item="item" />
      <PressNavItemGroup v-else class="px-2" :item="item" />
    </template>
  </div>
</template>

<style scoped>
.pr-nav-bar-menu {
  flex-shrink: 0;
}

@media (width < 1024px) {
  .pr-nav-bar-menu {
    display: none;
  }
}
</style>
