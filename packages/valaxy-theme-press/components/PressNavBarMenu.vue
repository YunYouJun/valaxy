<script lang="ts" setup>
import { useLocaleConfig } from '../composables'

const { localeConfig } = useLocaleConfig()
</script>

<template>
  <div class="flex lt-md:hidden" h="full">
    <template v-for="item in localeConfig.nav" :key="item.text">
      <PressNavItemLink v-if="'link' in item" class="px-2" :item="item" />
      <PressNavItemGroup v-else class="px-2" :item="item" />
    </template>
  </div>
</template>
