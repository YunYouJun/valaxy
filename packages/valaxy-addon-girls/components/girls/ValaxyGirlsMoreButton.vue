<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  count: number
  mode?: 'expand' | 'more'
}>(), {
  mode: 'more',
})

const emit = defineEmits<{
  click: []
}>()

const { t } = useI18n()
const label = computed(() => props.mode === 'expand'
  ? t('addon.girls.expand', { count: props.count }, `Show ${props.count} more characters`)
  : t('addon.girls.more', { count: props.count }, `Load ${props.count} more characters`))
</script>

<template>
  <button class="valaxy-girls-more" type="button" @click="emit('click')">
    <span>{{ label }}</span>
    <span class="i-ri-arrow-down-s-line" aria-hidden="true" />
  </button>
</template>

<style scoped>
.valaxy-girls-more {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.55rem 0.95rem;
  color: var(--valaxy-girls-muted);
  background: color-mix(in srgb, var(--valaxy-girls-paper) 88%, transparent);
  border: 1px solid var(--valaxy-girls-line);
  border-radius: 999px;
  box-shadow: 0 0.25rem 0.75rem rgb(31 46 64 / 0.06);
  font: inherit;
  font-size: 0.7rem;
  cursor: pointer;
  transition:
    border-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.valaxy-girls-more:hover {
  color: var(--valaxy-girls-sky-deep);
  border-color: var(--valaxy-girls-sky);
  transform: translateY(-0.08rem);
}

.valaxy-girls-more:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--valaxy-girls-sky) 48%, transparent);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .valaxy-girls-more {
    transition: none;
  }
}
</style>
