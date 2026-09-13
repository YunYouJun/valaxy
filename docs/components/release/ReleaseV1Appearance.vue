<script setup lang="ts">
import { useAppStore } from 'valaxy'
import { onMounted, ref } from 'vue'

defineProps<{ label: string }>()
const appStore = useAppStore()
// Storage is client-only; keep the server and first hydration render identical.
const mounted = ref(false)
onMounted(() => mounted.value = true)
</script>

<template>
  <button
    type="button"
    class="appearance-switch"
    role="switch"
    :aria-label="label"
    :aria-checked="mounted && appStore.isDark"
    :disabled="!mounted"
    @click="appStore.toggleDark()"
  >
    <svg class="appearance-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></svg>
    <svg class="appearance-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.2A8.5 8.5 0 0 1 9.8 4a8.5 8.5 0 1 0 10.2 10.2Z" /></svg>
  </button>
</template>

<style scoped>
.appearance-switch {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--release-border);
  border-radius: 50%;
  color: var(--release-text);
  background: var(--release-surface);
  flex-shrink: 0;
}

.appearance-switch svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentcolor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.appearance-moon,
.dark .appearance-sun {
  display: none;
}

.dark .appearance-moon {
  display: block;
}
</style>
