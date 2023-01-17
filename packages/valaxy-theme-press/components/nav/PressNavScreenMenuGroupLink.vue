<script lang="ts" setup>
import { inject } from 'vue'

defineProps<{
  text: string
  link: string
}>()

const closeScreen = inject('close-screen') as () => void
</script>

<template>
  <AppLink class="pr-nav-screen-menu-group-link" :href="link" @click="closeScreen">
    {{ text }}
  </AppLink>
</template>

<style scoped>
.pr-nav-screen-menu-group-link {
  display: block;
  margin-left: 12px;
  line-height: 32px;
  font-size: 14px;
  font-weight: 400;
  color: var(--pr-c-text-1);
  transition: color 0.25s;
}

.pr-nav-screen-menu-group-link:hover {
  color: var(--pr-c-brand);
}
</style>
