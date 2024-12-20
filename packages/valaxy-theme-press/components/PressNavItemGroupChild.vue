<script lang="ts" setup>
import type { NavItemLink } from '../types'
import PressMenuLink from './PressMenuLink.vue'

defineProps<{
  text?: string
  items: NavItemLink[]
}>()
</script>

<template>
  <div class="menu-group-item">
    <p v-if="text" class="title">
      {{ text }}
    </p>
    <template v-for="item in items" :key="item.link">
      <PressMenuLink v-if="'link' in item" :item="item" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.menu-group-item {
  display: block;
  margin: 12px -12px 0;
  border-top: 1px solid rgb(60 60 60 / 0.12);
  padding: 12px 12px 0;

  .title {
    padding: 0 12px;
    line-height: 28px;
    font-size: 14px;
    font-weight: 600;
    color: rgb(60 60 60 / 0.33);
    white-space: nowrap;
    transition: color 0.25s;
  }

  &:first-child {
    margin-top: 0;
    border-top: 0;
    padding-top: 0;
  }
}
</style>
