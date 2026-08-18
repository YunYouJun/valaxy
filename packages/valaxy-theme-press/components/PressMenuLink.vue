<script lang="ts" setup>
import type { NavItemLink } from '../types'
import { NavigationMenuLink } from 'reka-ui'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

defineProps<{
  item: NavItemLink
}>()

const { t } = useI18n()
const route = useRoute()
</script>

<template>
  <div class="menu-link w-full">
    <NavigationMenuLink :active="route.path === item.link" as-child>
      <AppLink
        class="menu-item"
        p="x-3"
        :to="item.link"
      >
        {{ item.text.includes(".") ? t(item.text) : item.text }}
      </AppLink>
    </NavigationMenuLink>
  </div>
</template>

<style lang="scss" scoped>
.menu-link{
  .menu-item {
    display: flex;
    width: 100%;
    border-radius: 6px;
    color: var(--pr-nav-text);
    line-height: 32px;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    transition:
      background-color 0.25s,
      color 0.25s;

    &:hover {
      background-color: #f1f1f1;
      color: var(--va-c-brand);

      .dark & {
        background-color: #2f2f2f;
      }
    }
  }
}
</style>
