<script lang="ts" setup>
import type { NavItemLink } from '../../types'
defineProps<{
  text?: string
  // todo
  items: NavItemLink[]
}>()
</script>

<template>
  <div class="VPNavScreenMenuGroupSection">
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
.VPNavScreenMenuGroupSection {
  display: block;
}

.title {
  line-height: 32px;
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
}
</style>
