<script lang="ts" setup>
import { NavigationMenuList, NavigationMenuRoot } from 'reka-ui'
import { useLocaleConfig } from '../composables'

const { localeConfig } = useLocaleConfig()
</script>

<template>
  <NavigationMenuRoot
    as="div"
    class="pr-nav-bar-menu"
    h="full"
    :delay-duration="0"
  >
    <NavigationMenuList class="pr-nav-bar-menu-list">
      <template v-for="item in localeConfig.nav" :key="item.text">
        <PressNavItemLink v-if="'link' in item" class="px-2" :item="item" />
        <PressNavItemGroup v-else class="px-2" :item="item" />
      </template>
    </NavigationMenuList>
  </NavigationMenuRoot>
</template>

<style>
.pr-nav-bar-menu {
  display: none;
  flex-shrink: 0;
}

.pr-nav-bar-menu-list {
  display: flex;
  align-items: stretch;
  margin: 0;
  padding: 0;
  height: 100%;
  list-style: none;
}

@media (width >= 1024px) {
  .pr-nav-bar-menu {
    display: flex;
  }
}
</style>
