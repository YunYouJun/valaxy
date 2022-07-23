<script lang="ts" setup>
import { useRoute } from 'vue-router'
import type { NavItemLink } from 'types'
defineProps<{
  item: NavItemLink
}>()

const route = useRoute()
</script>

<template>
  <a
    class="press-nav-item-link p-x-3"
    :class="{
      active: route.path === item.link,
    }"
    :href="item.link"
    rel="noopener"
  >{{ item.text }}</a>
</template>

<style lang="scss" scoped>
.press-nav-item-link{
  font-size: 14px;
  font-weight: 500;
  color: var(--pr-nav-text);
  transition: color 0.25s;

  &:hover{
    color: var(--va-c-brand);
  }
}
.active{
  color: var(--va-c-brand);
}
</style>
