<script lang="ts" setup>
import type { NavItemLink } from '../types'

defineProps<{
  text?: string
  // todo
  items: NavItemLink[]
}>()
</script>

<template>
  <div class="pr-nav-screen-menu-group-section">
    <p v-if="text" class="title">
      {{ text }}
    </p>
    <PressNavScreenMenuGroupLink
      v-for="item in items"
      :key="item.text"
      :text="item.text"
      :link="item.link"
    />
  </div>
</template>

<style scoped>
.pr-nav-screen-menu-group-section {
  display: block;
}

.title {
  line-height: 32px;
  font-size: 13px;
  font-weight: 700;
  color: var(--pr-c-text-2);
  transition: color 0.25s;
}
</style>
