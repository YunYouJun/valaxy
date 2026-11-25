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
  min-height: 2.5rem;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  color: var(--valaxy-girls-muted);
  background: var(--valaxy-girls-paper);
  border: 1px solid var(--valaxy-girls-line);
  border-radius: 999px;
  box-shadow: var(--valaxy-girls-shadow);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .valaxy-girls-more:hover {
    color: var(--valaxy-girls-sky);
    border-color: var(--valaxy-girls-hover-line);
    box-shadow: var(--valaxy-girls-hover-shadow);

    @media (prefers-reduced-motion: no-preference) {
      transform: translateY(-1px);
    }
  }
}

.valaxy-girls-more:focus-visible {
  outline: 2px solid var(--valaxy-girls-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .valaxy-girls-more {
    transition: none;
  }
}
</style>
