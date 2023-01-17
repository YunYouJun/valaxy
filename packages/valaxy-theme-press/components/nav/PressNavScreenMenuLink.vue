<script lang="ts" setup>
import { inject } from 'vue'

defineProps<{
  text: string
  link: string
}>()

const closeScreen = inject('close-screen') as () => void
</script>

<template>
  <AppLink class="VPNavScreenMenuLink" :href="link" @click="closeScreen">
    {{ text }}
  </AppLink>
</template>

<style scoped>
.VPNavScreenMenuLink {
  display: block;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 12px 0 11px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: border-color 0.25s, color 0.25s;
}

.VPNavScreenMenuLink:hover {
  color: var(--vp-c-brand);
}
</style>
