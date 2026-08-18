<script lang="ts" setup>
import type { NavItemLink } from '../types'
import { NavigationMenuItem, NavigationMenuLink } from 'reka-ui'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

defineProps<{
  item: NavItemLink
}>()

const route = useRoute()

const { t } = useI18n()
</script>

<template>
  <NavigationMenuItem class="press-nav-item" h="full">
    <NavigationMenuLink :active="route.path === item.link" as-child>
      <AppLink
        class="press-nav-item-link flex justify-center items-center"
        h="full"
        :class="{
          active: route.path === item.link,
        }"
        :to="item.link"
        rel="noopener"
        show-external-icon
      >
        {{ t(item.text) }}
      </AppLink>
    </NavigationMenuLink>
  </NavigationMenuItem>
</template>

<style lang="scss" scoped>
.press-nav-item {
  list-style: none;
}

.press-nav-item-link{
  height: 100%;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  color: var(--pr-nav-text);
  transition: color var(--va-transition-duration);

  &:hover{
    color: var(--va-c-brand);
  }
}

.active{
  color: var(--va-c-brand);
}
</style>
