<script lang="ts" setup>
import type { NavItemWithChildren } from '../types'
import { NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger } from 'reka-ui'
import { useI18n } from 'vue-i18n'
import PressMenuLink from './PressMenuLink.vue'
import PressNavItemGroupChild from './PressNavItemGroupChild.vue'

defineProps<{
  item: NavItemWithChildren
}>()

const { t } = useI18n()
</script>

<template>
  <NavigationMenuItem
    class="press-nav-item-group relative"
    h="full"
  >
    <NavigationMenuTrigger
      class="button flex items-center bg-transparent"
      h="full"
    >
      <span v-if="item.text" class="text">
        {{ item.text.includes(".") ? t(item.text) : item.text }}
      </span>
      <div i-ri-arrow-drop-down-line />
    </NavigationMenuTrigger>

    <NavigationMenuContent class="press-nav-menu-content grow" flex="~ col" items="start">
      <template v-for="itemLink in item.items" :key="JSON.stringify(itemLink)">
        <PressMenuLink v-if="'link' in itemLink" :item="itemLink" />
        <PressNavItemGroupChild
          v-else
          :text="itemLink.text"
          :items="itemLink.items"
        />
      </template>
    </NavigationMenuContent>
  </NavigationMenuItem>
</template>

<style lang="scss">
.press-nav-item-group {
  list-style: none;
}

.press-nav-item-group .button {
  height: 100%;
  color: var(--pr-nav-text);
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

.press-nav-item-group .button[data-state="open"] {
  color: rgb(60 60 60 / 0.70);
  transition: color var(--va-transition-duration);

  .dark & {
    color: rgb(235 235 235 / 0.6)
  }
}

.press-nav-menu-content {
  position: absolute;
  top: 20px;
  left: 50%;
  min-width: 128px;
  transform: translateX(-50%) translateY(calc(var(--pr-nav-height) / 2));
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgb(60 60 60 / 0.12);
  background-color: #fff;
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.1), 0 2px 6px rgb(0 0 0 / 0.08);

  .dark & {
    background-color: #242424;
  }
}
</style>
