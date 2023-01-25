<script lang="ts" setup>
import { inject } from 'vue'

defineProps<{
  text: string
  link: string
}>()

const closeScreen = inject('close-screen') as () => void
</script>

<template>
  <AppLink class="pr-nav-screen-menu-link" :href="link" @click="closeScreen">
    {{ text }}
  </AppLink>
</template>

<style scoped>
.pr-nav-screen-menu-link {
  display: block;
  border-bottom: 1px solid var(--pr-c-divider);
  padding: 12px 0 11px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--pr-c-text-1);
  transition: border-color 0.25s, color 0.25s;
}

.pr-nav-screen-menu-link:hover {
  color: var(--pr-c-brand);
}
</style>
